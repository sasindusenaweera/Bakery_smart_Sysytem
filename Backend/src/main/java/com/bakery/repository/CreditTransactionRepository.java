package com.bakery.repository;

import com.bakery.entity.CreditTransaction;
import com.bakery.entity.CreditCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    List<CreditTransaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId);

    List<CreditTransaction> findByCustomerOrderByTransactionDateDesc(CreditCustomer customer);

    List<CreditTransaction> findByTransactionDateBetweenOrderByTransactionDateDesc(LocalDateTime start, LocalDateTime end);

    List<CreditTransaction> findTop20ByOrderByTransactionDateDesc();

    @Query("SELECT SUM(c.amount) FROM CreditTransaction c WHERE c.transactionType = 'CREDIT_ISSUED' AND c.transactionDate >= :startDate")
    BigDecimal sumCreditIssuedSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(c.amount) FROM CreditTransaction c WHERE c.transactionType = 'PAYMENT_RECEIVED' AND c.transactionDate >= :startDate")
    BigDecimal sumPaymentsReceivedSince(@Param("startDate") LocalDateTime startDate);
}
