package com.bakery.controller;

import com.bakery.dto.OwnerDTO;
import com.bakery.service.ExpenseFundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense-funds")
@RequiredArgsConstructor

public class ExpenseFundController {

    private final ExpenseFundService expenseFundService;

    @GetMapping
    public ResponseEntity<List<OwnerDTO.ExpenseFundResponse>> getAllExpenseFunds() {
        return ResponseEntity.ok(expenseFundService.getAllExpenseFunds());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OwnerDTO.ExpenseFundResponse> getExpenseFundById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseFundService.getExpenseFundById(id));
    }

    @GetMapping("/summary")
    public ResponseEntity<OwnerDTO.ExpenseFundSummary> getExpenseFundSummary() {
        return ResponseEntity.ok(expenseFundService.getExpenseFundSummary());
    }

    @PostMapping
    public ResponseEntity<OwnerDTO.ExpenseFundResponse> createExpenseFund(@RequestBody OwnerDTO.ExpenseFundCreate createDTO) {
        return new ResponseEntity<>(expenseFundService.createExpenseFund(createDTO), HttpStatus.CREATED);
    }
}
