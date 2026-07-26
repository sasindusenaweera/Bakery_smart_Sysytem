package com.bakery.controller;

import com.bakery.dto.CreditDTO;
import com.bakery.entity.CreditEntry;
import com.bakery.entity.User;
import com.bakery.repository.UserRepository;
import com.bakery.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor

public class CreditController {

    private final CreditService creditService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CreditDTO.CreditCustomerResponse>> getAllCreditCustomers(
            @RequestParam(required = false) String search) {
        
        List<CreditDTO.CreditCustomerResponse> customers;
        
        if (search != null && !search.isEmpty()) {
            customers = creditService.searchCustomers(search);
        } else {
            customers = creditService.getAllCreditCustomers();
        }
        
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/active")
    public ResponseEntity<List<CreditDTO.CreditCustomerResponse>> getActiveCreditCustomers() {
        return ResponseEntity.ok(creditService.getActiveCustomers());
    }

    @GetMapping("/summary")
    public ResponseEntity<CreditDTO.CreditSummary> getCreditSummary() {
        return ResponseEntity.ok(creditService.getCreditSummary());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CreditDTO.CreditCustomerResponse>> getCustomerSummaries() {
        return ResponseEntity.ok(creditService.getActiveCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditDTO.CreditCustomerResponse> getCreditCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.getCreditCustomerById(id));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<CreditDTO.CreditTransactionResponse>> getTransactionHistory(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.getTransactionHistory(id));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<CreditDTO.CreditPaymentResponse>> getPaymentHistory(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.getPaymentHistory(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'CASHIER')")
    public ResponseEntity<CreditDTO.CreditCustomerResponse> addCredit(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreditDTO.CreditCustomerCreate createDTO) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CreditDTO.CreditCustomerResponse created = creditService.addCredit(createDTO, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('OWNER', 'CASHIER')")
    public ResponseEntity<CreditDTO.CreditPaymentResponse> recordPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreditDTO.CreditPaymentCreate paymentDTO) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CreditDTO.CreditPaymentResponse payment = creditService.recordPayment(id, paymentDTO, user);
        return new ResponseEntity<>(payment, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteCreditCustomer(@PathVariable Long id) {
        creditService.deleteCreditCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/update-overdue")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> updateOverdueStatus() {
        creditService.updateOverdueStatus();
        return ResponseEntity.ok().build();
    }
}
