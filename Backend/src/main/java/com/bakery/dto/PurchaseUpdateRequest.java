package com.bakery.dto;

import com.bakery.entity.PurchaseStatus;
import java.util.List;

public class PurchaseUpdateRequest {
    private PurchaseStatus status;
    private String notes;
    private List<PurchaseItemCreateRequest> items;

    public PurchaseUpdateRequest() {}

    public PurchaseStatus getStatus() { return status; }
    public void setStatus(PurchaseStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<PurchaseItemCreateRequest> getItems() { return items; }
    public void setItems(List<PurchaseItemCreateRequest> items) { this.items = items; }
}
