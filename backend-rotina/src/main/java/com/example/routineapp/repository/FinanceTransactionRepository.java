package com.example.routineapp.repository;

import com.example.routineapp.model.FinanceTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinanceTransactionRepository extends JpaRepository<FinanceTransaction, Long> {
    List<FinanceTransaction> findAllByOrderByDateDesc();
    List<FinanceTransaction> findByDateBetweenOrderByDateDesc(LocalDate start, LocalDate end);
}
