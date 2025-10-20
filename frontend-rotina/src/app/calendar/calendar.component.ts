import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  activities: any[] = [];
  newActivity = {
    title: '',
    description: '',
    date: '',
    time: ''
  };

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

  fetchActivities() {
    this.http.get<any[]>('/api/activities').subscribe((data) => {
      // sort activities by date+time (most recent first)
      const sorted = (data || []).slice().sort((a, b) => {
        const ta = this.activityTimestamp(a);
        const tb = this.activityTimestamp(b);
        return tb - ta; // descending
      });
      this.activities = sorted;
      // rebuild calendar so events are reflected
      this.buildCalendar();
    });
  }

  // Convert activity's date+time to a local timestamp (ms). Missing date => -Infinity so it goes last.
  activityTimestamp(act: any): number {
    if (!act) return Number.NEGATIVE_INFINITY;
    const dateStr = act.date || act.dateString || (act.dateTime ? act.dateTime.split('T')[0] : null);
    if (!dateStr) return Number.NEGATIVE_INFINITY;
    const parts = dateStr.split('-').map((s: string) => parseInt(s, 10));
    if (parts.length < 3) return Number.NEGATIVE_INFINITY;
    const year = parts[0];
    const month = parts[1] - 1;
    const day = parts[2];
    // parse time if present
    let hh = 0, mm = 0, ss = 0;
    const t = act.time || act.timeString || (act.dateTime ? act.dateTime.split('T')[1] : '');
    if (t) {
      const timeParts = String(t).split(':').map((s: string) => parseInt(s, 10));
      if (timeParts.length >= 1 && !isNaN(timeParts[0])) hh = timeParts[0];
      if (timeParts.length >= 2 && !isNaN(timeParts[1])) mm = timeParts[1];
      if (timeParts.length >= 3 && !isNaN(timeParts[2])) ss = timeParts[2];
    }
    const d = new Date(year, month, day, hh, mm, ss);
    return d.getTime();
  }

  startEdit(a: any) {
    this.editingActivityId = a.id;
    this.editedActivity = {
      title: a.title || '',
      description: a.description || '',
      date: a.date ? this.formatDateForInput(a.date) : '',
      time: a.time ? (a.time.length === 5 ? a.time : this.formatTimeForInput(a.time)) : ''
    };
  }

  cancelEdit() {
    this.editingActivityId = null;
    this.editedActivity = null;
  }

  saveEdit(a: any) {
    const payload: any = { ...this.editedActivity };
    if (!payload.date) delete payload.date;
    if (!payload.time) delete payload.time;
    this.http.put(`/api/activities/${a.id}`, payload).subscribe(() => {
      this.editingActivityId = null;
      this.editedActivity = null;
      this.fetchActivities();
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
    }, (err) => {
      console.error('Failed to delete activity', err);
      this.closeDeleteModal();
    });
  }

  private formatDateForInput(input: any): string {
    if (!input) return '';
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatTimeForInput(input: any): string {
    if (!input) return '';
    const s = String(input);
    const match = s.match(/(\d{2}:\d{2})/);
    return match ? match[1] : s;
  }

  formatDateDisplay(input: any): string {
    if (!input) return '';
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Build a simple 6x7 month grid (weeks)
  buildCalendar() {
    const first = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = first.getDay(); // 0 (Sun) - 6 (Sat)

    // start from the Sunday before (or the first day of the month if it starts on Sunday)
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

  // When a day is clicked, gather events for that day and open modal
  selectDay(dateStr: string) {
    this.selectedDate = dateStr;
    this.eventsForSelectedDate = (this.activities || []).filter(a => {
      const ad = this.normalizeToIsoDate(a.date || a.dateString || a);
      return ad === dateStr;
    });
    this.showDayModal = true;
  }

  closeDayModal() {
    this.showDayModal = false;
    this.selectedDate = null;
    this.eventsForSelectedDate = [];
  }

  // Normalize various date inputs to YYYY-MM-DD (local date) without time offset issues
  normalizeToIsoDate(input: any): string {
    if (!input) return '';
    // If already YYYY-MM-DD
    if (typeof input === 'string' && input.match(/^\d{4}-\d{2}-\d{2}$/)) return input;
    // If ISO timestamp or other string, try parse
    try {
      const d = new Date(input);
      if (!isNaN(d.getTime())) {
        // build local date parts
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    } catch (e) {
      // fallthrough
    }
    // fallback: if input has date-like substring
    const s = String(input);
    const m = s.match(/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
  }

  addActivity() {
    const payload: any = { ...this.newActivity };
    if (!payload.date) delete payload.date;
    if (!payload.time) delete payload.time;
    this.http.post('/api/activities', payload).subscribe(() => {
      // Limpa o formulário e recarrega a lista
      const now = new Date();
      this.newActivity = { title: '', description: '', date: this.toIsoDate(now), time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}` };
      this.fetchActivities();
    }, (err) => console.error('Failed to add activity', err));
  }
}
