package com.bakery.dto;

import com.bakery.entity.ProductCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public sealed interface ProductDTO permits ProductDTO.Create, ProductDTO.Update, ProductDTO.Response, ProductDTO.StockUpdate, ProductDTO.AvailabilityUpdate {

    record Create(
        @NotBlank(message = "Product name is required")
        String name,
        
        String description,
        
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        BigDecimal price,
        
        @DecimalMin(value = "0.00", message = "Cost price cannot be negative")
        BigDecimal costPrice,
        
        @NotNull(message = "Category is required")
        ProductCategory category,
        
        String imageUrl,
        
        @Min(value = 0, message = "Stock quantity cannot be negative")
        Integer stockQuantity
    ) implements ProductDTO {}

    record Update(
        @NotBlank(message = "Product name is required")
        String name,
        
        String description,
        
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        BigDecimal price,
        
        @DecimalMin(value = "0.00", message = "Cost price cannot be negative")
        BigDecimal costPrice,
        
        @NotNull(message = "Category is required")
        ProductCategory category,
        
        String imageUrl,
        
        @Min(value = 0, message = "Stock quantity cannot be negative")
        Integer stockQuantity
    ) implements ProductDTO {}

    record Response(
        Long id,
        String name,
        String description,
        BigDecimal price,
        BigDecimal costPrice,
        ProductCategory category,
        String imageUrl,
        Boolean isAvailable,
        Integer stockQuantity
    ) implements ProductDTO {}

    record StockUpdate(
        @Min(value = 0, message = "Quantity cannot be negative")
        Integer quantity
    ) implements ProductDTO {}

    record AvailabilityUpdate(
        Boolean isAvailable
    ) implements ProductDTO {}
}
