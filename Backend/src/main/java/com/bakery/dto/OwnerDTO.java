package com.bakery.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

public record OwnerDTO() {

    public record DashboardSummary(
        SalesOverview sales,
        InventoryOverview inventory,
        ProductionOverview production,
        OrdersOverview orders,
        QuickStats stats
    ) {}

    public record SalesOverview(
        BigDecimal todayRevenue,
        BigDecimal weeklyRevenue,
        BigDecimal monthlyRevenue,
        Long todayTransactions,
        Long weeklyTransactions,
        Long monthlyTransactions,
        List<CashierSalesSummary> cashierSales,
        List<DailySales> dailySales
    ) {}

    public record CashierSalesSummary(
        Long cashierId,
        String cashierName,
        BigDecimal totalSales,
        Long transactionCount
    ) {}

    public record DailySales(
        LocalDateTime date,
        BigDecimal revenue,
        Long transactions
    ) {}

    public record InventoryOverview(
        Integer totalItems,
        Integer lowStockCount,
        Integer outOfStockCount,
        BigDecimal totalValue,
        List<LowStockItem> lowStockItems
    ) {}

    public record LowStockItem(
        Long id,
        String name,
        BigDecimal currentStock,
        BigDecimal minimumStock,
        String unit
    ) {}

    public record ProductionOverview(
        Integer todayProductions,
        BigDecimal todayProductionCost,
        List<ProductionRecord> recentProductions
    ) {}

    public record ProductionRecord(
        Long id,
        LocalDateTime productionDate,
        Integer itemCount,
        BigDecimal estimatedCost,
        String notes
    ) {}

    public record OrdersOverview(
        Long pendingOrders,
        Long preparingOrders,
        Long readyOrders,
        Long todayOrders,
        BigDecimal todayOrdersValue,
        List<OrderSummary> recentOrders
    ) {}

    public record OrderSummary(
        Long id,
        String customerName,
        LocalDateTime orderDate,
        String status,
        BigDecimal totalAmount
    ) {}

    public record QuickStats(
        BigDecimal cashOnHand,
        BigDecimal totalExpenses,
        BigDecimal creditDue,
        BigDecimal supplierDues,
        Long activeCustomers
    ) {}

    public record ProductionCreate(
        LocalDateTime productionDate,
        String notes,
        List<ProductionItemCreate> items
    ) {}

    public record ProductionItemCreate(
        Long productId,
        Integer quantity,
        Integer wasteQuantity
    ) {}

    public record ProductionResponse(
        Long id,
        LocalDateTime productionDate,
        String notes,
        List<ProductionItemResponse> items,
        LocalDateTime createdAt,
        String enteredBy,
        String enteredByRole
    ) {}

    public record ProductionItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        Integer wasteQuantity,
        BigDecimal productCost
    ) {}

    public record OrderCreate(
        String customerName,
        String phoneNumber,
        LocalDateTime orderDate,
        LocalDateTime requiredDate,
        String deliveryAddress,
        String notes,
        List<OrderItemCreate> items
    ) {}

    public record OrderItemCreate(
        Long productId,
        Integer quantity,
        BigDecimal unitPrice
    ) {}

    public record OrderResponse(
        Long id,
        String customerName,
        String phoneNumber,
        LocalDateTime orderDate,
        LocalDateTime requiredDate,
        String deliveryAddress,
        String status,
        String notes,
        String preparationNotes,
        BigDecimal totalAmount,
        BigDecimal advancePayment,
        BigDecimal paidAmount,
        BigDecimal pendingAmount,
        List<OrderItemResponse> items,
        LocalDateTime createdAt
    ) {}

    public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
    ) {}

    public record OrderUpdateStatus(
        String status,
        String preparationNotes,
        String cancellationReason
    ) {}

    public record OrderCancellation(
        String cancellationReason
    ) {}

    public record OrderPayment(
        BigDecimal advancePayment,
        BigDecimal paidAmount,
        String notes
    ) {}

    public record SupplierDTO(
        Long id,
        String name,
        String contactPerson,
        String phoneNumber,
        String email,
        String address,
        String itemsSupplied,
        Integer leadTimeDays,
        String paymentTerms,
        BigDecimal totalPurchases,
        BigDecimal pendingAmount,
        boolean active
    ) {}

    public record PurchaseCreate(
        Long supplierId,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime purchaseDate,
        String invoiceNumber,
        String notes,
        List<PurchaseItemCreate> items
    ) {}

    public record PurchaseItemCreate(
        Long inventoryItemId,
        BigDecimal quantity,
        BigDecimal unitCost
    ) {}

    public record PurchaseResponse(
        Long id,
        SupplierDTO supplier,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime purchaseDate,
        String invoiceNumber,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal pendingAmount,
        String notes,
        List<PurchaseItemResponse> items,
        LocalDateTime createdAt
    ) {}

    public record PurchaseItemResponse(
        Long id,
        Long inventoryItemId,
        String itemName,
        BigDecimal quantity,
        BigDecimal unitCost,
        BigDecimal subtotal
    ) {}

    public record ExpenseCreate(
        String title,
        String category,
        LocalDate expenseDate,
        BigDecimal amount,
        String description,
        Long expenseFundId
    ) {}

    public record ExpenseResponse(
        Long id,
        String title,
        String category,
        BigDecimal amount,
        String description,
        LocalDate expenseDate,
        Long expenseFundId,
        LocalDateTime createdAt
    ) {}

    public record ExpenseFundCreate(
        BigDecimal allocatedAmount,
        LocalDate allocationDate,
        String notes
    ) {}

    public record ExpenseFundResponse(
        Long id,
        BigDecimal allocatedAmount,
        BigDecimal usedAmount,
        BigDecimal remainingBalance,
        LocalDate allocationDate,
        String notes,
        String allocatedByName,
        LocalDateTime createdAt,
        List<ExpenseResponse> expenses
    ) {}

    public record ExpenseFundSummary(
        BigDecimal totalAllocated,
        BigDecimal totalUsed,
        BigDecimal totalRemaining,
        Long totalFunds,
        Long totalExpenses
    ) {}

    public record CreditTransactionCreate(
        String customerName,
        String phoneNumber,
        BigDecimal amount,
        String transactionType,
        LocalDateTime transactionDate,
        String notes
    ) {}

    public record CreditTransactionResponse(
        Long id,
        String customerName,
        String phoneNumber,
        BigDecimal amount,
        String transactionType,
        LocalDateTime transactionDate,
        String notes,
        String referenceNumber,
        LocalDateTime createdAt
    ) {}

    public record CreditEntryCreate(
        String customerName,
        String phoneNumber,
        String address,
        BigDecimal creditAmount,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime dueDate,
        String notes,
        Long linkedOrderId,
        List<CreditItemCreate> items
    ) {}

    public record CreditItemCreate(
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
    ) {}

    public record CreditEntryResponse(
        Long id,
        String customerName,
        String phoneNumber,
        String address,
        BigDecimal creditAmount,
        BigDecimal paidAmount,
        BigDecimal remainingBalance,
        LocalDateTime dueDate,
        String status,
        String notes,
        Long linkedOrderId,
        String referenceNumber,
        List<CreditItemResponse> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}

    public record CreditItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
    ) {}

    public record CreditPaymentCreate(
        BigDecimal amount,
        String paymentMethod,
        String notes
    ) {}

    public record CreditPaymentResponse(
        Long id,
        Long creditEntryId,
        BigDecimal amount,
        String paymentMethod,
        String notes,
        String referenceNumber,
        LocalDateTime paymentDate,
        LocalDateTime createdAt
    ) {}

    public record CreditSummary(
        BigDecimal totalCreditIssued,
        BigDecimal totalCollected,
        BigDecimal pendingBalance,
        BigDecimal overdueAmount,
        Long totalCustomers,
        Long overdueCustomers
    ) {}

    public record CreditCustomerResponse(
        String customerName,
        String phoneNumber,
        String address,
        BigDecimal totalCredit,
        BigDecimal totalPaid,
        BigDecimal remainingBalance,
        Long transactionCount,
        LocalDateTime lastTransactionDate,
        String status
    ) {}
}
