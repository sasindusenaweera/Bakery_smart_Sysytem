package com.bakery.repository;

import com.bakery.entity.CreditEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditEntryRepository extends JpaRepository<CreditEntry, Long> {

    List<CreditEntry> findByCustomerNameOrderByCreatedAtDesc(String customerName);

    List<CreditEntry> findByStatusOrderByCreatedAtDesc(CreditEntry.CreditStatus status);

    List<CreditEntry> findByDueDateBeforeAndStatusNot(LocalDateTime dueDate, CreditEntry.CreditStatus status);

    @Query("SELECT DISTINCT c.customerName FROM CreditEntry c ORDER BY c.customerName")
    List<String> findDistinctCustomerNames();

    @Query("SELECT COALESCE(SUM(c.creditAmount), 0) FROM CreditEntry c WHERE c.status != 'PAID'")
    BigDecimal getTotalCreditIssued();

    @Query("SELECT COALESCE(SUM(c.paidAmount), 0) FROM CreditEntry c WHERE c.status != 'PAID'")
    BigDecimal getTotalCollected();

    @Query("SELECT COALESCE(SUM(c.remainingBalance), 0) FROM CreditEntry c WHERE c.status != 'PAID'")
    BigDecimal getPendingBalance();

    @Query("SELECT COALESCE(SUM(c.remainingBalance), 0) FROM CreditEntry c WHERE c.dueDate < :now AND c.status != 'PAID'")
    BigDecimal getOverdueAmount(LocalDateTime now);

    @Query("SELECT COUNT(DISTINCT c.customerName) FROM CreditEntry c WHERE c.status != 'PAID'")
    Long getActiveCustomerCount();

    @Query("SELECT COUNT(DISTINCT c.customerName) FROM CreditEntry c WHERE c.dueDate < :now AND c.status != 'PAID'")
    Long getOverdueCustomerCount(LocalDateTime now);

    @Query("SELECT c FROM CreditEntry c WHERE c.status != 'PAID' ORDER BY c.dueDate ASC NULLS LAST")
    List<CreditEntry> findOverdueCredits(LocalDateTime now);

    Optional<CreditEntry> findByReferenceNumber(String referenceNumber);

    @Query("SELECT c FROM CreditEntry c WHERE c.linkedOrderId = :orderId")
    Optional<CreditEntry> findByLinkedOrderId(Long orderId);
}
