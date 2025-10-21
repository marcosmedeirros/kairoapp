package com.example.routineapp.controller;

import com.example.routineapp.model.Workout;
import com.example.routineapp.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin
public class WorkoutController {
    @Autowired
    private WorkoutRepository repository;

    @GetMapping
    public List<Workout> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> get(@PathVariable Long id) {
        Optional<Workout> opt = repository.findById(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Workout> create(@RequestBody Workout workout) {
        if (workout.getName() == null || workout.getName().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Workout saved = repository.save(workout);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workout> update(@PathVariable Long id, @RequestBody Workout incoming) {
        return repository.findById(id).map(existing -> {
            existing.setName(incoming.getName());
            existing.setExercises(incoming.getExercises());
            Workout saved = repository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
