package com.example.routineapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "finance_categories")
public class FinanceCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    public FinanceCategory() {}

    public FinanceCategory(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
