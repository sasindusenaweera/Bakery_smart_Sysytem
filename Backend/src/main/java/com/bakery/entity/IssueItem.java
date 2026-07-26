package com.bakery.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "issue_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;

    public String getItemName() {
        return inventoryItem != null ? inventoryItem.getName() : null;
    }

    public Long getInventoryItemId() {
        return inventoryItem != null ? inventoryItem.getId() : null;
    }

    public String getUnit() {
        return inventoryItem != null ? inventoryItem.getUnit() : null;
    }

    public BigDecimal getSubtotal() {
        if (quantity == null || unitCost == null) {
            return BigDecimal.ZERO;
        }
        return quantity.multiply(unitCost);
    }
}
