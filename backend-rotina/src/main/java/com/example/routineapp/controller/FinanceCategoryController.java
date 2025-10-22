package com.example.routineapp.controller;

import com.example.routineapp.model.FinanceCategory;
import com.example.routineapp.repository.FinanceCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/finance/categories")
@CrossOrigin
public class FinanceCategoryController {
    @Autowired
    private FinanceCategoryRepository repository;

    @GetMapping
    public List<FinanceCategory> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinanceCategory> get(@PathVariable Long id) {
        Optional<FinanceCategory> opt = repository.findById(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FinanceCategory> create(@RequestBody FinanceCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        FinanceCategory saved = repository.save(category);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinanceCategory> update(@PathVariable Long id, @RequestBody FinanceCategory incoming) {
        return repository.findById(id).map(existing -> {
            existing.setName(incoming.getName());
            FinanceCategory saved = repository.save(existing);
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
