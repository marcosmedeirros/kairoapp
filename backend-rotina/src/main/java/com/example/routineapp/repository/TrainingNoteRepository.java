package com.example.routineapp.repository;

import com.example.routineapp.model.TrainingNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingNoteRepository extends JpaRepository<TrainingNote, Long> {
}