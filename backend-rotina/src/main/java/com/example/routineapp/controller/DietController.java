package com.example.routineapp.controller;

import com.example.routineapp.model.DietLog;
import com.example.routineapp.repository.DietLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/diet")
@CrossOrigin
public class DietController {
    @Autowired
    private DietLogRepository repository;

    @GetMapping
    public List<DietLog> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DietLog> get(@PathVariable Long id) {
        Optional<DietLog> opt = repository.findById(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DietLog> create(@RequestBody DietLog log) {
        if (log.getDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        DietLog saved = repository.save(log);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DietLog> update(@PathVariable Long id, @RequestBody DietLog incoming) {
        return repository.findById(id).map(existing -> {
            existing.setDate(incoming.getDate());
            existing.setBreakfast(incoming.getBreakfast());
            existing.setLunch(incoming.getLunch());
            existing.setDinner(incoming.getDinner());
            existing.setSnacks(incoming.getSnacks());
            existing.setNotes(incoming.getNotes());
            DietLog saved = repository.save(existing);
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
