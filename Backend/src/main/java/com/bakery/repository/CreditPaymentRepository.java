package com.bakery.repository;

import com.bakery.entity.CreditPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditPaymentRepository extends JpaRepository<CreditPayment, Long> {

    List<CreditPayment> findByCreditEntryIdOrderByPaymentDateDesc(Long creditEntryId);

    List<CreditPayment> findByCustomerIdOrderByPaymentDateDesc(Long customerId);
}
