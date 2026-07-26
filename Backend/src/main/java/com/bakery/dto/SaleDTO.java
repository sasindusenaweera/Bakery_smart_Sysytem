package com.bakery.dto;

import com.bakery.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public sealed interface SaleDTO permits SaleDTO.Create, SaleDTO.Response, SaleDTO.ItemData, SaleDTO.SaleItemResponse, SaleDTO.SalesSummary {

    record ItemData(
        @NotNull(message = "Product ID is required")
        Long productId,
        
        @NotNull(message = "Product name is required")
        String productName,
        
        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        Integer quantity,
        
        @NotNull(message = "Unit price is required")
        @Positive(message = "Unit price must be positive")
        BigDecimal unitPrice
    ) implements SaleDTO {}

    record Create(
        @NotNull(message = "Items are required")
        List<ItemData> items,
        
        BigDecimal discountAmount,
        
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,
        
        BigDecimal amountPaid,
        
        Long cashierId,
        
        String cashierName
    ) implements SaleDTO {}

    record Response(
        Long id,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        PaymentMethod paymentMethod,
        BigDecimal amountPaid,
        BigDecimal changeGiven,
        Long cashierId,
        String cashierName,
        LocalDateTime saleDate,
        List<SaleItemResponse> items
    ) implements SaleDTO {}

    record SaleItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
    ) implements SaleDTO {}

    record SalesSummary(
        Long totalSales,
        BigDecimal totalRevenue,
        BigDecimal cashTotal,
        BigDecimal cardTotal,
        BigDecimal creditTotal,
        Integer todaySales,
        BigDecimal todayRevenue
    ) implements SaleDTO {}
}
