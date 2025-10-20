package com.example.routineapp.controller;

import com.example.routineapp.model.Goal;
import com.example.routineapp.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin
public class GoalController {
    @Autowired
    private GoalRepository repository;

    @GetMapping
    public List<Goal> list() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<Goal> create(@RequestBody Goal input) {
        if (input.getDescription() == null || input.getType() == null) {
            return ResponseEntity.badRequest().build();
        }
        Goal saved = repository.save(input);
        return ResponseEntity.status(201).body(saved);
    }
}
