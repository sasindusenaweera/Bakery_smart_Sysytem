package com.bakery.service;

import com.bakery.dto.OwnerDTO;
import com.bakery.entity.Expense;
import com.bakery.entity.ExpenseFund;
import com.bakery.repository.ExpenseFundRepository;
import com.bakery.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseFundService {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseFundService.class);

    private final ExpenseFundRepository expenseFundRepository;
    private final ExpenseRepository expenseRepository;

    public List<OwnerDTO.ExpenseFundResponse> getAllExpenseFunds() {
        return expenseFundRepository.findAllByOrderByAllocationDateDesc().stream()
                .map(this::mapToFundResponse)
                .collect(Collectors.toList());
    }

    public OwnerDTO.ExpenseFundResponse getExpenseFundById(Long id) {
        ExpenseFund fund = expenseFundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense fund not found"));
        return mapToFundResponse(fund);
    }

    public OwnerDTO.ExpenseFundSummary getExpenseFundSummary() {
        return new OwnerDTO.ExpenseFundSummary(
                expenseFundRepository.sumTotalAllocated(),
                expenseFundRepository.sumTotalUsed(),
                expenseFundRepository.sumTotalRemaining(),
                (long) expenseFundRepository.count(),
                (long) expenseRepository.count()
        );
    }

    @Transactional
    public OwnerDTO.ExpenseFundResponse createExpenseFund(OwnerDTO.ExpenseFundCreate createDTO) {
        logger.info("Creating expense fund: amount={}, date={}", createDTO.allocatedAmount(), createDTO.allocationDate());

        ExpenseFund fund = ExpenseFund.builder()
                .allocatedAmount(createDTO.allocatedAmount())
                .usedAmount(BigDecimal.ZERO)
                .remainingBalance(createDTO.allocatedAmount())
                .allocationDate(createDTO.allocationDate())
                .notes(createDTO.notes())
                .build();

        ExpenseFund saved = expenseFundRepository.save(fund);
        return mapToFundResponse(saved);
    }

    @Transactional
    public OwnerDTO.ExpenseResponse createExpense(OwnerDTO.ExpenseCreate createDTO) {
        logger.info("Creating expense: title={}, amount={}, fundId={}", 
                createDTO.title(), createDTO.amount(), createDTO.expenseFundId());

        ExpenseFund fund = null;
        if (createDTO.expenseFundId() != null) {
            fund = expenseFundRepository.findById(createDTO.expenseFundId())
                    .orElseThrow(() -> new RuntimeException("Expense fund not found"));
            
            if (fund.getRemainingBalance().compareTo(createDTO.amount()) < 0) {
                throw new RuntimeException("Insufficient fund balance");
            }

            fund.setUsedAmount(fund.getUsedAmount().add(createDTO.amount()));
            fund.setRemainingBalance(fund.getRemainingBalance().subtract(createDTO.amount()));
            expenseFundRepository.save(fund);
        }

        Expense expense = Expense.builder()
                .title(createDTO.title())
                .category(createDTO.category())
                .amount(createDTO.amount())
                .description(createDTO.description())
                .expenseDate(createDTO.expenseDate())
                .expenseFund(fund)
                .build();

        Expense saved = expenseRepository.save(expense);
        return mapToExpenseResponse(saved);
    }

    public List<OwnerDTO.ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAllByOrderByExpenseDateDesc().stream()
                .map(this::mapToExpenseResponse)
                .collect(Collectors.toList());
    }

    public List<OwnerDTO.ExpenseResponse> getExpensesByFund(Long fundId) {
        return expenseRepository.findByExpenseFundIdOrderByExpenseDateDesc(fundId).stream()
                .map(this::mapToExpenseResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (expense.getExpenseFund() != null) {
            ExpenseFund fund = expense.getExpenseFund();
            fund.setUsedAmount(fund.getUsedAmount().subtract(expense.getAmount()));
            fund.setRemainingBalance(fund.getRemainingBalance().add(expense.getAmount()));
            expenseFundRepository.save(fund);
        }

        expenseRepository.deleteById(id);
    }

    private OwnerDTO.ExpenseFundResponse mapToFundResponse(ExpenseFund fund) {
        List<OwnerDTO.ExpenseResponse> expenses = fund.getExpenses() != null 
                ? fund.getExpenses().stream().map(this::mapToExpenseResponse).collect(Collectors.toList())
                : List.of();

        return new OwnerDTO.ExpenseFundResponse(
                fund.getId(),
                fund.getAllocatedAmount(),
                fund.getUsedAmount(),
                fund.getRemainingBalance(),
                fund.getAllocationDate(),
                fund.getNotes(),
                fund.getAllocatedBy() != null ? fund.getAllocatedBy().getUsername() : null,
                fund.getCreatedAt(),
                expenses
        );
    }

    private OwnerDTO.ExpenseResponse mapToExpenseResponse(Expense expense) {
        return new OwnerDTO.ExpenseResponse(
                expense.getId(),
                expense.getTitle(),
                expense.getCategory(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getExpenseDate(),
                expense.getExpenseFund() != null ? expense.getExpenseFund().getId() : null,
                expense.getCreatedAt()
        );
    }
}