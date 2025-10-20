import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
<<<<<<< HEAD
  styleUrls: []
=======
  styleUrls: ['./goals.component.css']
>>>>>>> ba7594db0705cb1e18a12d85419b09a5c4b57b12
})
export class GoalsComponent implements OnInit {
  goals: any[] = [];
  newGoal = {
    description: '',
    type: 'weekly',
    start_date: '',
    end_date: ''
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
    this.http.post('/api/goals', this.newGoal).subscribe(() => {
      this.newGoal = { description: '', type: 'weekly', start_date: '', end_date: '' };
      this.fetchGoals();
    });
  }
}