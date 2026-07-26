package com.bakery.controller;

import com.bakery.dto.ProductDTO;
import com.bakery.entity.ProductCategory;
import com.bakery.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor

public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO.Response>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO.Response> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDTO.Response>> getProductsByCategory(@PathVariable ProductCategory category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @GetMapping("/available")
    public ResponseEntity<List<ProductDTO.Response>> getAvailableProducts() {
        return ResponseEntity.ok(productService.getAvailableProducts());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO.Response>> searchProducts(@RequestParam String q) {
        return ResponseEntity.ok(productService.searchProducts(q));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductDTO.Response>> getLowStockProducts(@RequestParam(defaultValue = "10") Integer threshold) {
        return ResponseEntity.ok(productService.getLowStockProducts(threshold));
    }

    @PostMapping
    public ResponseEntity<ProductDTO.Response> createProduct(@Valid @RequestBody ProductDTO.Create createDTO) {
        ProductDTO.Response response = productService.createProduct(createDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/upload")
    public ResponseEntity<ProductDTO.Response> createProductWithImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") String price,
            @RequestParam(value = "costPrice", required = false) String costPrice,
            @RequestParam("category") String category,
            @RequestParam(value = "stockQuantity", required = false) String stockQuantity) {
        ProductDTO.Create createDTO = new ProductDTO.Create(
            name, 
            description, 
            new BigDecimal(price), 
            costPrice != null ? new BigDecimal(costPrice) : null, 
            ProductCategory.valueOf(category), 
            null, 
            stockQuantity != null ? Integer.parseInt(stockQuantity) : null
        );
        ProductDTO.Response response = productService.createProduct(createDTO, file);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO.Response> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO.Update updateDTO) {
        return ResponseEntity.ok(productService.updateProduct(id, updateDTO));
    }

    @PutMapping("/{id}/upload")
    public ResponseEntity<ProductDTO.Response> updateProductWithImage(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") String price,
            @RequestParam(value = "costPrice", required = false) String costPrice,
            @RequestParam("category") String category,
            @RequestParam(value = "stockQuantity", required = false) String stockQuantity) {
        ProductDTO.Update updateDTO = new ProductDTO.Update(
            name, 
            description, 
            new BigDecimal(price), 
            costPrice != null ? new BigDecimal(costPrice) : null, 
            ProductCategory.valueOf(category), 
            null, 
            stockQuantity != null ? Integer.parseInt(stockQuantity) : null
        );
        return ResponseEntity.ok(productService.updateProduct(id, updateDTO, file));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductDTO.Response> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO.StockUpdate stockUpdate) {
        return ResponseEntity.ok(productService.updateStock(id, stockUpdate.quantity()));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<ProductDTO.Response> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO.AvailabilityUpdate availabilityUpdate) {
        return ResponseEntity.ok(productService.updateAvailability(id, availabilityUpdate.isAvailable()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
