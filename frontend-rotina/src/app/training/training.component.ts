import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {
  // Cadastro de treinos (templates)
  workouts: any[] = [];
  newWorkout = {
    name: '',
    exercises: ''
  };
  editingWorkoutId: number | null = null;
  editedWorkout: any = null;

  // Registro de execução
  logs: any[] = [];
  newLog = {
    date: '',
    workoutId: null
  };

  // Modals
  showDeleteModal: boolean = false;
  itemToDelete: any = null;
  deleteType: 'workout' | 'log' = 'log';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    this.newLog.date = `${y}-${m}-${d}`;
    
    this.fetchWorkouts();
    this.fetchLogs();
  }

  // === WORKOUTS (Cadastro de Treinos) ===
  fetchWorkouts() {
    this.http.get<any[]>('/api/workouts').subscribe((data) => {
      this.workouts = data || [];
    });
  }

  addWorkout() {
    this.http.post('/api/workouts', this.newWorkout).subscribe(() => {
      this.newWorkout = { name: '', exercises: '' };
      this.fetchWorkouts();
    }, (err) => {
      console.error('Failed to add workout', err);
    });
  }

  startEditWorkout(w: any) {
    this.editingWorkoutId = w.id;
    this.editedWorkout = { name: w.name, exercises: w.exercises };
  }

  cancelEditWorkout() {
    this.editingWorkoutId = null;
    this.editedWorkout = null;
  }

  saveEditWorkout(w: any) {
    this.http.put(`/api/workouts/${w.id}`, this.editedWorkout).subscribe(() => {
      this.editingWorkoutId = null;
      this.editedWorkout = null;
      this.fetchWorkouts();
    }, (err) => {
      console.error('Failed to update workout', err);
    });
  }

  openDeleteWorkout(w: any) {
    this.itemToDelete = w;
    this.deleteType = 'workout';
    this.showDeleteModal = true;
  }

  // === LOGS (Registro de Execução) ===
  fetchLogs() {
    this.http.get<any[]>('/api/workout-logs').subscribe((data) => {
      this.logs = (data || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  addLog() {
    if (!this.newLog.workoutId) {
      alert('Selecione um treino');
      return;
    }
    this.http.post('/api/workout-logs', this.newLog).subscribe(() => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      this.newLog = { date: `${y}-${m}-${d}`, workoutId: null };
      this.fetchLogs();
    }, (err) => {
      console.error('Failed to add log', err);
    });
  }

  openDeleteLog(log: any) {
    this.itemToDelete = log;
    this.deleteType = 'log';
    this.showDeleteModal = true;
  }

  // === MODAL ===
  closeDeleteModal() {
    this.itemToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.itemToDelete) return;
    const endpoint = this.deleteType === 'workout' 
      ? `/api/workouts/${this.itemToDelete.id}`
      : `/api/workout-logs/${this.itemToDelete.id}`;
    
    this.http.delete(endpoint).subscribe(() => {
      this.closeDeleteModal();
      if (this.deleteType === 'workout') {
        this.fetchWorkouts();
      } else {
        this.fetchLogs();
      }
    }, (err) => {
      console.error('Failed to delete', err);
      this.closeDeleteModal();
    });
  }

  getThisWeekCount(): number {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.logs.filter(l => new Date(l.date) >= weekAgo).length;
  }

  getThisMonthCount(): number {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.logs.filter(l => new Date(l.date) >= monthAgo).length;
  }
}
