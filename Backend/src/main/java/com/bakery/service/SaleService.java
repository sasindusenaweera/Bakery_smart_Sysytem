package com.bakery.service;

import com.bakery.dto.SaleDTO;
import com.bakery.entity.PaymentMethod;
import com.bakery.entity.Product;
import com.bakery.entity.Sale;
import com.bakery.entity.SaleItem;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.repository.ProductRepository;
import com.bakery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private static final Logger logger = LoggerFactory.getLogger(SaleService.class);

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public List<SaleDTO.Response> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @NonNull
    public SaleDTO.Response getSaleById(@NonNull Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return mapToResponse(sale);
    }

    public List<SaleDTO.Response> getTodaySales() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return saleRepository.findBySaleDateBetween(startOfDay, endOfDay).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @NonNull
    public List<SaleDTO.Response> getSalesByDateRange(@NonNull LocalDateTime start, @NonNull LocalDateTime end) {
        return saleRepository.findBySaleDateBetween(start, end).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SaleDTO.SalesSummary getSalesSummary() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        Long totalSales = saleRepository.count();
        BigDecimal totalRevenue = saleRepository.sumTotalSalesSince(LocalDate.of(2000, 1, 1).atStartOfDay());
        Long todaySales = saleRepository.countSalesSince(startOfDay);
        BigDecimal todayRevenue = saleRepository.sumTotalSalesSince(startOfDay);

        BigDecimal cashTotal = saleRepository.sumSalesByPaymentMethodSince(
                LocalDate.of(2000, 1, 1).atStartOfDay(), PaymentMethod.CASH);
        BigDecimal cardTotal = saleRepository.sumSalesByPaymentMethodSince(
                LocalDate.of(2000, 1, 1).atStartOfDay(), PaymentMethod.CARD);
        BigDecimal creditTotal = saleRepository.sumSalesByPaymentMethodSince(
                LocalDate.of(2000, 1, 1).atStartOfDay(), PaymentMethod.CREDIT);

        return new SaleDTO.SalesSummary(
                totalSales != null ? totalSales : 0L,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                cashTotal != null ? cashTotal : BigDecimal.ZERO,
                cardTotal != null ? cardTotal : BigDecimal.ZERO,
                creditTotal != null ? creditTotal : BigDecimal.ZERO,
                todaySales != null ? todaySales.intValue() : 0,
                todayRevenue != null ? todayRevenue : BigDecimal.ZERO
        );
    }

    @Transactional
    @NonNull
    public SaleDTO.Response createSale(@NonNull SaleDTO.Create createDTO) {
        BigDecimal subtotal = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        for (SaleDTO.ItemData itemData : createDTO.items()) {
            Product product = productRepository.findById(itemData.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemData.productId()));

            if (!product.getIsAvailable()) {
                throw new IllegalStateException("Product " + product.getName() + " is not available");
            }

            if (product.getStockQuantity() < itemData.quantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - itemData.quantity());
            logger.info("Updating stock for product {}: from {} to {}", 
                product.getName(), 
                product.getStockQuantity() + itemData.quantity(), 
                product.getStockQuantity());
            productRepository.save(product);
            logger.info("Stock saved for product {}", product.getName());

            BigDecimal itemSubtotal = itemData.unitPrice().multiply(BigDecimal.valueOf(itemData.quantity()));
            subtotal = subtotal.add(itemSubtotal);

            SaleItem saleItem = SaleItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemData.quantity())
                    .unitPrice(itemData.unitPrice())
                    .subtotal(itemSubtotal)
                    .build();
            saleItems.add(saleItem);
        }

        BigDecimal discountAmount = createDTO.discountAmount() != null ? createDTO.discountAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.subtract(discountAmount);

        BigDecimal amountPaid = createDTO.amountPaid() != null ? createDTO.amountPaid() : totalAmount;
        BigDecimal changeGiven = BigDecimal.ZERO;

        if (createDTO.paymentMethod() == PaymentMethod.CASH && amountPaid.compareTo(totalAmount) > 0) {
            changeGiven = amountPaid.subtract(totalAmount);
        }

        Sale sale = Sale.builder()
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .paymentMethod(createDTO.paymentMethod())
                .amountPaid(amountPaid)
                .changeGiven(changeGiven)
                .cashierId(createDTO.cashierId())
                .cashierName(createDTO.cashierName())
                .saleDate(LocalDateTime.now())
                .items(saleItems)
                .build();

        for (SaleItem item : saleItems) {
            item.setSale(sale);
        }

        Sale savedSale = saleRepository.save(sale);

        return mapToResponse(savedSale);
    }

    private SaleDTO.Response mapToResponse(Sale sale) {
        List<SaleDTO.SaleItemResponse> itemResponses = new ArrayList<>();
        if (sale.getItems() != null) {
            for (SaleItem item : sale.getItems()) {
                itemResponses.add(new SaleDTO.SaleItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ));
            }
        }

        return new SaleDTO.Response(
                sale.getId(),
                sale.getSubtotal(),
                sale.getDiscountAmount(),
                sale.getTotalAmount(),
                sale.getPaymentMethod(),
                sale.getAmountPaid(),
                sale.getChangeGiven(),
                sale.getCashierId(),
                sale.getCashierName(),
                sale.getSaleDate(),
                itemResponses
        );
    }
}
