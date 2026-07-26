package com.bakery.dto;

import java.math.BigDecimal;

public class PurchaseStatsResponse {
    private Long totalPurchases;
    private Long pendingPurchases;
    private Long paidPurchases;
    private BigDecimal totalValue;
    private BigDecimal pendingValue;
    private BigDecimal paidValue;

    public PurchaseStatsResponse() {}

    public Long getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(Long totalPurchases) { this.totalPurchases = totalPurchases; }
    public Long getPendingPurchases() { return pendingPurchases; }
    public void setPendingPurchases(Long pendingPurchases) { this.pendingPurchases = pendingPurchases; }
    public Long getPaidPurchases() { return paidPurchases; }
    public void setPaidPurchases(Long paidPurchases) { this.paidPurchases = paidPurchases; }
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    public BigDecimal getPendingValue() { return pendingValue; }
    public void setPendingValue(BigDecimal pendingValue) { this.pendingValue = pendingValue; }
    public BigDecimal getPaidValue() { return paidValue; }
    public void setPaidValue(BigDecimal paidValue) { this.paidValue = paidValue; }
}
