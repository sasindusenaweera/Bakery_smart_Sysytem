package com.bakery.dto;

import com.bakery.entity.PurchaseStatus;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseCreateRequest {
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;
    @NotNull(message = "Purchase date is required")
    private LocalDateTime purchaseDate;
    private String invoiceNumber;
    private String notes;
    private List<PurchaseItemCreateRequest> items;

    public PurchaseCreateRequest() {}

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public LocalDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDateTime purchaseDate) { this.purchaseDate = purchaseDate; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<PurchaseItemCreateRequest> getItems() { return items; }
    public void setItems(List<PurchaseItemCreateRequest> items) { this.items = items; }
}
