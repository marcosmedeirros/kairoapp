import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-diet',
  templateUrl: './diet.component.html',
  styleUrls: ['./diet.component.css']
})
export class DietComponent implements OnInit {
  logs: any[] = [];
  newLog = {
    date: '',
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
    notes: ''
  };

  // editing state
  editingLogId: number | null = null;
  editedLog: any = null;

  // deletion modal state
  showDeleteModal: boolean = false;
  logToDelete: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs() {
    this.http.get<any[]>('/api/diet').subscribe((data) => {
      this.logs = data;
    });
  }

  addLog() {
    this.http.post('/api/diet', this.newLog).subscribe(() => {
      this.newLog = { date: '', breakfast: '', lunch: '', dinner: '', snacks: '', notes: '' };
      this.fetchLogs();
    }, (err) => {
      console.error('Failed to add diet log', err);
    });
  }

  startEdit(log: any) {
    this.editingLogId = log.id;
    this.editedLog = {
      date: this.formatDateForInput(log.date),
      breakfast: log.breakfast || '',
      lunch: log.lunch || '',
      dinner: log.dinner || '',
      snacks: log.snacks || '',
      notes: log.notes || ''
    };
  }

  cancelEdit() {
    this.editingLogId = null;
    this.editedLog = null;
  }

  saveEdit(log: any) {
    const payload: any = { ...this.editedLog };
    this.http.put(`/api/diet/${log.id}`, payload).subscribe(() => {
      this.editingLogId = null;
      this.editedLog = null;
      this.fetchLogs();
    }, (err) => {
      console.error('Failed to update diet log', err);
    });
  }

  openDeleteModal(log: any) {
    this.logToDelete = log;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.logToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.logToDelete) return;
    this.http.delete(`/api/diet/${this.logToDelete.id}`).subscribe(() => {
      this.closeDeleteModal();
      this.fetchLogs();
    }, (err) => {
      console.error('Failed to delete diet log', err);
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
}
