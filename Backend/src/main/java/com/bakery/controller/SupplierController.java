package com.bakery.controller;

import com.bakery.dto.PurchaseResponse;
import com.bakery.dto.SupplierCreateRequest;
import com.bakery.dto.SupplierResponse;
import com.bakery.dto.SupplierUpdateRequest;
import com.bakery.entity.Supplier;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.repository.SupplierRepository;
import com.bakery.service.PurchaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/suppliers")

public class SupplierController {

    private final SupplierRepository supplierRepository;
    private final PurchaseService purchaseService;

    public SupplierController(SupplierRepository supplierRepository, PurchaseService purchaseService) {
        this.supplierRepository = supplierRepository;
        this.purchaseService = purchaseService;
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplierResponse> response = suppliers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<SupplierResponse>> getActiveSuppliers() {
        List<Supplier> suppliers = supplierRepository.findByActiveTrue();
        List<SupplierResponse> response = suppliers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SupplierResponse>> searchSuppliers(@RequestParam String q) {
        List<Supplier> suppliers = supplierRepository.findByNameContainingIgnoreCaseOrContactPersonContainingIgnoreCase(q, q);
        List<SupplierResponse> response = suppliers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        return ResponseEntity.ok(mapToResponse(supplier));
    }

    @GetMapping("/{id}/purchases")
    public ResponseEntity<List<PurchaseResponse>> getSupplierPurchases(@PathVariable Long id) {
        supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        List<PurchaseResponse> purchases = purchaseService.getPurchasesBySupplier(id);
        return ResponseEntity.ok(purchases);
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@RequestBody SupplierCreateRequest dto) {
        Supplier supplier = new Supplier();
        supplier.setName(dto.getName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setPhoneNumber(dto.getPhoneNumber());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
        supplier.setItemsSupplied(dto.getItemsSupplied());
        supplier.setLeadTimeDays(dto.getLeadTimeDays());
        supplier.setPaymentTerms(dto.getPaymentTerms());
        supplier.setActive(true);

        Supplier saved = supplierRepository.save(supplier);
        return new ResponseEntity<>(mapToResponse(saved), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable Long id,
            @RequestBody SupplierUpdateRequest dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        if (dto.getName() != null) supplier.setName(dto.getName());
        if (dto.getContactPerson() != null) supplier.setContactPerson(dto.getContactPerson());
        if (dto.getPhoneNumber() != null) supplier.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getEmail() != null) supplier.setEmail(dto.getEmail());
        if (dto.getAddress() != null) supplier.setAddress(dto.getAddress());
        if (dto.getItemsSupplied() != null) supplier.setItemsSupplied(dto.getItemsSupplied());
        if (dto.getLeadTimeDays() != null) supplier.setLeadTimeDays(dto.getLeadTimeDays());
        if (dto.getPaymentTerms() != null) supplier.setPaymentTerms(dto.getPaymentTerms());
        if (dto.getActive() != null) supplier.setActive(dto.getActive());

        Supplier saved = supplierRepository.save(supplier);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found");
        }
        supplierRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Void> setSupplierActive(@PathVariable Long id, @RequestParam boolean active) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        supplier.setActive(active);
        supplierRepository.save(supplier);
        return ResponseEntity.ok().build();
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        SupplierResponse response = new SupplierResponse();
        response.setId(supplier.getId());
        response.setName(supplier.getName());
        response.setContactPerson(supplier.getContactPerson());
        response.setPhoneNumber(supplier.getPhoneNumber());
        response.setEmail(supplier.getEmail());
        response.setAddress(supplier.getAddress());
        response.setItemsSupplied(supplier.getItemsSupplied());
        response.setLeadTimeDays(supplier.getLeadTimeDays());
        response.setPaymentTerms(supplier.getPaymentTerms());
        response.setTotalPurchases(supplier.getTotalPurchases());
        response.setPendingAmount(supplier.getPendingAmount());
        response.setActive(supplier.isActive());
        return response;
    }
}
