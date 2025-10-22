import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-diet',
  templateUrl: './diet.component.html',
  styleUrls: ['./diet.component.css']
})
export class DietComponent implements OnInit {
  logs: any[] = [];
  
  // Calendário mensal
  currentMonth: number = 0;
  currentYear: number = 0;
  weeks: Array<Array<{ day: number; dateStr: string; inMonth: boolean }>> = [];
  monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  // Modal do dia
  showDayModal: boolean = false;
  selectedDate: string | null = null;
  selectedLog: any = null;
  isEditing: boolean = false;
  editedLog: any = null;

  // Modal de confirmação de exclusão
  showDeleteModal: boolean = false;
  logToDelete: any = null;

  // Receitas
  recipes: any[] = [];
  newRecipe = { name: '', description: '' };
  editingRecipeId: number | null = null;
  editedRecipe: any = null;
  showRecipeDeleteModal: boolean = false;
  recipeToDelete: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentMonth = now.getMonth();
    this.currentYear = now.getFullYear();
    this.fetchLogs();
    this.fetchRecipes();
  }

  fetchLogs() {
    this.http.get<any[]>('/api/diet').subscribe((data) => {
      this.logs = data || [];
      this.buildCalendar();
    });
  }

  fetchRecipes() {
    this.http.get<any[]>('/api/recipes').subscribe((data) => {
      this.recipes = data || [];
    });
  }

  // ===== CALENDÁRIO =====
  buildCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay(); // 0=Sun, 1=Mon, ...

    const weeks: Array<Array<{ day: number; dateStr: string; inMonth: boolean }>> = [];
    let week: Array<{ day: number; dateStr: string; inMonth: boolean }> = [];

    // Fill leading empty days
    for (let i = 0; i < startWeekday; i++) {
      week.push({ day: 0, dateStr: '', inMonth: false });
    }

    // Fill days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = this.toIsoDate(new Date(this.currentYear, this.currentMonth, d));
      week.push({ day: d, dateStr, inMonth: true });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // Fill trailing empty days
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ day: 0, dateStr: '', inMonth: false });
      }
      weeks.push(week);
    }

    this.weeks = weeks;
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.buildCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.buildCalendar();
  }

  hasLogOnDate(dateStr: string): boolean {
    return this.logs.some(log => log.date === dateStr);
  }

  onDayClick(cell: any) {
    if (!cell.inMonth) return;
    this.selectedDate = cell.dateStr;
    this.selectedLog = this.logs.find(log => log.date === cell.dateStr) || null;
    this.isEditing = false;
    this.editedLog = null;
    this.showDayModal = true;
  }

  closeDayModal() {
    this.showDayModal = false;
    this.selectedDate = null;
    this.selectedLog = null;
    this.isEditing = false;
    this.editedLog = null;
  }

  // ===== CRUD NO MODAL =====
  startNewLog() {
    this.isEditing = true;
    this.editedLog = {
      date: this.selectedDate,
      breakfast: '',
      lunch: '',
      dinner: '',
      snacks: '',
      notes: ''
    };
  }

  startEdit() {
    if (!this.selectedLog) return;
    this.isEditing = true;
    this.editedLog = {
      date: this.selectedLog.date,
      breakfast: this.selectedLog.breakfast || '',
      lunch: this.selectedLog.lunch || '',
      dinner: this.selectedLog.dinner || '',
      snacks: this.selectedLog.snacks || '',
      notes: this.selectedLog.notes || ''
    };
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedLog = null;
  }

  saveLog() {
    if (!this.editedLog) return;
    
    if (this.selectedLog) {
      // Update existing
      this.http.put(`/api/diet/${this.selectedLog.id}`, this.editedLog).subscribe(() => {
        this.fetchLogs();
        this.closeDayModal();
      }, (err) => {
        console.error('Failed to update diet log', err);
      });
    } else {
      // Create new
      this.http.post('/api/diet', this.editedLog).subscribe(() => {
        this.fetchLogs();
        this.closeDayModal();
      }, (err) => {
        console.error('Failed to add diet log', err);
      });
    }
  }

  openDeleteModal() {
    if (!this.selectedLog) return;
    this.logToDelete = this.selectedLog;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.logToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.logToDelete) return;
    this.http.delete(`/api/diet/${this.logToDelete.id}`).subscribe(() => {
      this.closeDeleteModal();
      this.closeDayModal();
      this.fetchLogs();
    }, (err) => {
      console.error('Failed to delete diet log', err);
      this.closeDeleteModal();
    });
  }

  // ===== RECEITAS =====
  addRecipe() {
    if (!this.newRecipe.name.trim()) return;
    this.http.post('/api/recipes', this.newRecipe).subscribe(() => {
      this.newRecipe = { name: '', description: '' };
      this.fetchRecipes();
    }, (err) => {
      console.error('Failed to add recipe', err);
    });
  }

  startEditRecipe(recipe: any) {
    this.editingRecipeId = recipe.id;
    this.editedRecipe = { ...recipe };
  }

  saveEditRecipe() {
    if (!this.editedRecipe) return;
    this.http.put(`/api/recipes/${this.editingRecipeId}`, this.editedRecipe).subscribe(() => {
      this.editingRecipeId = null;
      this.editedRecipe = null;
      this.fetchRecipes();
    }, (err) => {
      console.error('Failed to update recipe', err);
    });
  }

  cancelEditRecipe() {
    this.editingRecipeId = null;
    this.editedRecipe = null;
  }

  openRecipeDeleteModal(recipe: any) {
    this.recipeToDelete = recipe;
    this.showRecipeDeleteModal = true;
  }

  closeRecipeDeleteModal() {
    this.recipeToDelete = null;
    this.showRecipeDeleteModal = false;
  }

  confirmRecipeDelete() {
    if (!this.recipeToDelete) return;
    this.http.delete(`/api/recipes/${this.recipeToDelete.id}`).subscribe(() => {
      this.closeRecipeDeleteModal();
      this.fetchRecipes();
    }, (err) => {
      console.error('Failed to delete recipe', err);
      this.closeRecipeDeleteModal();
    });
  }

  // ===== UTILS =====
  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatDateForInput(input: any): string {
    if (!input) return '';
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    return this.toIsoDate(d);
  }
}
