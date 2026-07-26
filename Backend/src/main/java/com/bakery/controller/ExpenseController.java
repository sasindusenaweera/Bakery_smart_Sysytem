package com.bakery.controller;

import com.bakery.dto.OwnerDTO;
import com.bakery.service.ExpenseFundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor

public class ExpenseController {

    private final ExpenseFundService expenseFundService;

    @GetMapping
    public ResponseEntity<List<OwnerDTO.ExpenseResponse>> getAllExpenses() {
        return ResponseEntity.ok(expenseFundService.getAllExpenses());
    }

    @GetMapping("/fund/{fundId}")
    public ResponseEntity<List<OwnerDTO.ExpenseResponse>> getExpensesByFund(@PathVariable Long fundId) {
        return ResponseEntity.ok(expenseFundService.getExpensesByFund(fundId));
    }

    @PostMapping
    public ResponseEntity<OwnerDTO.ExpenseResponse> createExpense(@RequestBody OwnerDTO.ExpenseCreate createDTO) {
        return new ResponseEntity<>(expenseFundService.createExpense(createDTO), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseFundService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
