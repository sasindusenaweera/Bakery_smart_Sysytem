package com.bakery.repository;

import com.bakery.entity.PaymentMethod;
import com.bakery.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findBySaleDateBetween(LocalDateTime start, LocalDateTime end);

    List<Sale> findBySaleDateAfter(LocalDateTime date);

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.saleDate >= :startDate")
    BigDecimal sumTotalSalesSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate >= :startDate")
    Long countSalesSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.saleDate >= :startDate AND s.paymentMethod = :paymentMethod")
    BigDecimal sumSalesByPaymentMethodSince(@Param("startDate") LocalDateTime startDate, @Param("paymentMethod") PaymentMethod paymentMethod);

    @Query("SELECT s.paymentMethod, SUM(s.totalAmount) FROM Sale s WHERE s.saleDate >= :startDate GROUP BY s.paymentMethod")
    List<Object[]> sumSalesGroupByPaymentMethodSince(@Param("startDate") LocalDateTime startDate);
}
