package com.bakery.dto;

import java.math.BigDecimal;

public class PurchaseItemResponse {
    private Long id;
    private Long inventoryItemId;
    private String itemName;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal subtotal;

    public PurchaseItemResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getInventoryItemId() { return inventoryItemId; }
    public void setInventoryItemId(Long inventoryItemId) { this.inventoryItemId = inventoryItemId; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
