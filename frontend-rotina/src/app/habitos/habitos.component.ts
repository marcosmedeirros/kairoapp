import { Component, OnInit } from '@angular/core';

interface HabitDay {
  date: string; // ISO yyyy-mm-dd
  done: boolean;
}

interface Habit {
  id: string;
  name: string;
  createdAt: string; // ISO
  days: HabitDay[]; // current week days
  total: number; // total times done across weeks
}

@Component({
  selector: 'app-habitos',
  templateUrl: './habitos.component.html',
  styleUrls: ['./habitos.component.css']
})
export class HabitsComponent implements OnInit {
  habits: Habit[] = [];

  newHabitName = '';

  today = new Date();
  weekDaysIso: string[] = []; // 7 days of current week (Monday..Sunday)

  storageKey = 'kairo.habits.v1';

  constructor() {}

  ngOnInit(): void {
    this.buildWeek();
    this.load();
    this.syncWeek();
  }

  buildWeek() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun..6=Sat
    const mondayOffset = (day === 0) ? -6 : 1 - day; // if Sunday, go back 6 days
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
    this.weekDaysIso = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      this.weekDaysIso.push(this.toIsoDate(d));
    }
  }

  toIsoDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Habit[];
        this.habits = parsed || [];
      } else this.habits = [];
    } catch (e) {
      this.habits = [];
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.habits));
  }

  addHabit() {
    const name = (this.newHabitName || '').trim();
    if (!name) return;
    const h: Habit = {
      id: 'h_' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      days: this.weekDaysIso.map(d => ({ date: d, done: false })),
      total: 0
    };
    this.habits.push(h);
    this.newHabitName = '';
    this.save();
  }

  toggleDone(h: Habit, date: string) {
    const day = h.days.find(d => d.date === date);
    if (!day) return;
    day.done = !day.done;
    h.total += day.done ? 1 : -1;
    if (h.total < 0) h.total = 0;
    this.save();
  }

  dayDone(h: Habit, date: string): boolean {
    const day = h.days.find(function(d){ return d.date === date; });
    return !!(day && day.done);
  }

  dayLabel(dateIso: string): string {
    return dateIso ? dateIso.substring(8,10) : '';
  }

  removeHabit(h: Habit) {
    this.habits = this.habits.filter(x => x.id !== h.id);
    this.save();
  }

  syncWeek() {
    for (const h of this.habits) {
      const newDays: HabitDay[] = this.weekDaysIso.map(d => {
        const found = h.days.find(x => x.date === d);
        return { date: d, done: found ? found.done : false };
      });
      h.days = newDays;
    }
    this.save();
  }

  startNewWeek() {
    this.buildWeek();
    this.syncWeek();
  }
}
