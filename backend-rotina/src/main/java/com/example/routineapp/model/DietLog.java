package com.example.routineapp.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "diet_logs")
public class DietLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String breakfast;
    private String lunch;
    private String dinner;
    private String snacks;
    private String notes;

    public DietLog() {}

    public DietLog(LocalDate date, String breakfast, String lunch, String dinner, String snacks, String notes) {
        this.date = date;
        this.breakfast = breakfast;
        this.lunch = lunch;
        this.dinner = dinner;
        this.snacks = snacks;
        this.notes = notes;
    }

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getBreakfast() { return breakfast; }
    public void setBreakfast(String breakfast) { this.breakfast = breakfast; }
    public String getLunch() { return lunch; }
    public void setLunch(String lunch) { this.lunch = lunch; }
    public String getDinner() { return dinner; }
    public void setDinner(String dinner) { this.dinner = dinner; }
    public String getSnacks() { return snacks; }
    public void setSnacks(String snacks) { this.snacks = snacks; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}