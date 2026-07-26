package com.bakery.repository;

import com.bakery.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByExpenseDateBetweenOrderByExpenseDateDesc(LocalDateTime start, LocalDateTime end);

    List<Expense> findTop10ByOrderByExpenseDateDesc();

    List<Expense> findByCategoryOrderByExpenseDateDesc(String category);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.expenseDate >= :startDate")
    BigDecimal sumExpensesSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.expenseDate >= :startDate AND e.expenseDate < :endDate")
    BigDecimal sumExpensesBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Expense> findByCategoryIn(List<String> categories);

    List<Expense> findByExpenseFundIdOrderByExpenseDateDesc(Long expenseFundId);

    List<Expense> findAllByOrderByExpenseDateDesc();
}
