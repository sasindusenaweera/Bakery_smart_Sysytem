package com.bakery.service;

import com.bakery.dto.PaymentRecordRequest;
import com.bakery.dto.PurchaseCreateRequest;
import com.bakery.dto.PurchaseItemCreateRequest;
import com.bakery.dto.PurchaseItemResponse;
import com.bakery.dto.PurchaseResponse;
import com.bakery.dto.PurchaseStatsResponse;
import com.bakery.dto.PurchaseUpdateRequest;
import com.bakery.dto.SupplierResponse;
import com.bakery.entity.InventoryItem;
import com.bakery.entity.Purchase;
import com.bakery.entity.PurchaseItem;
import com.bakery.entity.PurchaseStatus;
import com.bakery.entity.Supplier;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.exception.ValidationException;
import com.bakery.repository.InventoryRepository;
import com.bakery.repository.PurchaseRepository;
import com.bakery.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;

    public PurchaseService(PurchaseRepository purchaseRepository, SupplierRepository supplierRepository, InventoryRepository inventoryRepository) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public PurchaseResponse createPurchase(PurchaseCreateRequest createDTO) {
        Supplier supplier = supplierRepository.findById(createDTO.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + createDTO.getSupplierId()));

        Purchase purchase = new Purchase();
        purchase.setSupplier(supplier);
        purchase.setPurchaseDate(createDTO.getPurchaseDate() != null ? createDTO.getPurchaseDate() : LocalDateTime.now());
        purchase.setInvoiceNumber(createDTO.getInvoiceNumber());
        purchase.setStatus(PurchaseStatus.PENDING);
        purchase.setNotes(createDTO.getNotes());

        if (createDTO.getItems() != null) {
            for (PurchaseItemCreateRequest itemCreate : createDTO.getItems()) {
                InventoryItem inventoryItem = inventoryRepository.findById(itemCreate.getInventoryItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + itemCreate.getInventoryItemId()));

                PurchaseItem item = new PurchaseItem();
                item.setInventoryItem(inventoryItem);
                item.setQuantity(itemCreate.getQuantity());
                item.setUnitCost(itemCreate.getUnitCost());

                purchase.addItem(item);
            }
        }

        purchase.calculateTotals();
        Purchase saved = purchaseRepository.save(purchase);

        updateSupplierTotals(supplier, saved.getTotalAmount(), saved.getPendingAmount());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getAllPurchases() {
        return purchaseRepository.findTop10ByOrderByPurchaseDateDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return mapToResponse(purchase);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getPurchasesByFilters(Long supplierId, PurchaseStatus status, LocalDateTime startDate, LocalDateTime endDate) {
        return purchaseRepository.findByFilters(supplierId, status, startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getPurchasesBySupplier(Long supplierId) {
        return purchaseRepository.findBySupplierIdOrderByPurchaseDateDesc(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseStatsResponse getPurchaseStats() {
        Long totalPurchases = purchaseRepository.count();
        Long pendingPurchases = purchaseRepository.countByStatus(PurchaseStatus.PENDING);
        Long paidPurchases = purchaseRepository.countByStatus(PurchaseStatus.PAID);
        
        BigDecimal totalValue = purchaseRepository.sumPurchasesSince(LocalDateTime.of(2000, 1, 1, 0, 0));
        BigDecimal pendingValue = purchaseRepository.sumTotalPendingAmount();
        BigDecimal paidValue = purchaseRepository.sumAmountByStatus(PurchaseStatus.PAID);

        PurchaseStatsResponse stats = new PurchaseStatsResponse();
        stats.setTotalPurchases(totalPurchases != null ? totalPurchases : 0L);
        stats.setPendingPurchases(pendingPurchases != null ? pendingPurchases : 0L);
        stats.setPaidPurchases(paidPurchases != null ? paidPurchases : 0L);
        stats.setTotalValue(totalValue != null ? totalValue : BigDecimal.ZERO);
        stats.setPendingValue(pendingValue != null ? pendingValue : BigDecimal.ZERO);
        stats.setPaidValue(paidValue != null ? paidValue : BigDecimal.ZERO);
        return stats;
    }

    @Transactional
    public PurchaseResponse updatePurchase(Long id, PurchaseUpdateRequest updateDTO) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        PurchaseStatus oldStatus = purchase.getStatus();
        PurchaseStatus newStatus = updateDTO.getStatus();

        if (newStatus != null) {
            purchase.setStatus(newStatus);
        }

        if (updateDTO.getNotes() != null) {
            purchase.setNotes(updateDTO.getNotes());
        }

        if (updateDTO.getItems() != null) {
            for (PurchaseItem oldItem : purchase.getItems()) {
                InventoryItem inventoryItem = oldItem.getInventoryItem();
                if (inventoryItem != null && oldStatus == PurchaseStatus.RECEIVED) {
                    inventoryItem.setCurrentStock(inventoryItem.getCurrentStock().subtract(oldItem.getQuantity()));
                    inventoryRepository.save(inventoryItem);
                }
            }

            purchase.getItems().clear();

            for (PurchaseItemCreateRequest itemCreate : updateDTO.getItems()) {
                InventoryItem inventoryItem = inventoryRepository.findById(itemCreate.getInventoryItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + itemCreate.getInventoryItemId()));

                PurchaseItem item = new PurchaseItem();
                item.setInventoryItem(inventoryItem);
                item.setQuantity(itemCreate.getQuantity());
                item.setUnitCost(itemCreate.getUnitCost());

                purchase.addItem(item);

                if (purchase.getStatus() == PurchaseStatus.RECEIVED) {
                    inventoryItem.setCurrentStock(inventoryItem.getCurrentStock().add(itemCreate.getQuantity()));
                    inventoryRepository.save(inventoryItem);
                }
            }
        } else if (newStatus != null && newStatus == PurchaseStatus.RECEIVED && oldStatus != PurchaseStatus.RECEIVED) {
            for (PurchaseItem item : purchase.getItems()) {
                InventoryItem inventoryItem = item.getInventoryItem();
                if (inventoryItem != null) {
                    inventoryItem.setCurrentStock(inventoryItem.getCurrentStock().add(item.getQuantity()));
                    inventoryRepository.save(inventoryItem);
                }
            }
        }

        purchase.calculateTotals();
        Purchase saved = purchaseRepository.save(purchase);

        Supplier supplier = saved.getSupplier();
        if (supplier != null) {
            updateSupplierTotals(supplier, saved.getTotalAmount(), saved.getPendingAmount());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public PurchaseResponse recordPayment(Long id, PaymentRecordRequest paymentDTO) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        if (purchase.getStatus() == PurchaseStatus.CANCELLED) {
            throw new ValidationException("Cannot record payment for cancelled purchase");
        }

        if (purchase.getStatus() == PurchaseStatus.PAID) {
            throw new ValidationException("Purchase is already fully paid");
        }

        BigDecimal paymentAmount = paymentDTO.getAmount();
        if (paymentAmount.compareTo(purchase.getPendingAmount()) > 0) {
            paymentAmount = purchase.getPendingAmount();
        }

        purchase.recordPayment(paymentAmount);
        Purchase updated = purchaseRepository.save(purchase);

        Supplier supplier = purchase.getSupplier();
        if (supplier != null) {
            supplier.setPendingAmount(supplier.getPendingAmount().subtract(paymentAmount));
            supplierRepository.save(supplier);
        }

        return mapToResponse(updated);
    }

    @Transactional
    public PurchaseResponse updatePurchaseStatus(Long id, PurchaseStatus newStatus) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        PurchaseStatus oldStatus = purchase.getStatus();
        purchase.setStatus(newStatus);

        if (newStatus == PurchaseStatus.RECEIVED && oldStatus != PurchaseStatus.RECEIVED) {
            for (PurchaseItem item : purchase.getItems()) {
                InventoryItem inventoryItem = item.getInventoryItem();
                if (inventoryItem != null) {
                    inventoryItem.setCurrentStock(inventoryItem.getCurrentStock().add(item.getQuantity()));
                    inventoryItem.setLastRestocked(LocalDateTime.now());
                    inventoryRepository.save(inventoryItem);
                }
            }
        }

        Purchase updated = purchaseRepository.save(purchase);
        return mapToResponse(updated);
    }

    @Transactional
    public void deletePurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        Supplier supplier = purchase.getSupplier();
        if (supplier != null && purchase.getStatus() == PurchaseStatus.RECEIVED) {
            for (PurchaseItem item : purchase.getItems()) {
                InventoryItem inventoryItem = item.getInventoryItem();
                if (inventoryItem != null) {
                    inventoryItem.setCurrentStock(inventoryItem.getCurrentStock().subtract(item.getQuantity()));
                    inventoryRepository.save(inventoryItem);
                }
            }
        }

        if (supplier != null) {
            supplier.setPendingAmount(supplier.getPendingAmount().subtract(purchase.getPendingAmount()));
            supplierRepository.save(supplier);
        }

        purchaseRepository.delete(purchase);
    }

    private void updateSupplierTotals(Supplier supplier, BigDecimal totalAmount, BigDecimal pendingAmount) {
        if (supplier.getTotalPurchases() == null) {
            supplier.setTotalPurchases(BigDecimal.ZERO);
        }
        if (supplier.getPendingAmount() == null) {
            supplier.setPendingAmount(BigDecimal.ZERO);
        }
        supplier.setTotalPurchases(supplier.getTotalPurchases().add(totalAmount));
        supplier.setPendingAmount(supplier.getPendingAmount().add(pendingAmount));
        supplierRepository.save(supplier);
    }

    private PurchaseResponse mapToResponse(Purchase purchase) {
        PurchaseResponse response = new PurchaseResponse();
        response.setId(purchase.getId());
        response.setPurchaseDate(purchase.getPurchaseDate());
        response.setStatus(purchase.getStatus() != null ? purchase.getStatus().name() : null);
        response.setInvoiceNumber(purchase.getInvoiceNumber());
        response.setTotalAmount(purchase.getTotalAmount());
        response.setPaidAmount(purchase.getPaidAmount());
        response.setPendingAmount(purchase.getPendingAmount());
        response.setNotes(purchase.getNotes());
        response.setCreatedAt(purchase.getCreatedAt());
        response.setUpdatedAt(purchase.getUpdatedAt());

        if (purchase.getSupplier() != null) {
            Supplier s = purchase.getSupplier();
            SupplierResponse supplierResponse = new SupplierResponse();
            supplierResponse.setId(s.getId());
            supplierResponse.setName(s.getName());
            supplierResponse.setContactPerson(s.getContactPerson());
            supplierResponse.setPhoneNumber(s.getPhoneNumber());
            supplierResponse.setEmail(s.getEmail());
            supplierResponse.setAddress(s.getAddress());
            supplierResponse.setItemsSupplied(s.getItemsSupplied());
            supplierResponse.setLeadTimeDays(s.getLeadTimeDays());
            supplierResponse.setPaymentTerms(s.getPaymentTerms());
            supplierResponse.setTotalPurchases(s.getTotalPurchases());
            supplierResponse.setPendingAmount(s.getPendingAmount());
            supplierResponse.setActive(s.isActive());
            response.setSupplier(supplierResponse);
        }

        List<PurchaseItemResponse> items = purchase.getItems().stream().map(item -> {
            PurchaseItemResponse itemResponse = new PurchaseItemResponse();
            itemResponse.setId(item.getId());
            itemResponse.setInventoryItemId(item.getInventoryItemId());
            itemResponse.setItemName(item.getItemName());
            itemResponse.setQuantity(item.getQuantity());
            itemResponse.setUnitCost(item.getUnitCost());
            itemResponse.setSubtotal(item.getSubtotal());
            return itemResponse;
        }).collect(Collectors.toList());
        response.setItems(items);

        return response;
    }
}
