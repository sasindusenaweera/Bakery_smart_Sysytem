package com.bakery.service;

import com.bakery.dto.CreditDTO;
import com.bakery.entity.CreditCustomer;
import com.bakery.entity.CreditTransaction;
import com.bakery.entity.CreditPayment;
import com.bakery.entity.User;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.repository.CreditCustomerRepository;
import com.bakery.repository.CreditTransactionRepository;
import com.bakery.repository.CreditPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreditService {

    private static final Logger logger = LoggerFactory.getLogger(CreditService.class);

    private final CreditCustomerRepository creditCustomerRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final CreditPaymentRepository creditPaymentRepository;

    public List<CreditDTO.CreditCustomerResponse> getAllCreditCustomers() {
        return creditCustomerRepository.findAll().stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
    }

    public List<CreditDTO.CreditCustomerResponse> getActiveCustomers() {
        return creditCustomerRepository.findActiveCustomers().stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
    }

    public CreditDTO.CreditCustomerResponse getCreditCustomerById(Long id) {
        CreditCustomer customer = creditCustomerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Credit customer not found"));
        return mapToCustomerResponse(customer);
    }

    public CreditDTO.CreditCustomerResponse getCreditCustomerByPhone(String phoneNumber) {
        return creditCustomerRepository.findByPhoneNumber(phoneNumber)
                .map(this::mapToCustomerResponse)
                .orElse(null);
    }

    @Transactional
    public CreditDTO.CreditCustomerResponse addCredit(CreditDTO.CreditCustomerCreate createDTO, User createdBy) {
        logger.info("Adding credit: customerName={}, phoneNumber={}, amount={}", 
            createDTO.getCustomerName(), createDTO.getPhoneNumber(), createDTO.getCreditAmount());

        String phoneNumber = createDTO.getPhoneNumber();
        String customerName = createDTO.getCustomerName();

        CreditCustomer customer = null;
        String message = null;

        if (phoneNumber != null && !phoneNumber.isEmpty()) {
            customer = creditCustomerRepository.findByPhoneNumber(phoneNumber).orElse(null);
        }

        if (customer == null && customerName != null && !customerName.isEmpty()) {
            customer = creditCustomerRepository.findByCustomerNameIgnoreCase(customerName).orElse(null);
        }

        if (customer != null) {
            logger.info("Customer found, updating existing credit: {}", customer.getCustomerName());
            message = "Customer already exists. Credit amount added to existing balance.";

            BigDecimal oldBalance = customer.getRemainingBalance();
            BigDecimal newCredit = createDTO.getCreditAmount();
            BigDecimal newTotalCredit = customer.getTotalCredit().add(newCredit);

            customer.setTotalCredit(newTotalCredit);
            customer.setRemainingBalance(oldBalance.add(newCredit));

            if (createDTO.getDueDate() != null) {
                customer.setDueDate(createDTO.getDueDate());
            }

            if (createDTO.getAddress() != null && !createDTO.getAddress().isEmpty()) {
                customer.setAddress(createDTO.getAddress());
            }

            if (customer.getNotes() != null && !customer.getNotes().isEmpty()) {
                customer.setNotes(customer.getNotes() + "\n" + createDTO.getNotes());
            } else {
                customer.setNotes(createDTO.getNotes());
            }

            customer.setStatus(CreditCustomer.CreditCustomerStatus.ACTIVE);
            creditCustomerRepository.save(customer);

            CreditTransaction transaction = CreditTransaction.builder()
                    .customer(customer)
                    .amount(newCredit)
                    .transactionType(CreditTransaction.TransactionType.CREDIT_ISSUED)
                    .transactionDate(LocalDateTime.now())
                    .notes(createDTO.getNotes())
                    .referenceNumber(generateTransactionReference())
                    .createdBy(createdBy)
                    .build();
            creditTransactionRepository.save(transaction);

            customer.setLastTransactionDate(LocalDateTime.now());
            creditCustomerRepository.save(customer);

        } else {
            logger.info("Creating new customer: {}", customerName);

            customer = CreditCustomer.builder()
                    .customerName(customerName)
                    .phoneNumber(phoneNumber)
                    .address(createDTO.getAddress())
                    .totalCredit(createDTO.getCreditAmount())
                    .totalPaid(BigDecimal.ZERO)
                    .remainingBalance(createDTO.getCreditAmount())
                    .dueDate(createDTO.getDueDate())
                    .status(CreditCustomer.CreditCustomerStatus.ACTIVE)
                    .notes(createDTO.getNotes())
                    .referenceNumber(generateCustomerReference())
                    .createdBy(createdBy)
                    .lastTransactionDate(LocalDateTime.now())
                    .build();

            customer = creditCustomerRepository.save(customer);

            CreditTransaction transaction = CreditTransaction.builder()
                    .customer(customer)
                    .amount(createDTO.getCreditAmount())
                    .transactionType(CreditTransaction.TransactionType.CREDIT_ISSUED)
                    .transactionDate(LocalDateTime.now())
                    .notes(createDTO.getNotes())
                    .referenceNumber(generateTransactionReference())
                    .createdBy(createdBy)
                    .build();
            creditTransactionRepository.save(transaction);
        }

        CreditDTO.CreditCustomerResponse response = mapToCustomerResponse(customer);
        response.setMessage(message);
        return response;
    }

    @Transactional
    public CreditDTO.CreditPaymentResponse recordPayment(Long customerId, CreditDTO.CreditPaymentCreate paymentDTO, User createdBy) {
        CreditCustomer customer = creditCustomerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit customer not found"));

        if (customer.getStatus() == CreditCustomer.CreditCustomerStatus.PAID) {
            throw new IllegalArgumentException("This credit is already fully paid");
        }

        if (customer.getRemainingBalance().compareTo(paymentDTO.getAmount()) < 0) {
            throw new IllegalArgumentException("Payment amount exceeds remaining balance");
        }

        CreditPayment payment = CreditPayment.builder()
                .customer(customer)
                .amount(paymentDTO.getAmount())
                .paymentMethod(paymentDTO.getPaymentMethod())
                .notes(paymentDTO.getNotes())
                .referenceNumber(generatePaymentReferenceNumber())
                .paymentDate(LocalDateTime.now())
                .createdBy(createdBy)
                .build();

        creditPaymentRepository.save(payment);

        BigDecimal newPaidAmount = customer.getTotalPaid().add(paymentDTO.getAmount());
        BigDecimal newRemaining = customer.getRemainingBalance().subtract(paymentDTO.getAmount());

        customer.setTotalPaid(newPaidAmount);
        customer.setRemainingBalance(newRemaining);

        if (newRemaining.compareTo(BigDecimal.ZERO) <= 0) {
            customer.setStatus(CreditCustomer.CreditCustomerStatus.PAID);
            customer.setRemainingBalance(BigDecimal.ZERO);
        } else if (newPaidAmount.compareTo(BigDecimal.ZERO) > 0) {
            customer.setStatus(CreditCustomer.CreditCustomerStatus.PARTIAL);
        }

        creditCustomerRepository.save(customer);

        CreditTransaction transaction = CreditTransaction.builder()
                .customer(customer)
                .amount(paymentDTO.getAmount())
                .transactionType(CreditTransaction.TransactionType.PAYMENT_RECEIVED)
                .transactionDate(LocalDateTime.now())
                .notes(paymentDTO.getNotes())
                .referenceNumber(generateTransactionReference())
                .createdBy(createdBy)
                .build();
        creditTransactionRepository.save(transaction);

        customer.setLastTransactionDate(LocalDateTime.now());
        creditCustomerRepository.save(customer);

        return mapToPaymentResponse(payment);
    }

    @Transactional
    public void deleteCreditCustomer(Long id) {
        CreditCustomer customer = creditCustomerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Credit customer not found"));

        if (customer.getStatus() == CreditCustomer.CreditCustomerStatus.PAID) {
            throw new IllegalArgumentException("Cannot delete fully paid credit customers");
        }

        creditCustomerRepository.delete(customer);
    }

    public CreditDTO.CreditSummary getCreditSummary() {
        BigDecimal totalIssued = creditCustomerRepository.getTotalCreditIssued();
        BigDecimal totalCollected = creditCustomerRepository.getTotalCollected();
        BigDecimal pending = creditCustomerRepository.getTotalPendingBalance();
        BigDecimal overdue = creditCustomerRepository.getTotalOverdueAmount();
        Long totalCustomers = creditCustomerRepository.count();
        Long overdueCustomers = creditCustomerRepository.findOverdueCustomers().stream().count();

        return CreditDTO.CreditSummary.builder()
                .totalCreditIssued(totalIssued != null ? totalIssued : BigDecimal.ZERO)
                .totalCollected(totalCollected != null ? totalCollected : BigDecimal.ZERO)
                .pendingBalance(pending != null ? pending : BigDecimal.ZERO)
                .overdueAmount(overdue != null ? overdue : BigDecimal.ZERO)
                .totalCustomers(totalCustomers)
                .overdueCustomers(overdueCustomers)
                .build();
    }

    public List<CreditDTO.CreditTransactionResponse> getTransactionHistory(Long customerId) {
        CreditCustomer customer = creditCustomerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit customer not found"));

        return creditTransactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId).stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    public List<CreditDTO.CreditPaymentResponse> getPaymentHistory(Long customerId) {
        CreditCustomer customer = creditCustomerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit customer not found"));

        return creditPaymentRepository.findByCreditEntryIdOrderByPaymentDateDesc(customerId).stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    public List<CreditDTO.CreditCustomerResponse> searchCustomers(String search) {
        return creditCustomerRepository.searchCustomers(search).stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateOverdueStatus() {
        LocalDateTime now = LocalDateTime.now();
        List<CreditCustomer> activeCustomers = creditCustomerRepository.findActiveCustomers();

        for (CreditCustomer customer : activeCustomers) {
            if (customer.getDueDate() != null && customer.getDueDate().isBefore(now)) {
                customer.setStatus(CreditCustomer.CreditCustomerStatus.OVERDUE);
                creditCustomerRepository.save(customer);
            }
        }
    }

    private CreditDTO.CreditCustomerResponse mapToCustomerResponse(CreditCustomer customer) {
        return CreditDTO.CreditCustomerResponse.builder()
                .id(customer.getId())
                .customerName(customer.getCustomerName())
                .phoneNumber(customer.getPhoneNumber())
                .address(customer.getAddress())
                .totalCredit(customer.getTotalCredit())
                .totalPaid(customer.getTotalPaid())
                .remainingBalance(customer.getRemainingBalance())
                .dueDate(customer.getDueDate())
                .status(customer.getStatus().name())
                .notes(customer.getNotes())
                .referenceNumber(customer.getReferenceNumber())
                .lastTransactionDate(customer.getLastTransactionDate())
                .createdAt(customer.getCreatedAt())
                .build();
    }

    private CreditDTO.CreditTransactionResponse mapToTransactionResponse(CreditTransaction transaction) {
        return CreditDTO.CreditTransactionResponse.builder()
                .id(transaction.getId())
                .customerId(transaction.getCustomer().getId())
                .customerName(transaction.getCustomer().getCustomerName())
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType().name())
                .transactionDate(transaction.getTransactionDate())
                .notes(transaction.getNotes())
                .referenceNumber(transaction.getReferenceNumber())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private CreditDTO.CreditPaymentResponse mapToPaymentResponse(CreditPayment payment) {
        return CreditDTO.CreditPaymentResponse.builder()
                .id(payment.getId())
                .creditEntryId(payment.getCreditEntry() != null ? payment.getCreditEntry().getId() : null)
                .customerId(payment.getCustomer() != null ? payment.getCustomer().getId() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .notes(payment.getNotes())
                .referenceNumber(payment.getReferenceNumber())
                .paymentDate(payment.getPaymentDate())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private String generateCustomerReference() {
        return "CUS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateTransactionReference() {
        return "CTX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generatePaymentReferenceNumber() {
        return "CPY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}