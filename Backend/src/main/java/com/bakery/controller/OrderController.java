package com.bakery.controller;

import com.bakery.dto.OwnerDTO;
import com.bakery.entity.CustomerOrder;
import com.bakery.entity.OrderItem;
import com.bakery.entity.Product;
import com.bakery.entity.User;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.repository.CustomerOrderRepository;
import com.bakery.repository.ProductRepository;
import com.bakery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor

public class OrderController {

    private final CustomerOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<OwnerDTO.OrderResponse>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<CustomerOrder> orders;
        
        if (status != null && !status.isEmpty()) {
            CustomerOrder.OrderStatus orderStatus = CustomerOrder.OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByStatusOrderByOrderDateDesc(orderStatus);
        } else if (customerName != null && !customerName.isEmpty()) {
            orders = orderRepository.findByCustomerNameContainingIgnoreCase(customerName);
        } else if (startDate != null || endDate != null) {
            orders = orderRepository.findByOrderDateBetweenOrderByOrderDateDesc(
                    startDate != null ? startDate : LocalDateTime.of(2000, 1, 1, 0, 0),
                    endDate != null ? endDate : LocalDateTime.now());
        } else {
            orders = orderRepository.findAll();
        }
        
        orders.sort((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()));
        
        List<OwnerDTO.OrderResponse> response = orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OwnerDTO.OrderResponse> getOrderById(@PathVariable Long id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return ResponseEntity.ok(mapToResponse(order));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OwnerDTO.OrderResponse>> getOrdersByStatus(@PathVariable String status) {
        CustomerOrder.OrderStatus orderStatus = CustomerOrder.OrderStatus.valueOf(status.toUpperCase());
        List<CustomerOrder> orders = orderRepository.findByStatusOrderByOrderDateDesc(orderStatus);
        List<OwnerDTO.OrderResponse> response = orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getOrderCount(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String date) {
        long count;
        if (status != null && !status.isEmpty()) {
            CustomerOrder.OrderStatus orderStatus = CustomerOrder.OrderStatus.valueOf(status.toUpperCase());
            count = orderRepository.countByStatus(orderStatus);
        } else if (date != null) {
            LocalDateTime startOfDay = LocalDateTime.parse(date + "T00:00:00");
            LocalDateTime endOfDay = LocalDateTime.parse(date + "T23:59:59");
            count = orderRepository.countByOrderDateBetween(startOfDay, endOfDay);
        } else {
            count = orderRepository.count();
        }
        return ResponseEntity.ok(count);
    }

    @PostMapping
    public ResponseEntity<OwnerDTO.OrderResponse> createOrder(
            @RequestBody OwnerDTO.OrderCreate createDTO,
            @RequestParam(required = false) Long userId) {
        CustomerOrder order = CustomerOrder.builder()
                .customerName(createDTO.customerName())
                .phoneNumber(createDTO.phoneNumber())
                .orderDate(createDTO.orderDate() != null ? createDTO.orderDate() : LocalDateTime.now())
                .requiredDate(createDTO.requiredDate())
                .deliveryAddress(createDTO.deliveryAddress())
                .notes(createDTO.notes())
                .status(CustomerOrder.OrderStatus.PENDING)
                .build();

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            order.setCreatedBy(user);
        }

        BigDecimal total = BigDecimal.ZERO;

        if (createDTO.items() != null && !createDTO.items().isEmpty()) {
            for (OwnerDTO.OrderItemCreate itemCreate : createDTO.items()) {
                Product product = productRepository.findById(itemCreate.productId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemCreate.productId()));

                BigDecimal subtotal = itemCreate.unitPrice().multiply(BigDecimal.valueOf(itemCreate.quantity()));

                OrderItem item = OrderItem.builder()
                        .product(product)
                        .quantity(itemCreate.quantity())
                        .unitPrice(itemCreate.unitPrice())
                        .subtotal(subtotal)
                        .build();

                order.addItem(item);
                total = total.add(subtotal);
            }
        }

        order.setTotalAmount(total);
        CustomerOrder saved = orderRepository.save(order);
        return new ResponseEntity<>(mapToResponse(saved), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OwnerDTO.OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OwnerDTO.OrderUpdateStatus updateStatus) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(CustomerOrder.OrderStatus.valueOf(updateStatus.status().toUpperCase()));
        if (updateStatus.preparationNotes() != null) {
            order.setPreparationNotes(updateStatus.preparationNotes());
        }
        if ("CANCELLED".equalsIgnoreCase(updateStatus.status()) && updateStatus.cancellationReason() != null) {
            order.setCancellationReason(updateStatus.cancellationReason());
            order.setCancelledAt(LocalDateTime.now());
        }
        CustomerOrder saved = orderRepository.save(order);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OwnerDTO.OrderResponse> cancelOrder(
            @PathVariable Long id,
            @RequestBody OwnerDTO.OrderCancellation cancellation) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(CustomerOrder.OrderStatus.CANCELLED);
        if (cancellation.cancellationReason() != null) {
            order.setCancellationReason(cancellation.cancellationReason());
        }
        order.setCancelledAt(LocalDateTime.now());
        CustomerOrder saved = orderRepository.save(order);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<OwnerDTO.OrderResponse> recordPayment(
            @PathVariable Long id,
            @RequestBody OwnerDTO.OrderPayment payment) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (payment.advancePayment() != null) {
            order.setAdvancePayment(payment.advancePayment());
        }
        if (payment.paidAmount() != null) {
            order.setPaidAmount(payment.paidAmount());
        }
        
        CustomerOrder saved = orderRepository.save(order);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found");
        }
        orderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Order API is working! Total orders: " + orderRepository.count());
    }

    private OwnerDTO.OrderResponse mapToResponse(CustomerOrder order) {
        List<OwnerDTO.OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OwnerDTO.OrderItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()))
                .collect(Collectors.toList());

        return new OwnerDTO.OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getPhoneNumber(),
                order.getOrderDate(),
                order.getRequiredDate(),
                order.getDeliveryAddress(),
                order.getStatus().name(),
                order.getNotes(),
                order.getPreparationNotes(),
                order.getTotalAmount(),
                order.getAdvancePayment(),
                order.getPaidAmount(),
                order.getPendingAmount(),
                items,
                order.getCreatedAt());
    }
}
