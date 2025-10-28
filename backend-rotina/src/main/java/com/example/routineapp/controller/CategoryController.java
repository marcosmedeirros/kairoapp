package com.example.routineapp.controller;

import com.example.routineapp.model.Category;
import com.example.routineapp.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryRepository repository;

    @GetMapping
    public List<Category> list() { return repository.findAll(); }

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        // default color if missing
        if (category.getColor() == null || category.getColor().isBlank()) {
            category.setColor("#888888");
        }
        if (repository.existsByNameIgnoreCase(category.getName())) {
            return ResponseEntity.status(409).build();
        }
        Category saved = repository.save(category);
        return ResponseEntity.status(201).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

