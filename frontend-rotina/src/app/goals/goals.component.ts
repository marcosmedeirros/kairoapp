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

  // Editing state
  editingGoalId: number | null = null;
  editedGoal: any = null;

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

  startEdit(goal: any) {
    this.editingGoalId = goal.id;
    // copy and normalize date strings to yyyy-mm-dd for inputs
    this.editedGoal = {
      description: goal.description,
      type: goal.type || 'WEEKLY',
      startDate: goal.startDate ? this.formatDateForInput(goal.startDate) : '',
      endDate: goal.endDate ? this.formatDateForInput(goal.endDate) : ''
    };
  }

  cancelEdit() {
    this.editingGoalId = null;
    this.editedGoal = null;
  }

  saveEdit(goal: any) {
    const payload: any = { ...this.editedGoal };
    if (!payload.startDate) delete payload.startDate;
    if (!payload.endDate) delete payload.endDate;
    this.http.put(`/api/goals/${goal.id}`, payload).subscribe(() => {
      this.editingGoalId = null;
      this.editedGoal = null;
      this.fetchGoals();
    }, (err) => {
      console.error('Failed to update goal', err);
    });
  }

  deleteGoal(goal: any) {
    if (!confirm('Confirmar exclusão da meta?')) return;
    this.http.delete(`/api/goals/${goal.id}`).subscribe(() => {
      this.fetchGoals();
    }, (err) => {
      console.error('Failed to delete goal', err);
    });
  }

  private formatDateForInput(input: any): string {
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
