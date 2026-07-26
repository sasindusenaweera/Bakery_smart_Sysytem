package com.bakery.repository;

import com.bakery.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByStatusOrderByOrderDateDesc(CustomerOrder.OrderStatus status);

    List<CustomerOrder> findByOrderDateBetweenOrderByOrderDateDesc(LocalDateTime start, LocalDateTime end);

    List<CustomerOrder> findTop10ByOrderByOrderDateDesc();

    List<CustomerOrder> findByCustomerNameContainingIgnoreCase(String customerName);

    long countByStatus(CustomerOrder.OrderStatus status);

    long countByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT o FROM CustomerOrder o WHERE o.orderDate >= :startDate ORDER BY o.orderDate DESC")
    List<CustomerOrder> findRecentOrders(@Param("startDate") LocalDateTime startDate);
}
