package com.bakery.service;

import com.bakery.dto.IssueDTO;
import com.bakery.entity.InventoryItem;
import com.bakery.entity.Issue;
import com.bakery.entity.IssueItem;
import com.bakery.entity.User;
import com.bakery.exception.InsufficientStockException;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.exception.ValidationException;
import com.bakery.repository.InventoryRepository;
import com.bakery.repository.IssueRepository;
import com.bakery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<IssueDTO.IssueResponse> getAllIssues() {
        List<Issue> issues = issueRepository.findTop10ByOrderByIssueDateDesc();
        return issues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IssueDTO.IssueResponse getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));
        return mapToResponse(issue);
    }

    @Transactional(readOnly = true)
    public List<IssueDTO.IssueResponse> getIssuesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();
        List<Issue> issues = issueRepository.findByDateRange(start, end);
        return issues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueDTO.IssueResponse> getIssuesByIssuedTo(String issuedTo) {
        List<Issue> issues = issueRepository.findByIssuedToContainingIgnoreCase(issuedTo);
        return issues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public IssueDTO.IssueResponse createIssue(IssueDTO.IssueCreate createDTO, Long userId) {
        validateIssueCreate(createDTO);

        Issue issue = Issue.builder()
                .issueDate(createDTO.issueDate() != null ? createDTO.issueDate() : LocalDateTime.now())
                .issuedTo(createDTO.issuedTo())
                .notes(createDTO.notes())
                .build();

        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            issue.setCreatedBy(user);
        }

        if (createDTO.items() != null && !createDTO.items().isEmpty()) {
            for (IssueDTO.IssueItemCreate itemCreate : createDTO.items()) {
                InventoryItem inventoryItem = inventoryRepository.findById(itemCreate.inventoryItemId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Inventory item not found with id: " + itemCreate.inventoryItemId()));

                BigDecimal quantity = itemCreate.quantity();
                if (inventoryItem.getCurrentStock().compareTo(quantity) < 0) {
                    throw new InsufficientStockException(
                            "Insufficient stock for item: " + inventoryItem.getName() +
                            ". Available: " + inventoryItem.getCurrentStock() +
                            ", Requested: " + quantity);
                }

                BigDecimal unitCost = inventoryItem.getCostPerUnit() != null
                        ? inventoryItem.getCostPerUnit()
                        : BigDecimal.ZERO;

                IssueItem item = IssueItem.builder()
                        .inventoryItem(inventoryItem)
                        .quantity(quantity)
                        .unitCost(unitCost)
                        .build();

                issue.addItem(item);

                inventoryItem.setCurrentStock(inventoryItem.getCurrentStock().subtract(quantity));
                inventoryItem.setLastRestocked(LocalDateTime.now());
                inventoryRepository.save(inventoryItem);
            }
        }

        Issue saved = issueRepository.save(issue);
        return mapToResponse(saved);
    }

    @Transactional
    public IssueDTO.IssueResponse updateIssue(Long id, IssueDTO.IssueUpdate updateDTO) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));

        if (updateDTO.issueDate() != null) {
            issue.setIssueDate(updateDTO.issueDate());
        }

        if (updateDTO.issuedTo() != null && !updateDTO.issuedTo().isBlank()) {
            issue.setIssuedTo(updateDTO.issuedTo());
        }

        if (updateDTO.notes() != null) {
            issue.setNotes(updateDTO.notes());
        }

        if (updateDTO.items() != null) {
            restoreInventoryForItems(issue.getItems());

            issue.getItems().clear();

            for (IssueDTO.IssueItemCreate itemCreate : updateDTO.items()) {
                InventoryItem inventoryItem = inventoryRepository.findById(itemCreate.inventoryItemId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Inventory item not found with id: " + itemCreate.inventoryItemId()));

                BigDecimal quantity = itemCreate.quantity();
                if (inventoryItem.getCurrentStock().compareTo(quantity) < 0) {
                    throw new InsufficientStockException(
                            "Insufficient stock for item: " + inventoryItem.getName() +
                            ". Available: " + inventoryItem.getCurrentStock() +
                            ", Requested: " + quantity);
                }

                BigDecimal unitCost = inventoryItem.getCostPerUnit() != null
                        ? inventoryItem.getCostPerUnit()
                        : BigDecimal.ZERO;

                IssueItem item = IssueItem.builder()
                        .inventoryItem(inventoryItem)
                        .quantity(quantity)
                        .unitCost(unitCost)
                        .build();

                issue.addItem(item);

                inventoryItem.setCurrentStock(inventoryItem.getCurrentStock().subtract(quantity));
                inventoryItem.setLastRestocked(LocalDateTime.now());
                inventoryRepository.save(inventoryItem);
            }
        }

        Issue updated = issueRepository.save(issue);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));

        restoreInventoryForItems(issue.getItems());

        issueRepository.delete(issue);
    }

    private void restoreInventoryForItems(List<IssueItem> items) {
        for (IssueItem item : items) {
            InventoryItem inventoryItem = item.getInventoryItem();
            if (inventoryItem != null) {
                inventoryItem.setCurrentStock(inventoryItem.getCurrentStock().add(item.getQuantity()));
                inventoryRepository.save(inventoryItem);
            }
        }
    }

    private void validateIssueCreate(IssueDTO.IssueCreate createDTO) {
        if (createDTO.issuedTo() == null || createDTO.issuedTo().isBlank()) {
            throw new ValidationException("IssuedTo is required");
        }

        if (createDTO.items() == null || createDTO.items().isEmpty()) {
            throw new ValidationException("At least one item is required");
        }

        for (IssueDTO.IssueItemCreate item : createDTO.items()) {
            if (item.inventoryItemId() == null) {
                throw new ValidationException("Inventory item ID is required for each item");
            }
            if (item.quantity() == null || item.quantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ValidationException("Quantity must be greater than zero");
            }
        }
    }

    private IssueDTO.IssueResponse mapToResponse(Issue issue) {
        List<IssueDTO.IssueItemResponse> itemResponses = issue.getItems().stream()
                .map(item -> new IssueDTO.IssueItemResponse(
                        item.getId(),
                        item.getInventoryItemId(),
                        item.getItemName(),
                        item.getQuantity(),
                        item.getUnit(),
                        item.getUnitCost(),
                        item.getSubtotal()))
                .collect(Collectors.toList());

        String createdByUsername = issue.getCreatedBy() != null
                ? issue.getCreatedBy().getUsername()
                : null;

        return new IssueDTO.IssueResponse(
                issue.getId(),
                issue.getIssueDate(),
                issue.getIssuedTo(),
                issue.getNotes(),
                itemResponses,
                createdByUsername,
                issue.getCreatedAt(),
                issue.getTotalItems(),
                issue.getTotalValue());
    }
}
