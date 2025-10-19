package com.example.routineapp.repository;

import com.example.routineapp.model.DietLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DietLogRepository extends JpaRepository<DietLog, Long> {
}