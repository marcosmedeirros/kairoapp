import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-diet',
  templateUrl: './diet.component.html',
<<<<<<< HEAD
  styleUrls: []
=======
  styleUrls: ['./diet.component.css']
>>>>>>> ba7594db0705cb1e18a12d85419b09a5c4b57b12
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
    });
  }
}