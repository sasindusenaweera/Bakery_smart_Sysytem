package com.bakery.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PurchaseItemCreateRequest {
    @NotNull(message = "Inventory item ID is required")
    private Long inventoryItemId;
    @NotNull(message = "Quantity is required")
    private BigDecimal quantity;
    @NotNull(message = "Unit cost is required")
    private BigDecimal unitCost;

    public PurchaseItemCreateRequest() {}

    public Long getInventoryItemId() { return inventoryItemId; }
    public void setInventoryItemId(Long inventoryItemId) { this.inventoryItemId = inventoryItemId; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
}
