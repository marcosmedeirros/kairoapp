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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchActivities();
  }

  fetchActivities() {
    this.http.get<any[]>('/api/activities').subscribe((data) => {
      this.activities = data;
    });
  }

  addActivity() {
    const payload: any = { ...this.newActivity };
    if (!payload.date) delete payload.date;
    if (!payload.time) delete payload.time;
    this.http.post('/api/activities', payload).subscribe(() => {
      // Limpa o formulário e recarrega a lista
      this.newActivity = { title: '', description: '', date: '', time: '' };
      this.fetchActivities();
    }, (err) => console.error('Failed to add activity', err));
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
}
