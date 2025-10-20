package com.example.routineapp.controller;

import com.example.routineapp.model.Activity;
import com.example.routineapp.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin
public class ActivityController {

    @Autowired
    private ActivityRepository repository;

    @GetMapping
    public List<Activity> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activity> get(@PathVariable Long id) {
        Optional<Activity> opt = repository.findById(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Activity> create(@RequestBody Activity activity) {
        if (activity.getTitle() == null || activity.getDate() == null || activity.getTime() == null) {
            return ResponseEntity.badRequest().build();
        }
        Activity saved = repository.save(activity);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Activity> update(@PathVariable Long id, @RequestBody Activity incoming) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(incoming.getTitle());
            existing.setDescription(incoming.getDescription());
            existing.setDate(incoming.getDate());
            existing.setTime(incoming.getTime());
            Activity saved = repository.save(existing);
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
