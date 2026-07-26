package com.bakery.entity;

public enum ProductCategory {
    BREAD("Bread"),
    BUN("Bun"),
    CAKES("Cakes"),
    PASTRIES("Pastries"),
    BEVERAGES("Beverages"),
    COOKIES("Cookies"),
    OTHER("Other");

    private final String displayName;

    ProductCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
