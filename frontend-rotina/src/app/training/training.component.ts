import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: []
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
}