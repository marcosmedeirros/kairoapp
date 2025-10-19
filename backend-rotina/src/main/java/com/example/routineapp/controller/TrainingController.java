package com.example.routineapp.controller;

import com.example.routineapp.model.TrainingNote;
import com.example.routineapp.repository.TrainingNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    public ResponseEntity<String> create(@RequestBody TrainingNote note) {
        if (note.getDate() == null || note.getNote() == null || note.getNote().isEmpty()) {
            return ResponseEntity.badRequest().body("Data e anotação são obrigatórias.");
        }
        repository.save(note);
        return ResponseEntity.status(201).body("Anotação de treino criada.");
    }
}