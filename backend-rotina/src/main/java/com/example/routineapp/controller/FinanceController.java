package com.example.routineapp.controller;

import com.example.routineapp.model.FinanceCategory;
import com.example.routineapp.model.FinanceTransaction;
import com.example.routineapp.model.TransactionType;
import com.example.routineapp.repository.FinanceCategoryRepository;
import com.example.routineapp.repository.FinanceTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin
public class FinanceController {
    @Autowired
    private FinanceTransactionRepository transactionRepository;

    @Autowired
    private FinanceCategoryRepository categoryRepository;

    // Listar transações (opcionalmente por mês YYYY-MM)
    @GetMapping("/transactions")
    public List<FinanceTransaction> listTransactions(@RequestParam(value = "month", required = false) String month) {
        if (month != null && !month.isEmpty()) {
            YearMonth ym = YearMonth.parse(month);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();
            return transactionRepository.findByDateBetweenOrderByDateDesc(start, end);
        }
        return transactionRepository.findAllByOrderByDateDesc();
    }

    // Criar transação
    @PostMapping("/transactions")
    public ResponseEntity<FinanceTransaction> createTransaction(@RequestBody Map<String, Object> payload) {
        try {
            String dateStr = payload.get("date") != null ? payload.get("date").toString() : null;
            LocalDate date = dateStr != null && !dateStr.isEmpty() ? LocalDate.parse(dateStr) : LocalDate.now();

            if (payload.get("amount") == null) return ResponseEntity.badRequest().build();
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) return ResponseEntity.badRequest().build();

            if (payload.get("type") == null) return ResponseEntity.badRequest().build();
            String typeStr = payload.get("type").toString();
            TransactionType type;
            try {
                type = TransactionType.valueOf(typeStr);
            } catch (Exception ex) {
                return ResponseEntity.badRequest().build();
            }

            Long categoryId = payload.get("categoryId") != null ? Long.valueOf(payload.get("categoryId").toString()) : null;
            if (categoryId == null) return ResponseEntity.badRequest().build();
            Optional<FinanceCategory> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isEmpty()) return ResponseEntity.badRequest().build();

            String description = payload.get("description") != null ? payload.get("description").toString() : null;

            FinanceTransaction tx = new FinanceTransaction(date, amount, type, categoryOpt.get(), description);
            FinanceTransaction saved = transactionRepository.save(tx);
            return ResponseEntity.status(201).body(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Atualizar transação
    @PutMapping("/transactions/{id}")
    public ResponseEntity<FinanceTransaction> updateTransaction(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Optional<FinanceTransaction> txOpt = transactionRepository.findById(id);
            if (txOpt.isEmpty()) return ResponseEntity.notFound().build();

            FinanceTransaction tx = txOpt.get();

            if (payload.containsKey("date") && payload.get("date") != null) {
                tx.setDate(LocalDate.parse(payload.get("date").toString()));
            }

            if (payload.containsKey("amount") && payload.get("amount") != null) {
                BigDecimal amount = new BigDecimal(payload.get("amount").toString());
                if (amount.compareTo(BigDecimal.ZERO) <= 0) return ResponseEntity.badRequest().build();
                tx.setAmount(amount);
            }

            if (payload.containsKey("type") && payload.get("type") != null) {
                try {
                    TransactionType type = TransactionType.valueOf(payload.get("type").toString());
                    tx.setType(type);
                } catch (Exception ex) {
                    return ResponseEntity.badRequest().build();
                }
            }

            if (payload.containsKey("categoryId") && payload.get("categoryId") != null) {
                Long categoryId = Long.valueOf(payload.get("categoryId").toString());
                Optional<FinanceCategory> categoryOpt = categoryRepository.findById(categoryId);
                if (categoryOpt.isEmpty()) return ResponseEntity.badRequest().build();
                tx.setCategory(categoryOpt.get());
            }

            if (payload.containsKey("description")) {
                tx.setDescription(payload.get("description") != null ? payload.get("description").toString() : null);
            }

            FinanceTransaction saved = transactionRepository.save(tx);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Remover transação
    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        if (!transactionRepository.existsById(id)) return ResponseEntity.notFound().build();
        transactionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Resumo mensal: entradas, saídas, saldo e por categoria (apenas despesas)
    @GetMapping("/summary")
    public Map<String, Object> summary(@RequestParam(value = "month", required = false) String month) {
        YearMonth ym = (month != null && !month.isEmpty()) ? YearMonth.parse(month) : YearMonth.now();
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<FinanceTransaction> txs = transactionRepository.findByDateBetweenOrderByDateDesc(start, end);

        BigDecimal income = txs.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(FinanceTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expense = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(FinanceTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = income.subtract(expense);

        // Agrupar despesas por categoria
        Map<Long, BigDecimal> byCat = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getCategory() != null)
                .collect(Collectors.groupingBy(t -> t.getCategory().getId(),
                        Collectors.reducing(BigDecimal.ZERO, FinanceTransaction::getAmount, BigDecimal::add)));

        List<Map<String, Object>> byCategory = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> e : byCat.entrySet()) {
            Long catId = e.getKey();
            BigDecimal total = e.getValue();
            Optional<FinanceCategory> catOpt = categoryRepository.findById(catId);
            String catName = catOpt.map(FinanceCategory::getName).orElse("Categoria");
            Map<String, Object> item = new HashMap<>();
            item.put("categoryId", catId);
            item.put("categoryName", catName);
            item.put("total", total);
            byCategory.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("month", ym.toString());
        result.put("income", income);
        result.put("expense", expense);
        result.put("balance", balance);
        result.put("byCategory", byCategory);
        return result;
    }
}
