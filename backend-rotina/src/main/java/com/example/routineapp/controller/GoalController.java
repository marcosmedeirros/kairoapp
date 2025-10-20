package com.example.routineapp.controller;

import com.example.routineapp.model.Goal;
import com.example.routineapp.model.GoalType;
import com.example.routineapp.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    @GetMapping("/{id}")
    public ResponseEntity<Goal> get(@PathVariable Long id) {
        Optional<Goal> opt = repository.findById(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Goal> create(@RequestBody Map<String, Object> payload) {
        try {
            String description = payload.get("description") == null ? null : payload.get("description").toString();
            String typeStr = payload.get("type") == null ? null : payload.get("type").toString();
            if (description == null || typeStr == null) {
                return ResponseEntity.badRequest().build();
            }

            GoalType type = null;
            try {
                // try enum name first (e.g. "WEEKLY")
                type = GoalType.valueOf(typeStr);
            } catch (Exception ex) {
                try {
                    // fallback to custom string values (e.g. "weekly")
                    type = GoalType.fromString(typeStr);
                } catch (Exception ex2) {
                    return ResponseEntity.badRequest().build();
                }
            }

            LocalDate startDate = null;
            LocalDate endDate = null;
            if (payload.containsKey("startDate") && payload.get("startDate") != null && !payload.get("startDate").toString().isEmpty()) {
                startDate = LocalDate.parse(payload.get("startDate").toString());
            }
            if (payload.containsKey("endDate") && payload.get("endDate") != null && !payload.get("endDate").toString().isEmpty()) {
                endDate = LocalDate.parse(payload.get("endDate").toString());
            }

            Goal g = new Goal(description, type, startDate, endDate);
            Goal saved = repository.save(g);
            return ResponseEntity.status(201).body(saved);
        } catch (Exception e) {
            // if anything unexpected happens, return 500
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> update(@PathVariable Long id, @RequestBody Goal incoming) {
        return repository.findById(id).map(existing -> {
            existing.setDescription(incoming.getDescription());
            existing.setType(incoming.getType());
            existing.setStartDate(incoming.getStartDate());
            existing.setEndDate(incoming.getEndDate());
            existing.setCompleted(incoming.getCompleted());
            Goal saved = repository.save(existing);
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
