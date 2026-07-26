package com.bakery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreditDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditCustomerCreate {
        private String customerName;
        private String phoneNumber;
        private String address;
        private BigDecimal creditAmount;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime dueDate;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditCustomerResponse {
        private Long id;
        private String customerName;
        private String phoneNumber;
        private String address;
        private BigDecimal totalCredit;
        private BigDecimal totalPaid;
        private BigDecimal remainingBalance;
        private LocalDateTime dueDate;
        private String status;
        private String notes;
        private String referenceNumber;
        private LocalDateTime lastTransactionDate;
        private LocalDateTime createdAt;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditItemCreate {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditEntryCreate {
        private String customerName;
        private String phoneNumber;
        private String address;
        private BigDecimal creditAmount;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime dueDate;
        private String notes;
        private Long linkedOrderId;
        private List<CreditItemCreate> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditEntryResponse {
        private Long id;
        private String customerName;
        private String phoneNumber;
        private String address;
        private BigDecimal creditAmount;
        private BigDecimal paidAmount;
        private BigDecimal remainingBalance;
        private LocalDateTime dueDate;
        private String status;
        private String notes;
        private Long linkedOrderId;
        private String referenceNumber;
        private List<CreditItemResponse> items;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditPaymentCreate {
        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be positive")
        private BigDecimal amount;
        private String paymentMethod;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditPaymentResponse {
        private Long id;
        private Long creditEntryId;
        private Long customerId;
        private BigDecimal amount;
        private String paymentMethod;
        private String notes;
        private String referenceNumber;
        private LocalDateTime paymentDate;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditSummary {
        private BigDecimal totalCreditIssued;
        private BigDecimal totalCollected;
        private BigDecimal pendingBalance;
        private BigDecimal overdueAmount;
        private Long totalCustomers;
        private Long overdueCustomers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreditTransactionResponse {
        private Long id;
        private Long customerId;
        private String customerName;
        private BigDecimal amount;
        private String transactionType;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime transactionDate;
        private String notes;
        private String referenceNumber;
        private LocalDateTime createdAt;
    }
}
