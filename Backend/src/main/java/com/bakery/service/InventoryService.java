package com.bakery.service;

import com.bakery.dto.InventoryDTO;
import com.bakery.entity.InventoryItem;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private static final String UPLOAD_DIR = "uploads/inventory";

    public List<InventoryDTO.Response> getAllItems() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @NonNull
    public InventoryDTO.Response getItemById(@NonNull Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        return mapToResponse(item);
    }

    public List<InventoryDTO.Response> getLowStockItems() {
        return inventoryRepository.findAll().stream()
                .filter(item -> item.getCurrentStock().compareTo(item.getMinimumStock()) <= 0)
                .map(this::mapToResponse)
                .toList();
    }

    public List<InventoryDTO.Response> getItemsBySupplier(String supplier) {
        return inventoryRepository.findBySupplier(supplier).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<InventoryDTO.Response> searchItems(String searchTerm) {
        return inventoryRepository.findByNameContainingIgnoreCase(searchTerm).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    @NonNull
    public InventoryDTO.Response createItem(@NonNull InventoryDTO.Create createDTO) {
        if (inventoryRepository.existsByName(createDTO.name())) {
            throw new com.bakery.exception.ProductAlreadyExistsException(
                    "Inventory item already exists with name: " + createDTO.name());
        }

        InventoryItem item = new InventoryItem();
        item.setName(createDTO.name());
        item.setDescription(createDTO.description());
        item.setUnit(createDTO.unit());
        item.setCurrentStock(createDTO.currentStock());
        item.setMinimumStock(createDTO.minimumStock());
        item.setCostPerUnit(createDTO.costPerUnit());
        item.setSupplier(createDTO.supplier());
        item.setImageUrl(createDTO.imageUrl());
        item.setLastRestocked(LocalDateTime.now());

        InventoryItem savedItem = inventoryRepository.save(item);
        return mapToResponse(savedItem);
    }

    @Transactional
    @NonNull
    public InventoryDTO.Response createItem(@NonNull InventoryDTO.Create createDTO, MultipartFile file) {
        if (inventoryRepository.existsByName(createDTO.name())) {
            throw new com.bakery.exception.ProductAlreadyExistsException(
                    "Inventory item already exists with name: " + createDTO.name());
        }

        InventoryItem item = new InventoryItem();
        item.setName(createDTO.name());
        item.setDescription(createDTO.description());
        item.setUnit(createDTO.unit());
        item.setCurrentStock(createDTO.currentStock());
        item.setMinimumStock(createDTO.minimumStock());
        item.setCostPerUnit(createDTO.costPerUnit());
        item.setSupplier(createDTO.supplier());
        item.setLastRestocked(LocalDateTime.now());

        if (file != null && !file.isEmpty()) {
            String imageUrl = saveImage(file);
            item.setImageUrl(imageUrl);
        } else if (createDTO.imageUrl() != null) {
            item.setImageUrl(createDTO.imageUrl());
        }

        InventoryItem savedItem = inventoryRepository.save(item);
        return mapToResponse(savedItem);
    }

    @Transactional
    @NonNull
    public InventoryDTO.Response updateItem(@NonNull Long id, @NonNull InventoryDTO.Update updateDTO) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        if (!item.getName().equals(updateDTO.name())
                && inventoryRepository.existsByName(updateDTO.name())) {
            throw new com.bakery.exception.ProductAlreadyExistsException(
                    "Inventory item already exists with name: " + updateDTO.name());
        }

        item.setName(updateDTO.name());
        item.setDescription(updateDTO.description());
        item.setUnit(updateDTO.unit());
        item.setCurrentStock(updateDTO.currentStock());
        item.setMinimumStock(updateDTO.minimumStock());
        item.setCostPerUnit(updateDTO.costPerUnit());
        item.setSupplier(updateDTO.supplier());
        item.setImageUrl(updateDTO.imageUrl());

        InventoryItem updatedItem = inventoryRepository.save(item);
        return mapToResponse(updatedItem);
    }

    @Transactional
    @NonNull
    public InventoryDTO.Response updateItem(@NonNull Long id, @NonNull InventoryDTO.Update updateDTO, MultipartFile file) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        if (!item.getName().equals(updateDTO.name())
                && inventoryRepository.existsByName(updateDTO.name())) {
            throw new com.bakery.exception.ProductAlreadyExistsException(
                    "Inventory item already exists with name: " + updateDTO.name());
        }

        item.setName(updateDTO.name());
        item.setDescription(updateDTO.description());
        item.setUnit(updateDTO.unit());
        item.setCurrentStock(updateDTO.currentStock());
        item.setMinimumStock(updateDTO.minimumStock());
        item.setCostPerUnit(updateDTO.costPerUnit());
        item.setSupplier(updateDTO.supplier());

        if (file != null && !file.isEmpty()) {
            String imageUrl = saveImage(file);
            item.setImageUrl(imageUrl);
        } else if (updateDTO.imageUrl() != null) {
            item.setImageUrl(updateDTO.imageUrl());
        }

        InventoryItem updatedItem = inventoryRepository.save(item);
        return mapToResponse(updatedItem);
    }

    @NonNull
    private String saveImage(@NonNull MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            return "/uploads/inventory/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    @Transactional
    @NonNull
    public InventoryDTO.Response adjustStock(@NonNull Long id, @NonNull BigDecimal adjustment) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        BigDecimal newStock = item.getCurrentStock().add(adjustment);
        if (newStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Current: " + item.getCurrentStock() + " " + item.getUnit());
        }

        item.setCurrentStock(newStock);
        item.setLastRestocked(LocalDateTime.now());

        InventoryItem updatedItem = inventoryRepository.save(item);
        return mapToResponse(updatedItem);
    }

    @Transactional
    @NonNull
    public InventoryDTO.Response setStock(@NonNull Long id, @NonNull BigDecimal newStock) {
        if (newStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        item.setCurrentStock(newStock);
        item.setLastRestocked(LocalDateTime.now());

        InventoryItem updatedItem = inventoryRepository.save(item);
        return mapToResponse(updatedItem);
    }

    @Transactional
    public void deleteItem(@NonNull Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inventory item not found with id: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    @NonNull
    private InventoryDTO.Response mapToResponse(@NonNull InventoryItem item) {
        boolean isLowStock = item.getCurrentStock().compareTo(item.getMinimumStock()) <= 0;
        return new InventoryDTO.Response(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getUnit(),
                item.getCurrentStock(),
                item.getMinimumStock(),
                item.getCostPerUnit(),
                item.getSupplier(),
                item.getImageUrl(),
                item.getLastRestocked(),
                isLowStock
        );
    }
}
