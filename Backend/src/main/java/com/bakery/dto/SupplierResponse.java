package com.bakery.dto;

import java.math.BigDecimal;

public class SupplierResponse {
    private Long id;
    private String name;
    private String contactPerson;
    private String phoneNumber;
    private String email;
    private String address;
    private String itemsSupplied;
    private Integer leadTimeDays;
    private String paymentTerms;
    private BigDecimal totalPurchases;
    private BigDecimal pendingAmount;
    private boolean active;

    public SupplierResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getItemsSupplied() { return itemsSupplied; }
    public void setItemsSupplied(String itemsSupplied) { this.itemsSupplied = itemsSupplied; }
    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public BigDecimal getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(BigDecimal totalPurchases) { this.totalPurchases = totalPurchases; }
    public BigDecimal getPendingAmount() { return pendingAmount; }
    public void setPendingAmount(BigDecimal pendingAmount) { this.pendingAmount = pendingAmount; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
