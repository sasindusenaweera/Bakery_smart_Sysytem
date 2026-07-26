package com.bakery.controller;

import com.bakery.dto.PaymentRecordRequest;
import com.bakery.dto.PurchaseCreateRequest;
import com.bakery.dto.PurchaseResponse;
import com.bakery.dto.PurchaseStatsResponse;
import com.bakery.dto.PurchaseUpdateRequest;
import com.bakery.entity.PurchaseStatus;
import com.bakery.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchases")

public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseResponse>> getAllPurchases(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) PurchaseStatus status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<PurchaseResponse> purchases;
        if (supplierId != null) {
            purchases = purchaseService.getPurchasesBySupplier(supplierId);
        } else if (status != null || startDate != null || endDate != null) {
            LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
            LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate + "T23:59:59") : null;
            purchases = purchaseService.getPurchasesByFilters(supplierId, status, start, end);
        } else {
            purchases = purchaseService.getAllPurchases();
        }
        return ResponseEntity.ok(purchases);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseResponse> getPurchaseById(@PathVariable Long id) {
        PurchaseResponse purchase = purchaseService.getPurchaseById(id);
        return ResponseEntity.ok(purchase);
    }

    @PostMapping
    public ResponseEntity<PurchaseResponse> createPurchase(
            @Valid @RequestBody PurchaseCreateRequest createDTO) {
        PurchaseResponse purchase = purchaseService.createPurchase(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(purchase);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseResponse> updatePurchase(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseUpdateRequest updateDTO) {
        PurchaseResponse purchase = purchaseService.updatePurchase(id, updateDTO);
        return ResponseEntity.ok(purchase);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<PurchaseResponse> recordPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRecordRequest paymentRequest) {
        PurchaseResponse purchase = purchaseService.recordPayment(id, paymentRequest);
        return ResponseEntity.ok(purchase);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        PurchaseStatus status = PurchaseStatus.valueOf(body.get("status"));
        PurchaseResponse purchase = purchaseService.updatePurchaseStatus(id, status);
        return ResponseEntity.ok(purchase);
    }

    @GetMapping("/stats")
    public ResponseEntity<PurchaseStatsResponse> getStats() {
        PurchaseStatsResponse stats = purchaseService.getPurchaseStats();
        return ResponseEntity.ok(stats);
    }
}
