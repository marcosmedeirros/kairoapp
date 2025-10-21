package com.example.routineapp.controller;

import com.example.routineapp.model.Workout;
import com.example.routineapp.model.WorkoutLog;
import com.example.routineapp.repository.WorkoutLogRepository;
import com.example.routineapp.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workout-logs")
@CrossOrigin
public class WorkoutLogController {
    @Autowired
    private WorkoutLogRepository logRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @GetMapping
    public List<WorkoutLog> list() {
        return logRepository.findAllByOrderByDateDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutLog> get(@PathVariable Long id) {
        Optional<WorkoutLog> opt = logRepository.findById(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<WorkoutLog> create(@RequestBody Map<String, Object> payload) {
        Long workoutId = payload.get("workoutId") != null 
            ? Long.valueOf(payload.get("workoutId").toString()) 
            : null;
        
        String dateStr = payload.get("date") != null ? payload.get("date").toString() : null;
        LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();

        if (workoutId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Workout> workoutOpt = workoutRepository.findById(workoutId);
        if (!workoutOpt.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        WorkoutLog log = new WorkoutLog(date, workoutOpt.get());
        WorkoutLog saved = logRepository.save(log);
        return ResponseEntity.status(201).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!logRepository.existsById(id)) return ResponseEntity.notFound().build();
        logRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
