package com.bakery.repository;

import com.bakery.entity.Product;
import com.bakery.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(ProductCategory category);

    List<Product> findByIsAvailable(Boolean isAvailable);

    List<Product> findByCategoryAndIsAvailable(ProductCategory category, Boolean isAvailable);

    Optional<Product> findByName(String name);

    boolean existsByName(String name);

    List<Product> findByStockQuantityLessThan(Integer threshold);

    List<Product> findByNameContainingIgnoreCase(String name);
}
