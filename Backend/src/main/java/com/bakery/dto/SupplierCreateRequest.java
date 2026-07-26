package com.bakery.dto;

import jakarta.validation.constraints.NotNull;

public class SupplierCreateRequest {
    @NotNull(message = "Supplier name is required")
    private String name;
    private String contactPerson;
    private String phoneNumber;
    private String email;
    private String address;
    private String itemsSupplied;
    private Integer leadTimeDays;
    private String paymentTerms;

    public SupplierCreateRequest() {}

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
}
