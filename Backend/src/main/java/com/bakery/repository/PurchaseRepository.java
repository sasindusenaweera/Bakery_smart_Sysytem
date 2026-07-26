package com.bakery.repository;

import com.bakery.entity.Purchase;
import com.bakery.entity.PurchaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByPurchaseDateBetweenOrderByPurchaseDateDesc(LocalDateTime start, LocalDateTime end);

    List<Purchase> findTop10ByOrderByPurchaseDateDesc();

    List<Purchase> findBySupplierIdOrderByPurchaseDateDesc(Long supplierId);

    List<Purchase> findByStatusOrderByPurchaseDateDesc(PurchaseStatus status);

    List<Purchase> findBySupplierIdAndStatusOrderByPurchaseDateDesc(Long supplierId, PurchaseStatus status);

    @Query("SELECT p FROM Purchase p WHERE " +
           "(:supplierId IS NULL OR p.supplier.id = :supplierId) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:startDate IS NULL OR p.purchaseDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.purchaseDate <= :endDate) " +
           "ORDER BY p.purchaseDate DESC")
    List<Purchase> findByFilters(
            @Param("supplierId") Long supplierId,
            @Param("status") PurchaseStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT SUM(p.totalAmount) FROM Purchase p WHERE p.purchaseDate >= :startDate")
    BigDecimal sumPurchasesSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(p.pendingAmount) FROM Purchase p WHERE p.pendingAmount > 0")
    BigDecimal sumTotalPendingAmount();

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.status = :status")
    Long countByStatus(@Param("status") PurchaseStatus status);

    @Query("SELECT SUM(p.totalAmount) FROM Purchase p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PurchaseStatus status);

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.purchaseDate >= :startDate AND p.purchaseDate <= :endDate")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
