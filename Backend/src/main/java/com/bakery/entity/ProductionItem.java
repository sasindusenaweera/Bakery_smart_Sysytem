package com.bakery.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "production_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_id", nullable = false)
    private Production production;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @Column(nullable = false)
    private Integer quantity;

    @PositiveOrZero(message = "Waste quantity must be positive")
    @Column(name = "waste_quantity")
    private Integer wasteQuantity;

    @Column(name = "product_cost")
    private BigDecimal productCost;

    public String getProductName() {
        return product != null ? product.getName() : null;
    }

    public Long getProductId() {
        return product != null ? product.getId() : null;
    }
}
