package com.bakery.service;

import com.bakery.dto.IssueDTO;
import com.bakery.dto.OwnerDTO;
import com.bakery.entity.Production;
import com.bakery.entity.ProductionItem;
import com.bakery.entity.Product;
import com.bakery.entity.User;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.exception.ValidationException;
import com.bakery.repository.ProductionRepository;
import com.bakery.repository.ProductRepository;
import com.bakery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductionRepository productionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<OwnerDTO.ProductionResponse> getAllProductions() {
        List<Production> productions = productionRepository.findTop10ByOrderByProductionDateDesc();
        return productions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OwnerDTO.ProductionResponse getProductionById(Long id) {
        Production production = productionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production not found with id: " + id));
        return mapToResponse(production);
    }

    @Transactional(readOnly = true)
    public List<OwnerDTO.ProductionResponse> getProductionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();
        List<Production> productions = productionRepository.findByDateRange(start, end);
        return productions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IssueDTO.ProductionStats getProductionStats(String period) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start;

        switch (period != null ? period.toLowerCase() : "weekly") {
            case "daily":
                start = end.toLocalDate().atStartOfDay();
                break;
            case "monthly":
                start = end.minusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                break;
            case "weekly":
            default:
                start = end.minusWeeks(1);
                break;
        }

        Long totalProductions = productionRepository.countByDateRange(start, end);
        Long totalItemsProduced = productionRepository.getTotalItemsProduced(start, end);
        Long totalWaste = productionRepository.getTotalWaste(start, end);
        BigDecimal totalCost = productionRepository.getTotalProductionCost(start, end);

        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(start, end);
        BigDecimal dailyAverage = BigDecimal.ZERO;
        if (daysBetween > 0 && totalItemsProduced != null) {
            dailyAverage = BigDecimal.valueOf(totalItemsProduced)
                    .divide(BigDecimal.valueOf(daysBetween), 2, RoundingMode.HALF_UP);
        }

        List<OwnerDTO.ProductionResponse> recentProductions = productionRepository
                .findByDateRange(start, end)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        List<IssueDTO.TopProduct> topProducts = calculateTopProducts(recentProductions);
        List<IssueDTO.WasteByDay> wasteByDay = calculateWasteByDay(recentProductions);

        return new IssueDTO.ProductionStats(
                totalProductions != null ? totalProductions : 0L,
                totalItemsProduced != null ? totalItemsProduced : 0L,
                totalWaste != null ? totalWaste : 0L,
                totalCost != null ? totalCost : BigDecimal.ZERO,
                dailyAverage,
                topProducts,
                wasteByDay
        );
    }

    @Transactional
    public OwnerDTO.ProductionResponse createProduction(OwnerDTO.ProductionCreate createDTO, Long userId) {
        validateProductionCreate(createDTO);

        Production production = Production.builder()
                .productionDate(createDTO.productionDate() != null ? createDTO.productionDate() : LocalDateTime.now())
                .notes(createDTO.notes())
                .build();

        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            production.setCreatedBy(user);
        }

        if (createDTO.items() != null && !createDTO.items().isEmpty()) {
            for (OwnerDTO.ProductionItemCreate itemCreate : createDTO.items()) {
                Product product = productRepository.findById(itemCreate.productId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Product not found with id: " + itemCreate.productId()));

                BigDecimal productCost = product.getCostPrice() != null
                        ? product.getCostPrice()
                        : BigDecimal.ZERO;

                ProductionItem item = ProductionItem.builder()
                        .product(product)
                        .quantity(itemCreate.quantity())
                        .wasteQuantity(itemCreate.wasteQuantity() != null ? itemCreate.wasteQuantity() : 0)
                        .productCost(productCost)
                        .build();

                production.addItem(item);
            }
        }

        Production saved = productionRepository.save(production);
        return mapToResponse(saved);
    }

    @Transactional
    public OwnerDTO.ProductionResponse updateProduction(Long id, IssueDTO.ProductionUpdate updateDTO) {
        Production production = productionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production not found with id: " + id));

        if (updateDTO.productionDate() != null) {
            production.setProductionDate(updateDTO.productionDate());
        }

        if (updateDTO.notes() != null) {
            production.setNotes(updateDTO.notes());
        }

        if (updateDTO.items() != null) {
            production.getItems().clear();

            for (IssueDTO.ProductionItemUpdate itemUpdate : updateDTO.items()) {
                Product product = productRepository.findById(itemUpdate.productId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Product not found with id: " + itemUpdate.productId()));

                BigDecimal productCost = product.getCostPrice() != null
                        ? product.getCostPrice()
                        : BigDecimal.ZERO;

                ProductionItem item = ProductionItem.builder()
                        .product(product)
                        .quantity(itemUpdate.quantity())
                        .wasteQuantity(itemUpdate.wasteQuantity() != null ? itemUpdate.wasteQuantity() : 0)
                        .productCost(productCost)
                        .build();

                production.addItem(item);
            }
        }

        Production updated = productionRepository.save(production);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduction(Long id) {
        Production production = productionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production not found with id: " + id));

        productionRepository.delete(production);
    }

    private void validateProductionCreate(OwnerDTO.ProductionCreate createDTO) {
        if (createDTO.items() == null || createDTO.items().isEmpty()) {
            throw new ValidationException("At least one production item is required");
        }

        for (OwnerDTO.ProductionItemCreate item : createDTO.items()) {
            if (item.productId() == null) {
                throw new ValidationException("Product ID is required for each item");
            }
            if (item.quantity() == null || item.quantity() <= 0) {
                throw new ValidationException("Quantity must be greater than zero");
            }
        }
    }

    private OwnerDTO.ProductionResponse mapToResponse(Production production) {
        List<OwnerDTO.ProductionItemResponse> items = production.getItems().stream()
                .map(item -> new OwnerDTO.ProductionItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getWasteQuantity(),
                        item.getProductCost()))
                .collect(Collectors.toList());

        String enteredBy = null;
        String enteredByRole = null;
        if (production.getCreatedBy() != null) {
            enteredBy = production.getCreatedBy().getUsername();
            enteredByRole = production.getCreatedBy().getRole() != null 
                ? production.getCreatedBy().getRole().name() 
                : null;
        }

        return new OwnerDTO.ProductionResponse(
                production.getId(),
                production.getProductionDate(),
                production.getNotes(),
                items,
                production.getCreatedAt(),
                enteredBy,
                enteredByRole);
    }

    private List<IssueDTO.TopProduct> calculateTopProducts(List<OwnerDTO.ProductionResponse> productions) {
        Map<Long, Long[]> productMap = new java.util.HashMap<>();

        for (OwnerDTO.ProductionResponse production : productions) {
            if (production.items() == null) continue;
            for (OwnerDTO.ProductionItemResponse item : production.items()) {
                Long[] data = productMap.get(item.productId());
                if (data == null) {
                    data = new Long[]{0L, BigDecimal.ZERO.longValue()};
                    productMap.put(item.productId(), data);
                }
                data[0] = data[0] + item.quantity();
                if (item.productCost() != null) {
                    data[1] = data[1] + item.productCost().multiply(BigDecimal.valueOf(item.quantity())).longValue();
                }
            }
        }

        return productMap.entrySet().stream()
                .map(entry -> new IssueDTO.TopProduct(
                        entry.getKey(),
                        productions.stream()
                                .filter(p -> p.items() != null)
                                .flatMap(p -> p.items().stream())
                                .filter(i -> i.productId().equals(entry.getKey()))
                                .findFirst()
                                .map(OwnerDTO.ProductionItemResponse::productName)
                                .orElse("Unknown"),
                        entry.getValue()[0],
                        BigDecimal.valueOf(entry.getValue()[1])))
                .sorted((a, b) -> Long.compare(b.totalQuantity(), a.totalQuantity()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<IssueDTO.WasteByDay> calculateWasteByDay(List<OwnerDTO.ProductionResponse> productions) {
        Map<LocalDateTime, Long> wasteMap = new java.util.LinkedHashMap<>();

        for (OwnerDTO.ProductionResponse production : productions) {
            if (production.items() == null) continue;
            LocalDateTime date = production.productionDate().toLocalDate().atStartOfDay();
            long dayWaste = production.items().stream()
                    .filter(item -> item.wasteQuantity() != null)
                    .mapToLong(OwnerDTO.ProductionItemResponse::wasteQuantity)
                    .sum();
            wasteMap.merge(date, dayWaste, Long::sum);
        }

        return wasteMap.entrySet().stream()
                .map(entry -> new IssueDTO.WasteByDay(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .collect(Collectors.toList());
    }
}
