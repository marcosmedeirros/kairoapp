import { Component, OnInit } from '@angular/core';

interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO
}

@Component({
  selector: 'app-anotacoes',
  templateUrl: './anotacoes.component.html',
  styleUrls: ['./anotacoes.component.css']
})
export class AnotacoesComponent implements OnInit {
  notes: Note[] = [];
  newTitle = '';
  newBody = '';

  editingId: string | null = null;
  editTitle = '';
  editBody = '';

  storageKey = 'kairo.notes.v1';

  constructor() { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.notes = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.notes = [];
    }
  }

  saveStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
  }

  addNote() {
    const t = (this.newTitle||'').trim();
    const b = (this.newBody||'').trim();
    if (!t && !b) return;
    const n: Note = { id: 'n_'+Date.now(), title: t, body: b, createdAt: new Date().toISOString() };
    this.notes.unshift(n);
    this.newTitle = '';
    this.newBody = '';
    this.saveStorage();
  }

  startEdit(n: Note) {
    this.editingId = n.id;
    this.editTitle = n.title;
    this.editBody = n.body;
  }

  saveEdit(n: Note) {
    if (!this.editingId) return;
    n.title = (this.editTitle||'').trim();
    n.body = (this.editBody||'').trim();
    this.editingId = null;
    this.editTitle = '';
    this.editBody = '';
    this.saveStorage();
  }

  cancelEdit() {
    this.editingId = null;
    this.editTitle = '';
    this.editBody = '';
  }

  deleteNote(n: Note) {
    this.notes = this.notes.filter(x => x.id !== n.id);
    this.saveStorage();
  }

  formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch { return iso; }
  }
}

