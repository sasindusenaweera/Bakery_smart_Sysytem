package com.bakery.repository;

import com.bakery.entity.ExpenseFund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseFundRepository extends JpaRepository<ExpenseFund, Long> {

    List<ExpenseFund> findAllByOrderByAllocationDateDesc();

    @Query("SELECT COALESCE(SUM(e.allocatedAmount), 0) FROM ExpenseFund e")
    BigDecimal sumTotalAllocated();

    @Query("SELECT COALESCE(SUM(e.usedAmount), 0) FROM ExpenseFund e")
    BigDecimal sumTotalUsed();

    @Query("SELECT COALESCE(SUM(e.remainingBalance), 0) FROM ExpenseFund e")
    BigDecimal sumTotalRemaining();

    @Query("SELECT e FROM ExpenseFund e WHERE e.allocationDate >= :start AND e.allocationDate <= :end ORDER BY e.allocationDate DESC")
    List<ExpenseFund> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}