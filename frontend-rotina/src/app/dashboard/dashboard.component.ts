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
    activeGoals: 0,
    completedGoals: 0,
    weekProgress: 0,
    workoutsThisWeek: 0
  };

  // Atividades recentes
  recentActivities: any[] = [];

  // Metas próximas do prazo
  upcomingGoals: any[] = [];

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

    // Fetch activities, diet logs, training notes and goals concurrently
    forkJoin({
      activities: this.safeGet('/api/activities'),
      diet: this.safeGet('/api/diet'),
      training: this.safeGet('/api/training'),
      goals: this.safeGet('/api/goals')
    }).subscribe({
      next: (res) => {
        const activities = res.activities || [];
        const diet = res.diet || [];
        const training = res.training || [];
        const goals = res.goals || [];

        // Stats derived from activities
        this.stats.totalActivities = activities.length;

        const todayStr = this.formatDateKey(new Date());
        this.stats.todayActivities = activities.filter(a => this.formatDateKey(a.date || a.localDate || a.dateTime || '') === todayStr).length;

        // Workouts this week from training notes (assume training items have 'date')
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        this.stats.workoutsThisWeek = training.filter(n => {
          const d = this.parseDate(n.date);
          return d && d >= weekAgo;
        }).length;

        // Goals
        this.stats.activeGoals = goals.filter((g: any) => !g.completed).length;
        this.stats.completedGoals = goals.filter((g: any) => g.completed).length;

        // weekProgress: average elapsed time percent for active goals that have start/end dates
        const activeWithDates = goals.filter((g: any) => !g.completed && g.startDate && g.endDate);
        const progressValues = activeWithDates.map((g: any) => this.computeGoalTimeProgress(g));
        this.stats.weekProgress = progressValues.length ? Math.round(progressValues.reduce((s: number, v: number) => s + v, 0) / progressValues.length) : 0;

        // Build recentActivities: combine activities, training, diet (take latest items)
        const mappedActivities = activities.map((a: any) => ({
          name: a.title || 'Atividade',
          time: a.time || (a.date ? a.date : ''),
          date: a.date || null,
          type: 'calendar',
          meta: a.description || ''
        }));

        const mappedTraining = training.map((t: any) => ({
          name: 'Treino',
          time: t.date || '',
          date: t.date || null,
          type: 'training',
          meta: t.note || ''
        }));

        const mappedDiet = diet.map((d: any) => ({
          name: 'Diário Alimentar',
          time: d.date || '',
          date: d.date || null,
          type: 'diet',
          meta: (d.breakfast || d.lunch || d.dinner || d.snacks || '').substring(0, 120)
        }));

        const combined = [...mappedActivities, ...mappedTraining, ...mappedDiet];

        // normalize date/time and sort desc
        const withDates = combined.map((c: any) => {
          const dt = this.combineDateTime(c.date, c.time);
          return { ...c, _ts: dt ? dt.getTime() : 0 };
        });

        withDates.sort((a: any, b: any) => b._ts - a._ts);
        this.recentActivities = withDates.slice(0, 6);

        // upcomingGoals: pick goals ordered by endDate ascending
        const goalsWithDeadlines = goals.map((g: any) => ({ ...g, _end: this.parseDate(g.endDate || g.end_date || g.end) })).filter((g: any) => g._end).sort((a: any, b: any) => a._end.getTime() - b._end.getTime());
        this.upcomingGoals = goalsWithDeadlines.slice(0, 5).map((g: any) => ({
          name: g.description || g.desc || 'Meta',
          deadline: g._end,
          progress: this.computeGoalTimeProgress(g)
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.errorMessage = 'Erro ao carregar dados do servidor.';
        this.loading = false;
      }
    });
  }

  private computeGoalTimeProgress(g: any): number {
    const start = this.parseDate(g.startDate || g.start_date || g.start);
    const end = this.parseDate(g.endDate || g.end_date || g.end);
    if (!start || !end) return 0;
    const now = new Date();
    const total = end.getTime() - start.getTime();
    if (total <= 0) return 0;
    const elapsed = Math.max(0, Math.min(now.getTime() - start.getTime(), total));
    return Math.round((elapsed / total) * 100);
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
    // input might be ISO date string, or YYYY-MM-DD
    try {
      // If input already a Date
      if (input instanceof Date) return input;
      // Normalize: if it's like 2025-10-20 or with time
      const s = String(input);
      // If time-only, skip
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return null;
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) return dt;
      // try YYYY-MM-DD
      const parts = s.split('-');
      if (parts.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        const d = Number(parts[2].slice(0,2));
        return new Date(y, m, d);
      }
    } catch (e) {
      return null;
    }
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
}
