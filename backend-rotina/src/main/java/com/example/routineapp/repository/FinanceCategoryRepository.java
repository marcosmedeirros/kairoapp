package com.example.routineapp.repository;

import com.example.routineapp.model.FinanceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinanceCategoryRepository extends JpaRepository<FinanceCategory, Long> {
}
