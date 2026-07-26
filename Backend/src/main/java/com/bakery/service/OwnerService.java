package com.bakery.service;

import com.bakery.dto.OwnerDTO;
import com.bakery.entity.*;
import com.bakery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerService {

    private final SaleRepository saleRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductionRepository productionRepository;
    private final CustomerOrderRepository orderRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final CreditCustomerRepository creditCustomerRepository;

    @NonNull
    public OwnerDTO.DashboardSummary getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);
        LocalDateTime weekStart = today.minusDays(7).atStartOfDay();
        LocalDateTime monthStart = today.minusDays(30).atStartOfDay();

        OwnerDTO.SalesOverview sales = getSalesOverview(dayStart, dayEnd, weekStart, monthStart);
        OwnerDTO.InventoryOverview inventory = getInventoryOverview();
        OwnerDTO.ProductionOverview production = getProductionOverview(dayStart);
        OwnerDTO.OrdersOverview orders = getOrdersOverview(dayStart);
        OwnerDTO.QuickStats stats = getQuickStats(dayStart);

        return new OwnerDTO.DashboardSummary(sales, inventory, production, orders, stats);
    }

    @NonNull
    private OwnerDTO.SalesOverview getSalesOverview(LocalDateTime dayStart, LocalDateTime dayEnd, 
                                                     LocalDateTime weekStart, LocalDateTime monthStart) {
        List<Sale> daySales = saleRepository.findBySaleDateBetween(dayStart, dayEnd);
        List<Sale> weekSales = saleRepository.findBySaleDateBetween(weekStart, dayEnd);
        List<Sale> monthSales = saleRepository.findBySaleDateBetween(monthStart, dayEnd);

        BigDecimal todayRevenue = daySales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal weeklyRevenue = weekSales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal monthlyRevenue = monthSales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Long, List<Sale>> salesByCashier = daySales.stream()
                .filter(s -> s.getCashierId() != null)
                .collect(Collectors.groupingBy(Sale::getCashierId));

        List<OwnerDTO.CashierSalesSummary> cashierSummaries = salesByCashier.entrySet().stream()
                .map(entry -> {
                    Long cashierId = entry.getKey();
                    List<Sale> cashierSales = entry.getValue();
                    BigDecimal total = cashierSales.stream()
                            .map(Sale::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new OwnerDTO.CashierSalesSummary(cashierId, 
                            cashierSales.get(0).getCashierName(), total, (long) cashierSales.size());
                })
                .collect(Collectors.toList());

        List<OwnerDTO.DailySales> dailySales = daySales.stream()
                .collect(Collectors.groupingBy(s -> s.getSaleDate().toLocalDate()))
                .entrySet().stream()
                .map(e -> new OwnerDTO.DailySales(
                        e.getKey().atStartOfDay(),
                        e.getValue().stream().map(Sale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                        (long) e.getValue().size()))
                .sorted(Comparator.comparing(OwnerDTO.DailySales::date))
                .collect(Collectors.toList());

        return new OwnerDTO.SalesOverview(
                todayRevenue, weeklyRevenue, monthlyRevenue,
                (long) daySales.size(), (long) weekSales.size(), (long) monthSales.size(),
                cashierSummaries, dailySales);
    }

    @NonNull
    private OwnerDTO.InventoryOverview getInventoryOverview() {
        List<InventoryItem> items = inventoryRepository.findAll();

        List<InventoryItem> lowStock = items.stream()
                .filter(i -> i.getCurrentStock().compareTo(i.getMinimumStock()) <= 0)
                .collect(Collectors.toList());

        int outOfStock = (int) lowStock.stream()
                .filter(i -> i.getCurrentStock().compareTo(BigDecimal.ZERO) <= 0)
                .count();

        BigDecimal totalValue = items.stream()
                .map(i -> i.getCostPerUnit().multiply(i.getCurrentStock()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<OwnerDTO.LowStockItem> lowStockItems = lowStock.stream()
                .map(i -> new OwnerDTO.LowStockItem(
                        i.getId(), i.getName(), i.getCurrentStock(), i.getMinimumStock(), i.getUnit()))
                .collect(Collectors.toList());

        return new OwnerDTO.InventoryOverview(
                items.size(), lowStock.size(), outOfStock, totalValue, lowStockItems);
    }

    @NonNull
    private OwnerDTO.ProductionOverview getProductionOverview(LocalDateTime dayStart) {
        List<Production> todayProductions = productionRepository.findByProductionDateBetween(
                dayStart, LocalDateTime.now());

        List<Production> recentProductions = productionRepository.findTop10ByOrderByProductionDateDesc();

        BigDecimal estimatedCost = todayProductions.stream()
                .flatMap(p -> p.getItems().stream())
                .map(item -> {
                    if (item.getProductCost() != null && item.getQuantity() != null) {
                        return item.getProductCost().multiply(BigDecimal.valueOf(item.getQuantity()));
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<OwnerDTO.ProductionRecord> records = recentProductions.stream()
                .map(p -> new OwnerDTO.ProductionRecord(
                        p.getId(), p.getProductionDate(), p.getItems().size(), 
                        BigDecimal.ZERO, p.getNotes()))
                .collect(Collectors.toList());

        return new OwnerDTO.ProductionOverview(
                todayProductions.size(), estimatedCost, records);
    }

    @NonNull
    private OwnerDTO.OrdersOverview getOrdersOverview(LocalDateTime dayStart) {
        long pending = orderRepository.countByStatus(CustomerOrder.OrderStatus.PENDING);
        long preparing = orderRepository.countByStatus(CustomerOrder.OrderStatus.PREPARING);
        long ready = orderRepository.countByStatus(CustomerOrder.OrderStatus.READY);

        List<CustomerOrder> todayOrders = orderRepository.findByOrderDateBetweenOrderByOrderDateDesc(
                dayStart, LocalDateTime.now());

        BigDecimal todayOrdersValue = todayOrders.stream()
                .filter(o -> o.getTotalAmount() != null)
                .map(CustomerOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CustomerOrder> recentOrders = orderRepository.findTop10ByOrderByOrderDateDesc();

        List<OwnerDTO.OrderSummary> recent = recentOrders.stream()
                .map(o -> new OwnerDTO.OrderSummary(
                        o.getId(), o.getCustomerName(), o.getOrderDate(),
                        o.getStatus().name(), o.getTotalAmount()))
                .collect(Collectors.toList());

        return new OwnerDTO.OrdersOverview(pending, preparing, ready, 
                (long) todayOrders.size(), todayOrdersValue, recent);
    }

    @NonNull
    private OwnerDTO.QuickStats getQuickStats(LocalDateTime dayStart) {
        BigDecimal expenses = expenseRepository.sumExpensesBetween(dayStart, LocalDateTime.now());
        BigDecimal creditIssued = creditTransactionRepository.sumCreditIssuedSince(dayStart);
        BigDecimal paymentsReceived = creditTransactionRepository.sumPaymentsReceivedSince(dayStart);
        BigDecimal supplierDues = purchaseRepository.sumTotalPendingAmount();
        long customerCount = creditCustomerRepository.count();

        BigDecimal cashOnHand = (paymentsReceived != null ? paymentsReceived : BigDecimal.ZERO)
                .subtract(expenses != null ? expenses : BigDecimal.ZERO);
        BigDecimal creditDue = (creditIssued != null ? creditIssued : BigDecimal.ZERO)
                .subtract(paymentsReceived != null ? paymentsReceived : BigDecimal.ZERO);

        return new OwnerDTO.QuickStats(
                cashOnHand,
                expenses != null ? expenses : BigDecimal.ZERO,
                creditDue,
                supplierDues != null ? supplierDues : BigDecimal.ZERO,
                customerCount);
    }
}
