import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
<<<<<<< HEAD
  styleUrls: []
=======
  styleUrls: ['./training.component.css']
>>>>>>> ba7594db0705cb1e18a12d85419b09a5c4b57b12
})
export class TrainingComponent implements OnInit {
  notes: any[] = [];
  newNote = {
    date: '',
    note: ''
  };

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
    });
  }
<<<<<<< HEAD
=======

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
>>>>>>> ba7594db0705cb1e18a12d85419b09a5c4b57b12
}