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
    this.http.post('/api/activities', this.newActivity).subscribe(() => {
      // Limpa o formulário e recarrega a lista
      this.newActivity = { title: '', description: '', date: '', time: '' };
      this.fetchActivities();
    });
  }
}
