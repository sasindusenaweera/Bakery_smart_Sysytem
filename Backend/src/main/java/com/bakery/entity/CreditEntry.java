package com.bakery.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "credit_entry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Customer name is required")
    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "address")
    private String address;

    @NotNull(message = "Credit amount is required")
    @Positive(message = "Credit amount must be positive")
    @Column(name = "credit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal creditAmount;

    @Column(name = "paid_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "remaining_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal remainingBalance;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private CreditStatus status = CreditStatus.UNPAID;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "linked_order_id")
    private Long linkedOrderId;

    @Column(name = "reference_number", unique = true)
    private String referenceNumber;

    @OneToMany(mappedBy = "creditEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CreditEntryItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "creditEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CreditPayment> payments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (remainingBalance == null) {
            remainingBalance = creditAmount;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CreditStatus {
        UNPAID,
        PARTIAL,
        PAID,
        OVERDUE
    }
}
