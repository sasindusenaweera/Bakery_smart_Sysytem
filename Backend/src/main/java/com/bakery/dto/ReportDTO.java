package com.bakery.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public sealed interface ReportDTO permits 
        ReportDTO.SalesSummaryReport,
        ReportDTO.TopProductReport,
        ReportDTO.DailySalesReport,
        ReportDTO.InventoryStatusReport,
        ReportDTO.LowStockAlert,
        ReportDTO.PerformanceReport {

    record SalesSummaryReport(
        LocalDateTime startDate,
        LocalDateTime endDate,
        Long totalTransactions,
        BigDecimal totalRevenue,
        BigDecimal averageOrderValue,
        BigDecimal cashTotal,
        BigDecimal cardTotal,
        BigDecimal creditTotal,
        Long todayTransactions,
        BigDecimal todayRevenue,
        List<DailySalesReport> dailyBreakdown
    ) implements ReportDTO {}

    record TopProductReport(
        Long productId,
        String productName,
        Integer totalQuantitySold,
        BigDecimal totalRevenue,
        BigDecimal averagePrice
    ) implements ReportDTO {}

    record DailySalesReport(
        LocalDate date,
        Long transactionCount,
        BigDecimal revenue,
        BigDecimal averageOrderValue
    ) implements ReportDTO {}

    record InventoryStatusReport(
        Integer totalItems,
        Integer lowStockCount,
        Integer outOfStockCount,
        BigDecimal totalInventoryValue,
        BigDecimal lowestStockItemValue,
        List<LowStockAlert> lowStockItems
    ) implements ReportDTO {}

    record LowStockAlert(
        Long itemId,
        String itemName,
        BigDecimal currentStock,
        BigDecimal minimumStock,
        BigDecimal costPerUnit,
        String unit,
        String supplier,
        LocalDateTime lastRestocked,
        boolean isOutOfStock
    ) implements ReportDTO {}

    record PerformanceReport(
        LocalDate startDate,
        LocalDate endDate,
        String period,
        Long totalTransactions,
        BigDecimal totalRevenue,
        BigDecimal revenueGrowth,
        Long transactionGrowth,
        BigDecimal averageOrderValue,
        List<TopProductReport> topProducts,
        List<DailySalesReport> dailyTrend
    ) implements ReportDTO {}
}
