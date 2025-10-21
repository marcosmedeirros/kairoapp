package com.example.routineapp.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "workout_logs")
public class WorkoutLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "workout_id")
    private Workout workout;

    public WorkoutLog() {}

    public WorkoutLog(LocalDate date, Workout workout) {
        this.date = date;
        this.workout = workout;
    }

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Workout getWorkout() { return workout; }
    public void setWorkout(Workout workout) { this.workout = workout; }
}
