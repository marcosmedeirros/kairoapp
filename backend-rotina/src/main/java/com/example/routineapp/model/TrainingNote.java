package com.example.routineapp.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "training_notes")
public class TrainingNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    @Column(name = "note")
    private String note;

    public TrainingNote() {}

    public TrainingNote(LocalDate date, String note) {
        this.date = date;
        this.note = note;
    }

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}