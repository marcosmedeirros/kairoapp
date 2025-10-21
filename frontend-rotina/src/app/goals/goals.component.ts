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

  // Deletion modal state
  showDeleteModal: boolean = false;
  goalToDelete: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Define data de início padrão como hoje
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    this.newGoal.startDate = `${y}-${m}-${d}`;
    
    this.fetchGoals();
  }

  fetchGoals() {
    this.http.get<any[]>('/api/goals').subscribe((data) => {
      this.goals = data;
    });
  }

  // Classificação das metas
  get overdue(): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.goals.filter(g => {
      if (!g.endDate) return false;
      const end = new Date(g.endDate);
      end.setHours(0, 0, 0, 0);
      return end < today;
    });
  }

  get inProgress(): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.goals.filter(g => {
      const start = g.startDate ? new Date(g.startDate) : null;
      const end = g.endDate ? new Date(g.endDate) : null;
      
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);

      // Em andamento: já começou (ou sem data início) e não venceu
      const hasStarted = !start || start <= today;
      const notExpired = !end || end >= today;
      
      return hasStarted && notExpired;
    });
  }

  get upcoming(): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.goals.filter(g => {
      if (!g.startDate) return false;
      const start = new Date(g.startDate);
      start.setHours(0, 0, 0, 0);
      return start > today;
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

  // Open modal and set candidate
  openDeleteModal(goal: any) {
    this.goalToDelete = goal;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.goalToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.goalToDelete) return;
    this.http.delete(`/api/goals/${this.goalToDelete.id}`).subscribe(() => {
      this.closeDeleteModal();
      this.fetchGoals();
    }, (err) => {
      console.error('Failed to delete goal', err);
      this.closeDeleteModal();
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
