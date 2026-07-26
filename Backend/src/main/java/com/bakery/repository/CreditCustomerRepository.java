package com.bakery.repository;

import com.bakery.entity.CreditCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditCustomerRepository extends JpaRepository<CreditCustomer, Long> {

    Optional<CreditCustomer> findByPhoneNumber(String phoneNumber);

    Optional<CreditCustomer> findByCustomerNameIgnoreCase(String customerName);

    @Query("SELECT c FROM CreditCustomer c WHERE LOWER(c.phoneNumber) = LOWER(:phone) OR LOWER(c.customerName) = LOWER(:name)")
    Optional<CreditCustomer> findByPhoneOrName(@Param("phone") String phoneNumber, @Param("name") String customerName);

    @Query("SELECT c FROM CreditCustomer c WHERE c.remainingBalance > 0")
    List<CreditCustomer> findActiveCustomers();

    @Query("SELECT c FROM CreditCustomer c WHERE c.remainingBalance > 0 AND c.status = 'OVERDUE'")
    List<CreditCustomer> findOverdueCustomers();

    @Query("SELECT c FROM CreditCustomer c WHERE " +
           "LOWER(c.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<CreditCustomer> searchCustomers(@Param("search") String search);

    @Query("SELECT SUM(c.totalCredit) FROM CreditCustomer c")
    java.math.BigDecimal getTotalCreditIssued();

    @Query("SELECT SUM(c.totalPaid) FROM CreditCustomer c")
    java.math.BigDecimal getTotalCollected();

    @Query("SELECT SUM(c.remainingBalance) FROM CreditCustomer c WHERE c.remainingBalance > 0")
    java.math.BigDecimal getTotalPendingBalance();

    @Query("SELECT SUM(c.remainingBalance) FROM CreditCustomer c WHERE c.status = 'OVERDUE'")
    java.math.BigDecimal getTotalOverdueAmount();
}