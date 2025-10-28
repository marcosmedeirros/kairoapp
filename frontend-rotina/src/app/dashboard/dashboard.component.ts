import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Referência ao objeto Math para usar no template
  Math = Math;

  // Estatísticas gerais
  stats = {
    totalActivities: 0,
    todayActivities: 0,
    workoutsThisWeek: 0,
    weeklyExpense: 0
  };

  // guarda a lista de atividades do dia para a nova seção
  todaysActivities: any[] = [];

  // Calendário semanal (array de dias com itens agrupados)
  weekCalendar: { date: Date, label: string, items: any[] }[] = [];

  // Atividade do dia (preferência: activity -> training -> diet)
  activityOfDay: any | null = null;

  // Today's key for template comparisons (YYYY-MM-DD)
  todayKey: string = '';

  loading = false;
  errorMessage = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private safeGet(url: string) {
    return this.http.get<any[]>(url).pipe(catchError(err => {
      console.warn('Failed to fetch', url, err);
      return of([]);
    }));
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Fetch activities, diet logs and training notes concurrently
    forkJoin({
      activities: this.safeGet('/api/activities'),
      diet: this.safeGet('/api/diet'),
      training: this.safeGet('/api/training'),
      financeTx: this.safeGet('/api/finance/transactions')
    }).subscribe({
      next: (res: any) => {
        const activities = res.activities || [];
        const diet = res.diet || [];
        const training = res.training || [];
        const financeTx = res.financeTx || [];

        // Stats derived from activities
        this.stats.totalActivities = activities.length;

        const todayStr = this.formatDateKey(new Date());
        this.stats.todayActivities = activities.filter((a: any) => this.formatDateKey(a.date || a.localDate || a.dateTime || '') === todayStr).length;

        // Workouts this week from training notes (assume training items have 'date')
        const now = new Date();
        const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        this.stats.workoutsThisWeek = training.filter((n: any) => {
          const d = this.parseDate(n.date);
          return d && d >= weekAgo;
        }).length;

        // Weekly Expense: sum expenses in last 7 days
        const weeklyExpense = financeTx.reduce((sum: number, tx: any) => {
          if (!tx || String(tx.type).toUpperCase() !== 'EXPENSE') return sum;
          const d = this.parseDate(tx.date);
          if (!d || d < weekAgo) return sum;
          const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount || 0));
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        this.stats.weeklyExpense = Math.round(weeklyExpense * 100) / 100;

        // Weekly calendar and todays activities list
        this.weekCalendar = this.buildWeekCalendar(activities, training, diet);
        this.todayKey = todayStr;
        this.todaysActivities = activities.filter((a: any) => this.formatDateKey(a.date || a.localDate || a.dateTime || '') === todayStr)
          .sort((a: any, b: any) => {
            const ta = this.combineDateTime(a.date, a.time)?.getTime() || 0;
            const tb = this.combineDateTime(b.date, b.time)?.getTime() || 0;
            return ta - tb;
          });

        // Activity of the day kept for potential future use
        const todaysTraining = training.filter((t: any) => this.formatDateKey(t.date) === todayStr);
        const todaysDiet = diet.filter((dlog: any) => this.formatDateKey(dlog.date) === todayStr);
        if (this.todaysActivities.length) {
          this.activityOfDay = { type: 'calendar', item: this.todaysActivities[0] };
        } else if (todaysTraining.length) {
          this.activityOfDay = { type: 'training', item: todaysTraining[0] };
        } else if (todaysDiet.length) {
          this.activityOfDay = { type: 'diet', item: todaysDiet[0] };
        } else {
          this.activityOfDay = null;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.errorMessage = 'Erro ao carregar dados do servidor.';
        this.loading = false;
      }
    });
  }

  private buildWeekCalendar(activities: any[], training: any[], diet: any[]) {
    // returns array for current week Monday..Sunday
    const result: { date: Date, label: string, items: any[] }[] = [];
    const now = new Date();
    // get monday of current week
    const day = now.getDay(); // 0 Sun .. 6 Sat
    const diffToMonday = ((day + 6) % 7); // 0=>Mon, 6=>Sun
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const key = this.formatDateKey(d);
      // Use pt-BR locale for day labels (e.g. 'seg, 20')
      const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });

      // collect items whose date matches key
      const items: any[] = [];

      activities.forEach((a: any) => {
        if (this.formatDateKey(a.date || a.localDate || a.dateTime || '') === key) {
          items.push({ type: 'activity', source: a, name: a.title || 'Atividade', time: a.time || '' });
        }
      });
      training.forEach((t: any) => {
        if (this.formatDateKey(t.date) === key) {
          items.push({ type: 'training', source: t, name: 'Treino', time: t.date || '' });
        }
      });
      diet.forEach((di: any) => {
        if (this.formatDateKey(di.date) === key) {
          items.push({ type: 'diet', source: di, name: 'Alimentação', time: di.date || '' });
        }
      });

      // sort items by time if available
      items.sort((a, b) => {
        const ta = this.combineDateTime(a.source.date, a.source.time) || new Date(0);
        const tb = this.combineDateTime(b.source.date, b.source.time) || new Date(0);
        return ta.getTime() - tb.getTime();
      });

      result.push({ date: d, label: dayLabel, items });
    }

    return result;
  }

  // Format a date-like input into YYYY-MM-DD for equality checks
  private formatDateKey(input: any): string {
    const d = this.parseDate(input instanceof Date ? input : input);
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseDate(input: any): Date | null {
    if (!input) return null;
    try {
      if (input instanceof Date) return input;
      const s = String(input);
      // Ignora valores somente hora
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return null;
      // Trata YYYY-MM-DD (com ou sem sufixo extra) como data local
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        const y = Number(m[1]);
        const mon = Number(m[2]) - 1;
        const d = Number(m[3]);
        return new Date(y, mon, d);
      }
      // Fallback: tenta Date padrão
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) return dt;
    } catch {}
    return null;
  }

  private combineDateTime(datePart: any, timePart: any): Date | null {
    const d = this.parseDate(datePart);
    if (!d) return null;
    if (!timePart) return d;
    // timePart may be "HH:mm" or "HH:mm:ss"
    const t = String(timePart).split(':').map((p:any)=>Number(p));
    if (t.length >= 2) {
      d.setHours(t[0]);
      d.setMinutes(t[1]);
      d.setSeconds(t[2] || 0);
      return d;
    }
    return d;
  }

  getActivityIcon(type: string): string {
    const icons: any = {
      'cardio': '🏃',
      'training': '💪',
      'diet': '🍽️',
      'calendar': '📅',
      'default': '📋'
    };
    return icons[type] || icons['default'];
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return '#4caf50';
    if (progress >= 50) return '#ff9800';
    return '#f44336';
  }

  // Helper for template: count items on a week day
  itemsCountForDay(idx: number): number {
    if (!this.weekCalendar || !this.weekCalendar[idx]) return 0;
    return this.weekCalendar[idx].items.length;
  }

  // Helper: navigate or open item (for now we'll route to generic pages by type)
  openItem(item: any) {
    // This method is a placeholder. Ideally we would route to specific edit/view pages.
    if (!item) return;
    // For the dashboard we simply log for now — the template can link to pages instead.
    console.log('Open item', item);
  }
}
