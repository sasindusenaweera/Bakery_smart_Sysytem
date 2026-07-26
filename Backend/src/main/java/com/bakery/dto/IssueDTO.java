package com.bakery.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record IssueDTO() {

    public record IssueCreate(
        LocalDateTime issueDate,
        String issuedTo,
        String notes,
        List<IssueItemCreate> items
    ) {}

    public record IssueItemCreate(
        Long inventoryItemId,
        BigDecimal quantity
    ) {}

    public record IssueUpdate(
        LocalDateTime issueDate,
        String issuedTo,
        String notes,
        List<IssueItemCreate> items
    ) {}

    public record IssueResponse(
        Long id,
        LocalDateTime issueDate,
        String issuedTo,
        String notes,
        List<IssueItemResponse> items,
        String createdBy,
        LocalDateTime createdAt,
        Integer totalItems,
        BigDecimal totalValue
    ) {}

    public record IssueItemResponse(
        Long id,
        Long inventoryItemId,
        String itemName,
        BigDecimal quantity,
        String unit,
        BigDecimal unitCost,
        BigDecimal subtotal
    ) {}

    public record ProductionUpdate(
        LocalDateTime productionDate,
        String notes,
        List<ProductionItemUpdate> items
    ) {}

    public record ProductionItemUpdate(
        Long productId,
        Integer quantity,
        Integer wasteQuantity
    ) {}

    public record ProductionStats(
        Long totalProductions,
        Long totalItemsProduced,
        Long totalWaste,
        BigDecimal totalCost,
        BigDecimal dailyAverage,
        List<TopProduct> topProducts,
        List<WasteByDay> wasteByDay
    ) {}

    public record TopProduct(
        Long productId,
        String productName,
        Long totalQuantity,
        BigDecimal totalCost
    ) {}

    public record WasteByDay(
        LocalDateTime date,
        Long wasteCount
    ) {}
}
