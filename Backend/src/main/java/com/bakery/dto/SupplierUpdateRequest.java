package com.bakery.dto;

public class SupplierUpdateRequest {
    private String name;
    private String contactPerson;
    private String phoneNumber;
    private String email;
    private String address;
    private String itemsSupplied;
    private Integer leadTimeDays;
    private String paymentTerms;
    private Boolean active;

    public SupplierUpdateRequest() {}

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
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
