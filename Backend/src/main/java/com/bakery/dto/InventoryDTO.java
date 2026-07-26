package com.bakery.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public sealed interface InventoryDTO permits InventoryDTO.Create, InventoryDTO.Update, InventoryDTO.Response, InventoryDTO.StockAdjustment {

    record Create(
        @NotBlank(message = "Item name is required")
        String name,
        
        String description,
        
        @NotBlank(message = "Unit is required")
        String unit,
        
        @NotNull(message = "Current stock is required")
        @DecimalMin(value = "0.00", message = "Current stock cannot be negative")
        BigDecimal currentStock,
        
        @NotNull(message = "Minimum stock is required")
        @DecimalMin(value = "0.00", message = "Minimum stock cannot be negative")
        BigDecimal minimumStock,
        
        @DecimalMin(value = "0.00", message = "Cost per unit cannot be negative")
        BigDecimal costPerUnit,
        
        String supplier,
        
        String imageUrl
    ) implements InventoryDTO {}

    record Update(
        @NotBlank(message = "Item name is required")
        String name,
        
        String description,
        
        @NotBlank(message = "Unit is required")
        String unit,
        
        @NotNull(message = "Current stock is required")
        @DecimalMin(value = "0.00", message = "Current stock cannot be negative")
        BigDecimal currentStock,
        
        @NotNull(message = "Minimum stock is required")
        @DecimalMin(value = "0.00", message = "Minimum stock cannot be negative")
        BigDecimal minimumStock,
        
        @DecimalMin(value = "0.00", message = "Cost per unit cannot be negative")
        BigDecimal costPerUnit,
        
        String supplier,
        
        String imageUrl
    ) implements InventoryDTO {}

    record Response(
        Long id,
        String name,
        String description,
        String unit,
        BigDecimal currentStock,
        BigDecimal minimumStock,
        BigDecimal costPerUnit,
        String supplier,
        String imageUrl,
        LocalDateTime lastRestocked,
        boolean isLowStock
    ) implements InventoryDTO {}

    record StockAdjustment(
        @NotNull(message = "Adjustment is required")
        BigDecimal adjustment
    ) implements InventoryDTO {}
}
