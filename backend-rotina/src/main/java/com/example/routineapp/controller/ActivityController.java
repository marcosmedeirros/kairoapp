package com.example.routineapp.controller;

import com.example.routineapp.model.Activity;
import com.example.routineapp.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    public ResponseEntity<Activity> create(@RequestBody Activity activity) {
        if (activity.getTitle() == null || activity.getDate() == null || activity.getTime() == null) {
            return ResponseEntity.badRequest().build();
        }
        Activity saved = repository.save(activity);
        return ResponseEntity.status(201).body(saved);
    }
}