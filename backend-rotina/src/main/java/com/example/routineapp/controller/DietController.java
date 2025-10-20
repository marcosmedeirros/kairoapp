package com.example.routineapp.controller;

import com.example.routineapp.model.DietLog;
import com.example.routineapp.repository.DietLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    public ResponseEntity<DietLog> create(@RequestBody DietLog log) {
        if (log.getDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        DietLog saved = repository.save(log);
        return ResponseEntity.status(201).body(saved);
    }
}
