import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DietComponent } from './diet/diet.component';
import { TrainingComponent } from './training/training.component';
import { GoalsComponent } from './goals/goals.component';

const routes: Routes = [
  { path: '', component: CalendarComponent },
  { path: 'diet', component: DietComponent },
  { path: 'training', component: TrainingComponent },
  { path: 'goals', component: GoalsComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    DietComponent,
    TrainingComponent,
    GoalsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }