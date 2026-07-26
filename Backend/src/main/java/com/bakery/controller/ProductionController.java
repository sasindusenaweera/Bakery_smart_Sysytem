package com.bakery.controller;

import com.bakery.dto.IssueDTO;
import com.bakery.dto.OwnerDTO;
import com.bakery.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor

public class ProductionController {

    private final ProductionService productionService;

    @GetMapping
    public ResponseEntity<List<OwnerDTO.ProductionResponse>> getAllProductions() {
        List<OwnerDTO.ProductionResponse> productions = productionService.getAllProductions();
        return ResponseEntity.ok(productions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OwnerDTO.ProductionResponse> getProductionById(@PathVariable Long id) {
        OwnerDTO.ProductionResponse production = productionService.getProductionById(id);
        return ResponseEntity.ok(production);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<OwnerDTO.ProductionResponse>> filterProductions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<OwnerDTO.ProductionResponse> productions = productionService.getProductionsByDateRange(startDate, endDate);
        return ResponseEntity.ok(productions);
    }

    @GetMapping("/stats")
    public ResponseEntity<IssueDTO.ProductionStats> getProductionStats(
            @RequestParam(required = false, defaultValue = "weekly") String period) {
        IssueDTO.ProductionStats stats = productionService.getProductionStats(period);
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<OwnerDTO.ProductionResponse> createProduction(
            @RequestBody OwnerDTO.ProductionCreate createDTO,
            @RequestParam(required = false) Long userId) {
        OwnerDTO.ProductionResponse production = productionService.createProduction(createDTO, userId);
        return new ResponseEntity<>(production, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OwnerDTO.ProductionResponse> updateProduction(
            @PathVariable Long id,
            @RequestBody IssueDTO.ProductionUpdate updateDTO) {
        OwnerDTO.ProductionResponse production = productionService.updateProduction(id, updateDTO);
        return ResponseEntity.ok(production);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduction(@PathVariable Long id) {
        productionService.deleteProduction(id);
        return ResponseEntity.noContent().build();
    }
}
