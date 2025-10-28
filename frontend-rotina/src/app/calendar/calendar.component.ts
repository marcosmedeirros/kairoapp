import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  activities: any[] = [];
  categories: any[] = [];

  newActivity = {
    title: '',
    description: '',
    date: '',
    time: '',
    categoryId: null as number | null
  };

  newCategory: any = { name: '', color: '#888888' };

  // editing state
  editingActivityId: number | null = null;
  editedActivity: any = null;

  // deletion modal state
  showDeleteModal: boolean = false;
  activityToDelete: any = null;

  // Day details modal state
  selectedDate: string | null = null;
  eventsForSelectedDate: any[] = [];
  showDayModal: boolean = false;

  // Simple calendar state
  currentMonth: number = 0;
  currentYear: number = 0;
  weeks: Array<Array<{ day: number; dateStr: string; inMonth: boolean }>> = [];
  monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchActivities();
    const now = new Date();
    this.currentMonth = now.getMonth();
    this.currentYear = now.getFullYear();
    this.buildCalendar();
    // Prefill new activity with current date/time
    this.newActivity.date = this.toIsoDate(new Date());
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    this.newActivity.time = `${hh}:${mm}`;
  }

  fetchCategories() {
    this.http.get<any[]>('/api/categories').subscribe(data => {
      this.categories = data || [];
    });
  }

  fetchActivities() {
    this.http.get<any[]>('/api/activities').subscribe((data) => {
      const sorted = (data || []).slice().sort((a, b) => this.activityTimestamp(b) - this.activityTimestamp(a));
      this.activities = sorted;
      this.buildCalendar();
      // Se um dia estiver aberto, atualiza sua lista
      if (this.selectedDate) {
        this.refreshSelectedDateEvents();
      }
    });
  }

  // timestamp util
  activityTimestamp(act: any): number {
    if (!act) return Number.NEGATIVE_INFINITY;
    const dateStr = act.date || act.dateString || (act.dateTime ? act.dateTime.split('T')[0] : null);
    if (!dateStr) return Number.NEGATIVE_INFINITY;
    const parts = dateStr.split('-').map((s: string) => parseInt(s, 10));
    if (parts.length < 3) return Number.NEGATIVE_INFINITY;
    const year = parts[0], month = parts[1] - 1, day = parts[2];
    let hh = 0, mm = 0, ss = 0;
    const t = act.time || act.timeString || (act.dateTime ? act.dateTime.split('T')[1] : '');
    if (t) {
      const timeParts = String(t).split(':').map((s: string) => parseInt(s, 10));
      if (timeParts.length >= 1 && !isNaN(timeParts[0])) hh = timeParts[0];
      if (timeParts.length >= 2 && !isNaN(timeParts[1])) mm = timeParts[1];
      if (timeParts.length >= 3 && !isNaN(timeParts[2])) ss = timeParts[2];
    }
    return new Date(year, month, day, hh, mm, ss).getTime();
  }

  startEdit(a: any) {
    this.editingActivityId = a.id;
    this.editedActivity = {
      title: a.title || '',
      description: a.description || '',
      date: a.date ? this.formatDateForInput(a.date) : (this.selectedDate || ''),
      time: a.time ? (a.time.length === 5 ? a.time : this.formatTimeForInput(a.time)) : '',
      categoryId: a.category?.id || null
    };
  }

  cancelEdit() {
    this.editingActivityId = null;
    this.editedActivity = null;
  }

  saveEdit(a: any) {
    const payload: any = { ...this.editedActivity };
    if (payload.categoryId) {
      const cat = this.categories.find(c => c.id === payload.categoryId);
      if (cat) payload.category = { id: cat.id, name: cat.name, color: cat.color };
      delete payload.categoryId;
    }
    if (!payload.date) delete payload.date;
    if (!payload.time) delete payload.time;
    this.http.put(`/api/activities/${a.id}`, payload).subscribe(() => {
      this.editingActivityId = null;
      this.editedActivity = null;
      this.fetchActivities(); // também atualiza modal
    }, (err) => console.error('Failed to update activity', err));
  }

  openDeleteModal(a: any) {
    this.activityToDelete = a;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.activityToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.activityToDelete) return;
    this.http.delete(`/api/activities/${this.activityToDelete.id}`).subscribe(() => {
      this.closeDeleteModal();
      this.fetchActivities();
    }, () => this.closeDeleteModal());
  }

  // utilities
  private formatDateForInput(input: any): string {
    if (!input) return '';
    // Se já for uma data no formato YYYY-MM-DD, retorna como está para evitar problemas de fuso horário
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }
    // Se vier um objeto Date ou outra string com data embutida, tenta extrair a parte de data
    if (input instanceof Date && !isNaN(input.getTime())) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      const d = String(input.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const s = String(input);
    const m = s.match(/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
  }

  private formatTimeForInput(input: any): string {
    if (!input) return '';
    const s = String(input);
    const match = s.match(/(\d{2}:\d{2})/);
    return match ? match[1] : s;
  }

  displayTimeLabel(input: any): string {
    const s = this.formatTimeForInput(input);
    // garante HH:mm
    if (/^\d{2}:\d{2}$/.test(s)) return s;
    return s.substring(0,5);
  }

  formatDateDisplay(input: any): string {
    if (!input) return '';
    // Evita UTC offset: formata diretamente se vier como YYYY-MM-DD
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [y, m, d] = input.split('-');
      return `${d}/${m}/${y}`;
    }
    // Caso contrário, tenta parsear sem quebrar
    try {
      const d = input instanceof Date ? input : new Date(input);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch {}
    return String(input);
  }

  buildCalendar() {
    const first = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = first.getDay();
    const startDate = new Date(this.currentYear, this.currentMonth, 1 - startDay);

    const weeks: Array<Array<{ day: number; dateStr: string; inMonth: boolean }>> = [];
    let cur = new Date(startDate.getTime());
    for (let w = 0; w < 6; w++) {
      const week: Array<{ day: number; dateStr: string; inMonth: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const day = cur.getDate();
        const inMonth = cur.getMonth() === this.currentMonth;
        const dateStr = this.toIsoDate(cur);
        week.push({ day, dateStr, inMonth });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }
    this.weeks = weeks;
  }

  toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  hasEvent(dateStr: string): boolean {
    if (!this.activities || this.activities.length === 0) return false;
    return this.activities.some(a => {
      const ad = this.normalizeToIsoDate(a.date || a.dateString || a);
      return ad === dateStr;
    });
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }
    this.buildCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
    this.buildCalendar();
  }

  selectDay(dateStr: string) {
    this.selectedDate = dateStr;
    this.refreshSelectedDateEvents();
    this.showDayModal = true;
  }

  refreshSelectedDateEvents() {
    if (!this.selectedDate) { this.eventsForSelectedDate = []; return; }
    this.eventsForSelectedDate = (this.activities || []).filter(a => {
      const ad = this.normalizeToIsoDate(a.date || a.dateString || a);
      return ad === this.selectedDate;
    });
  }

  closeDayModal() {
    this.showDayModal = false;
    this.selectedDate = null;
    this.eventsForSelectedDate = [];
    this.cancelEdit();
  }

  normalizeToIsoDate(input: any): string {
    if (!input) return '';
    if (typeof input === 'string' && input.match(/^\d{4}-\d{2}-\d{2}$/)) return input;
    try {
      const d = new Date(input);
      if (!isNaN(d.getTime())) { const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
    } catch {}
    const s = String(input);
    const m = s.match(/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
  }

  addActivity() {
    const payload: any = { title: this.newActivity.title, description: this.newActivity.description, date: this.newActivity.date, time: this.newActivity.time };
    if (this.newActivity.categoryId) {
      const cat = this.categories.find(c => c.id === this.newActivity.categoryId);
      if (cat) payload.category = { id: cat.id, name: cat.name, color: cat.color };
    }
    this.http.post('/api/activities', payload).subscribe(() => {
      const now = new Date();
      this.newActivity = { title: '', description: '', date: this.toIsoDate(now), time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`, categoryId: null };
      this.fetchActivities();
    }, (err) => console.error('Failed to add activity', err));
  }

  createCategory() {
    const payload = { name: (this.newCategory.name||'').trim(), color: this.newCategory.color || '#888888' };
    if (!payload.name) return;
    this.http.post('/api/categories', payload).subscribe(() => {
      this.newCategory = { name: '', color: '#888888' };
      this.fetchCategories();
    });
  }

  getDayDotColor(dateStr: string): string {
    try {
      const first = (this.activities || []).find(a => this.normalizeToIsoDate(a.date || a.dateString || a) === dateStr);
      const color = first?.category?.color;
      return color && typeof color === 'string' && color.length > 0 ? color : 'var(--color-accent)';
    } catch {
      return 'var(--color-accent)';
    }
  }
}
