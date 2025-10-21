package com.example.routineapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "workouts")
public class Workout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 2000)
    private String exercises; // Lista de exercícios separados por linha

    public Workout() {}

    public Workout(String name, String exercises) {
        this.name = name;
        this.exercises = exercises;
    }

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getExercises() { return exercises; }
    public void setExercises(String exercises) { this.exercises = exercises; }
}
