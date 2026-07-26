package com.bakery.repository;

import com.bakery.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByCurrentStockLessThan(BigDecimal threshold);

    List<InventoryItem> findByCurrentStockLessThanEqual(BigDecimal threshold);

    Optional<InventoryItem> findByName(String name);

    boolean existsByName(String name);

    List<InventoryItem> findBySupplier(String supplier);

    List<InventoryItem> findByNameContainingIgnoreCase(String name);
}
