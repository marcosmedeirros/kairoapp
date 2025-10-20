import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  // Referência ao objeto Math para usar no template
  Math = Math;
  
  // Estatísticas gerais
  stats = {
    totalActivities: 0,
    todayActivities: 0,
    activeGoals: 0,
    completedGoals: 0,
    weekProgress: 0,
    caloriesConsumed: 0,
    caloriesGoal: 2000,
    workoutsThisWeek: 0
  };

  // Atividades recentes
  recentActivities: any[] = [];

  // Metas próximas do prazo
  upcomingGoals: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Integrar com os serviços do backend
    // Por enquanto, usando dados mock
    this.stats = {
      totalActivities: 45,
      todayActivities: 3,
      activeGoals: 5,
      completedGoals: 12,
      weekProgress: 68,
      caloriesConsumed: 1450,
      caloriesGoal: 2000,
      workoutsThisWeek: 4
    };

    this.recentActivities = [
      { name: 'Corrida', time: '06:30', duration: '30 min', type: 'cardio' },
      { name: 'Café da manhã', time: '07:30', calories: 350, type: 'diet' },
      { name: 'Treino de força', time: '18:00', duration: '45 min', type: 'training' }
    ];

    this.upcomingGoals = [
      { name: 'Perder 5kg', deadline: '2025-11-30', progress: 40 },
      { name: 'Correr 100km/mês', deadline: '2025-10-31', progress: 75 },
      { name: 'Treinar 5x/semana', deadline: '2025-10-31', progress: 80 }
    ];
  }

  getCaloriesPercentage(): number {
    return (this.stats.caloriesConsumed / this.stats.caloriesGoal) * 100;
  }

  getCaloriesRemaining(): number {
    return this.stats.caloriesGoal - this.stats.caloriesConsumed;
  }

  getActivityIcon(type: string): string {
    const icons: any = {
      'cardio': '🏃',
      'training': '💪',
      'diet': '🍽️',
      'default': '📋'
    };
    return icons[type] || icons['default'];
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return '#4caf50';
    if (progress >= 50) return '#ff9800';
    return '#f44336';
  }
}
