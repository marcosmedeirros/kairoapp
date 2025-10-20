import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals: any[] = [];
  newGoal = {
    description: '',
    type: 'WEEKLY',
    startDate: '',
    endDate: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchGoals();
  }

  fetchGoals() {
    this.http.get<any[]>('/api/goals').subscribe((data) => {
      this.goals = data;
    });
  }

  addGoal() {
    // prepare payload: ensure empty strings converted to null to avoid parsing issues
    const payload: any = { ...this.newGoal };
    if (!payload.startDate) delete payload.startDate;
    if (!payload.endDate) delete payload.endDate;

    this.http.post('/api/goals', payload).subscribe(() => {
      this.newGoal = { description: '', type: 'WEEKLY', startDate: '', endDate: '' };
      this.fetchGoals();
    }, (err) => {
      console.error('Failed to create goal', err);
      // optionally display an error to the user
    });
  }
}
