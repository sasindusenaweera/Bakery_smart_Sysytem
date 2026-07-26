package com.bakery.service;

import com.bakery.dto.ReportDTO;
import com.bakery.entity.InventoryItem;
import com.bakery.entity.PaymentMethod;
import com.bakery.entity.Sale;
import com.bakery.entity.SaleItem;
import com.bakery.repository.InventoryRepository;
import com.bakery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final SaleRepository saleRepository;
    private final InventoryRepository inventoryRepository;

    @NonNull
    public ReportDTO.SalesSummaryReport getSalesSummaryReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Sale> sales = saleRepository.findBySaleDateBetween(startDate, endDate);
        
        long totalTransactions = sales.size();
        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (totalTransactions > 0) {
            averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalTransactions), 2, RoundingMode.HALF_UP);
        }
        
        BigDecimal cashTotal = calculateTotalByPaymentMethod(sales, PaymentMethod.CASH);
        BigDecimal cardTotal = calculateTotalByPaymentMethod(sales, PaymentMethod.CARD);
        BigDecimal creditTotal = calculateTotalByPaymentMethod(sales, PaymentMethod.CREDIT);
        
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        
        List<Sale> todaySales = saleRepository.findBySaleDateBetween(todayStart, todayEnd);
        Long todayTransactions = (long) todaySales.size();
        BigDecimal todayRevenue = todaySales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<ReportDTO.DailySalesReport> dailyBreakdown = generateDailyBreakdown(startDate, endDate);
        
        return new ReportDTO.SalesSummaryReport(
                startDate,
                endDate,
                totalTransactions,
                totalRevenue,
                averageOrderValue,
                cashTotal,
                cardTotal,
                creditTotal,
                todayTransactions,
                todayRevenue,
                dailyBreakdown
        );
    }

    @NonNull
    public List<ReportDTO.TopProductReport> getTopProducts(int limit) {
        List<Sale> allSales = saleRepository.findAll();
        
        Map<Long, ProductStats> productStatsMap = new HashMap<>();
        
        for (Sale sale : allSales) {
            if (sale.getItems() != null) {
                for (SaleItem item : sale.getItems()) {
                    ProductStats stats = productStatsMap.computeIfAbsent(
                            item.getProductId(),
                            id -> new ProductStats(item.getProductId(), item.getProductName())
                    );
                    stats.addQuantity(item.getQuantity());
                    stats.addRevenue(item.getSubtotal());
                }
            }
        }
        
        return productStatsMap.values().stream()
                .sorted((a, b) -> Integer.compare(b.getTotalQuantity(), a.getTotalQuantity()))
                .limit(limit)
                .map(stats -> new ReportDTO.TopProductReport(
                        stats.productId,
                        stats.productName,
                        stats.getTotalQuantity(),
                        stats.getTotalRevenue(),
                        stats.getAveragePrice()
                ))
                .collect(Collectors.toList());
    }

    @NonNull
    public List<ReportDTO.DailySalesReport> getDailyBreakdown(LocalDateTime startDate, LocalDateTime endDate) {
        return generateDailyBreakdown(startDate, endDate);
    }

    @NonNull
    public ReportDTO.InventoryStatusReport getInventoryStatusReport() {
        List<InventoryItem> allItems = inventoryRepository.findAll();
        
        int totalItems = allItems.size();
        
        List<InventoryItem> lowStockItems = allItems.stream()
                .filter(item -> item.getCurrentStock().compareTo(item.getMinimumStock()) <= 0)
                .collect(Collectors.toList());
        
        int lowStockCount = (int) lowStockItems.stream()
                .filter(item -> item.getCurrentStock().compareTo(BigDecimal.ZERO) > 0)
                .count();
        
        int outOfStockCount = (int) lowStockItems.stream()
                .filter(item -> item.getCurrentStock().compareTo(BigDecimal.ZERO) <= 0)
                .count();
        
        BigDecimal totalInventoryValue = allItems.stream()
                .map(item -> item.getCostPerUnit().multiply(item.getCurrentStock()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal lowestValue = allItems.stream()
                .map(item -> item.getCostPerUnit().multiply(item.getCurrentStock()))
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        
        List<ReportDTO.LowStockAlert> alerts = lowStockItems.stream()
                .map(item -> new ReportDTO.LowStockAlert(
                        item.getId(),
                        item.getName(),
                        item.getCurrentStock(),
                        item.getMinimumStock(),
                        item.getCostPerUnit(),
                        item.getUnit(),
                        item.getSupplier(),
                        item.getLastRestocked(),
                        item.getCurrentStock().compareTo(BigDecimal.ZERO) <= 0
                ))
                .collect(Collectors.toList());
        
        return new ReportDTO.InventoryStatusReport(
                totalItems,
                lowStockCount,
                outOfStockCount,
                totalInventoryValue,
                lowestValue,
                alerts
        );
    }

    @NonNull
    public List<ReportDTO.LowStockAlert> getLowStockAlerts() {
        List<InventoryItem> allItems = inventoryRepository.findAll();
        
        return allItems.stream()
                .filter(item -> item.getCurrentStock().compareTo(item.getMinimumStock()) <= 0)
                .map(item -> new ReportDTO.LowStockAlert(
                        item.getId(),
                        item.getName(),
                        item.getCurrentStock(),
                        item.getMinimumStock(),
                        item.getCostPerUnit(),
                        item.getUnit(),
                        item.getSupplier(),
                        item.getLastRestocked(),
                        item.getCurrentStock().compareTo(BigDecimal.ZERO) <= 0
                ))
                .collect(Collectors.toList());
    }

    @NonNull
    public ReportDTO.PerformanceReport getPerformanceReport(String period) {
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        
        switch (period.toUpperCase()) {
            case "WEEK" -> startDate = today.minusWeeks(1);
            case "YEAR" -> startDate = today.minusYears(1);
            case "MONTH" -> startDate = today.minusMonths(1);
            default -> startDate = today.minusWeeks(1);
        }
        
        LocalDate previousStartDate = startDate.minusDays(java.time.temporal.ChronoUnit.DAYS.between(startDate, today));
        
        LocalDateTime currentStart = startDate.atStartOfDay();
        LocalDateTime currentEnd = today.atTime(LocalTime.MAX);
        LocalDateTime previousStart = previousStartDate.atStartOfDay();
        LocalDateTime previousEnd = startDate.atTime(LocalTime.MAX).minusSeconds(1);
        
        List<Sale> currentPeriodSales = saleRepository.findBySaleDateBetween(currentStart, currentEnd);
        List<Sale> previousPeriodSales = saleRepository.findBySaleDateBetween(previousStart, previousEnd);
        
        Long currentTransactions = (long) currentPeriodSales.size();
        Long previousTransactions = (long) previousPeriodSales.size();
        
        BigDecimal currentRevenue = currentPeriodSales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal previousRevenue = previousPeriodSales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal revenueGrowth = BigDecimal.ZERO;
        if (previousRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueGrowth = currentRevenue.subtract(previousRevenue)
                    .divide(previousRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        
        Long transactionGrowth = 0L;
        if (previousTransactions > 0) {
            transactionGrowth = ((currentTransactions - previousTransactions) * 100) / previousTransactions;
        }
        
        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (currentTransactions > 0) {
            averageOrderValue = currentRevenue.divide(BigDecimal.valueOf(currentTransactions), 2, RoundingMode.HALF_UP);
        }
        
        List<ReportDTO.TopProductReport> topProducts = getTopProducts(5);
        List<ReportDTO.DailySalesReport> dailyTrend = generateDailyBreakdown(currentStart, currentEnd);
        
        return new ReportDTO.PerformanceReport(
                startDate,
                today,
                period.toUpperCase(),
                currentTransactions,
                currentRevenue,
                revenueGrowth,
                transactionGrowth,
                averageOrderValue,
                topProducts,
                dailyTrend
        );
    }

    private BigDecimal calculateTotalByPaymentMethod(List<Sale> sales, PaymentMethod method) {
        return sales.stream()
                .filter(sale -> sale.getPaymentMethod() == method)
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<ReportDTO.DailySalesReport> generateDailyBreakdown(LocalDateTime startDate, LocalDateTime endDate) {
        List<Sale> sales = saleRepository.findBySaleDateBetween(startDate, endDate);
        
        Map<LocalDate, List<Sale>> salesByDate = sales.stream()
                .collect(Collectors.groupingBy(sale -> sale.getSaleDate().toLocalDate()));
        
        List<ReportDTO.DailySalesReport> dailyReports = new ArrayList<>();
        
        LocalDate currentDate = startDate.toLocalDate();
        LocalDate endLocalDate = endDate.toLocalDate();
        
        while (!currentDate.isAfter(endLocalDate)) {
            List<Sale> daySales = salesByDate.getOrDefault(currentDate, Collections.emptyList());
            
            long transactionCount = daySales.size();
            BigDecimal revenue = daySales.stream()
                    .map(Sale::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal avgOrderValue = BigDecimal.ZERO;
            if (transactionCount > 0) {
                avgOrderValue = revenue.divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP);
            }
            
            dailyReports.add(new ReportDTO.DailySalesReport(
                    currentDate,
                    transactionCount,
                    revenue,
                    avgOrderValue
            ));
            
            currentDate = currentDate.plusDays(1);
        }
        
        return dailyReports;
    }

    private static class ProductStats {
        final Long productId;
        final String productName;
        private int totalQuantity;
        private BigDecimal totalRevenue;

        ProductStats(Long productId, String productName) {
            this.productId = productId;
            this.productName = productName;
            this.totalQuantity = 0;
            this.totalRevenue = BigDecimal.ZERO;
        }

        void addQuantity(int quantity) {
            this.totalQuantity += quantity;
        }

        void addRevenue(BigDecimal revenue) {
            this.totalRevenue = this.totalRevenue.add(revenue);
        }

        int getTotalQuantity() {
            return totalQuantity;
        }

        BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        BigDecimal getAveragePrice() {
            if (totalQuantity == 0) {
                return BigDecimal.ZERO;
            }
            return totalRevenue.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP);
        }
    }
}
