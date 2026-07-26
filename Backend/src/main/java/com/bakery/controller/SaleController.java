package com.bakery.controller;

import com.bakery.dto.SaleDTO;
import com.bakery.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor

public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<List<SaleDTO.Response>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleDTO.Response> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @GetMapping("/today")
    public ResponseEntity<List<SaleDTO.Response>> getTodaySales() {
        return ResponseEntity.ok(saleService.getTodaySales());
    }

    @GetMapping("/summary")
    public ResponseEntity<SaleDTO.SalesSummary> getSalesSummary() {
        return ResponseEntity.ok(saleService.getSalesSummary());
    }

    @GetMapping("/report")
    public ResponseEntity<List<SaleDTO.Response>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(saleService.getSalesByDateRange(start, end));
    }

    @PostMapping
    public ResponseEntity<SaleDTO.Response> createSale(@Valid @RequestBody SaleDTO.Create createDTO) {
        SaleDTO.Response response = saleService.createSale(createDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
