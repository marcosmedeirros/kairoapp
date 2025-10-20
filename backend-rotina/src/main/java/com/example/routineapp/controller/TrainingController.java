package com.example.routineapp.controller;

import com.example.routineapp.model.TrainingNote;
import com.example.routineapp.repository.TrainingNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/training")
@CrossOrigin
public class TrainingController {
    @Autowired
    private TrainingNoteRepository repository;

    @GetMapping
    public List<TrainingNote> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingNote> get(@PathVariable Long id) {
        Optional<TrainingNote> opt = repository.findById(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TrainingNote> create(@RequestBody TrainingNote note) {
        if (note.getDate() == null || note.getNote() == null || note.getNote().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        TrainingNote saved = repository.save(note);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingNote> update(@PathVariable Long id, @RequestBody TrainingNote incoming) {
        return repository.findById(id).map(existing -> {
            existing.setDate(incoming.getDate());
            existing.setNote(incoming.getNote());
            TrainingNote saved = repository.save(existing);
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
