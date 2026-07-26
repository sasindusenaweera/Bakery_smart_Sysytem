package com.bakery.entity;

public enum PaymentMethod {
    CASH("Cash"),
    CARD("Card"),
    CREDIT("Credit");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
