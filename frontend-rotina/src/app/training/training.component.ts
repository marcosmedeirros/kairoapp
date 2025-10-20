import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {
  notes: any[] = [];
  newNote = {
    date: '',
    note: ''
  };

  // editing state
  editingNoteId: number | null = null;
  editedNote: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchNotes();
  }

  fetchNotes() {
    this.http.get<any[]>('/api/training').subscribe((data) => {
      this.notes = data;
    });
  }

  addNote() {
    this.http.post('/api/training', this.newNote).subscribe(() => {
      this.newNote = { date: '', note: '' };
      this.fetchNotes();
    }, (err) => {
      console.error('Failed to add note', err);
    });
  }

  startEdit(n: any) {
    this.editingNoteId = n.id;
    this.editedNote = { date: this.formatDateForInput(n.date), note: n.note };
  }

  cancelEdit() {
    this.editingNoteId = null;
    this.editedNote = null;
  }

  saveEdit(n: any) {
    const payload = { ...this.editedNote };
    this.http.put(`/api/training/${n.id}`, payload).subscribe(() => {
      this.editingNoteId = null;
      this.editedNote = null;
      this.fetchNotes();
    }, (err) => {
      console.error('Failed to update note', err);
    });
  }

  deleteNote(n: any) {
    if (!confirm('Confirmar exclusão do registro de treino?')) return;
    this.http.delete(`/api/training/${n.id}`).subscribe(() => {
      this.fetchNotes();
    }, (err) => {
      console.error('Failed to delete note', err);
    });
  }

  getThisWeekCount(): number {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.notes.filter(n => new Date(n.date) >= weekAgo).length;
  }

  getThisMonthCount(): number {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.notes.filter(n => new Date(n.date) >= monthAgo).length;
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
