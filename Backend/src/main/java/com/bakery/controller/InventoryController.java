package com.bakery.controller;

import com.bakery.dto.InventoryDTO;
import com.bakery.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor

public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryDTO.Response>> getAllItems() {
        return ResponseEntity.ok(inventoryService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO.Response> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getItemById(id));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryDTO.Response>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @GetMapping("/supplier/{supplier}")
    public ResponseEntity<List<InventoryDTO.Response>> getItemsBySupplier(@PathVariable String supplier) {
        return ResponseEntity.ok(inventoryService.getItemsBySupplier(supplier));
    }

    @GetMapping("/search")
    public ResponseEntity<List<InventoryDTO.Response>> searchItems(@RequestParam String q) {
        return ResponseEntity.ok(inventoryService.searchItems(q));
    }

    @PostMapping
    public ResponseEntity<InventoryDTO.Response> createItem(@Valid @RequestBody InventoryDTO.Create createDTO) {
        InventoryDTO.Response response = inventoryService.createItem(createDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/upload")
    public ResponseEntity<InventoryDTO.Response> createItemWithImage(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("unit") String unit,
            @RequestParam("currentStock") String currentStock,
            @RequestParam("minimumStock") String minimumStock,
            @RequestParam(value = "costPerUnit", required = false) String costPerUnit,
            @RequestParam(value = "supplier", required = false) String supplier,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {
        InventoryDTO.Create createDTO = new InventoryDTO.Create(
            name,
            description,
            unit,
            new BigDecimal(currentStock),
            new BigDecimal(minimumStock),
            costPerUnit != null ? new BigDecimal(costPerUnit) : null,
            supplier,
            imageUrl
        );
        InventoryDTO.Response response = inventoryService.createItem(createDTO, file);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryDTO.Response> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryDTO.Update updateDTO) {
        return ResponseEntity.ok(inventoryService.updateItem(id, updateDTO));
    }

    @PutMapping("/{id}/upload")
    public ResponseEntity<InventoryDTO.Response> updateItemWithImage(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("unit") String unit,
            @RequestParam("currentStock") String currentStock,
            @RequestParam("minimumStock") String minimumStock,
            @RequestParam(value = "costPerUnit", required = false) String costPerUnit,
            @RequestParam(value = "supplier", required = false) String supplier,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {
        InventoryDTO.Update updateDTO = new InventoryDTO.Update(
            name,
            description,
            unit,
            new BigDecimal(currentStock),
            new BigDecimal(minimumStock),
            costPerUnit != null ? new BigDecimal(costPerUnit) : null,
            supplier,
            imageUrl
        );
        return ResponseEntity.ok(inventoryService.updateItem(id, updateDTO, file));
    }

    @PatchMapping("/{id}/adjust")
    public ResponseEntity<InventoryDTO.Response> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody InventoryDTO.StockAdjustment adjustment) {
        return ResponseEntity.ok(inventoryService.adjustStock(id, adjustment.adjustment()));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<InventoryDTO.Response> setStock(
            @PathVariable Long id,
            @RequestParam BigDecimal stock) {
        return ResponseEntity.ok(inventoryService.setStock(id, stock));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryService.deleteItem(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
