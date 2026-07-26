package com.bakery.controller;

import com.bakery.dto.ReportDTO;
import com.bakery.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor

public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales-summary")
    public ResponseEntity<ReportDTO.SalesSummaryReport> getSalesSummaryReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        ReportDTO.SalesSummaryReport report = reportService.getSalesSummaryReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<ReportDTO.TopProductReport>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        List<ReportDTO.TopProductReport> report = reportService.getTopProducts(limit);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/daily-breakdown")
    public ResponseEntity<List<ReportDTO.DailySalesReport>> getDailyBreakdown(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<ReportDTO.DailySalesReport> report = reportService.getDailyBreakdown(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/inventory-status")
    public ResponseEntity<ReportDTO.InventoryStatusReport> getInventoryStatusReport() {
        ReportDTO.InventoryStatusReport report = reportService.getInventoryStatusReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/low-stock-alerts")
    public ResponseEntity<List<ReportDTO.LowStockAlert>> getLowStockAlerts() {
        List<ReportDTO.LowStockAlert> alerts = reportService.getLowStockAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/performance")
    public ResponseEntity<ReportDTO.PerformanceReport> getPerformanceReport(
            @RequestParam(defaultValue = "WEEK") String period) {
        ReportDTO.PerformanceReport report = reportService.getPerformanceReport(period);
        return ResponseEntity.ok(report);
    }
}
