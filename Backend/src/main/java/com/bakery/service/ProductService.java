package com.bakery.service;

import com.bakery.dto.ProductDTO;
import com.bakery.entity.Product;
import com.bakery.entity.ProductCategory;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.exception.ProductAlreadyExistsException;
import com.bakery.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private static final String UPLOAD_DIR = "uploads/products";

    public List<ProductDTO.Response> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @NonNull
    public ProductDTO.Response getProductById(@NonNull Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    public List<ProductDTO.Response> getProductsByCategory(ProductCategory category) {
        return productRepository.findByCategory(category).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProductDTO.Response> getAvailableProducts() {
        return productRepository.findByIsAvailable(true).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProductDTO.Response> getProductsByCategoryAndAvailability(ProductCategory category, Boolean isAvailable) {
        return productRepository.findByCategoryAndIsAvailable(category, isAvailable).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProductDTO.Response> searchProducts(String searchTerm) {
        return productRepository.findByNameContainingIgnoreCase(searchTerm).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProductDTO.Response> getLowStockProducts(Integer threshold) {
        return productRepository.findByStockQuantityLessThan(threshold).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    @NonNull
    public ProductDTO.Response createProduct(@NonNull ProductDTO.Create createDTO) {
        if (productRepository.existsByName(createDTO.name())) {
            throw new ProductAlreadyExistsException("Product already exists with name: " + createDTO.name());
        }

        Product product = Product.builder()
                .name(createDTO.name())
                .description(createDTO.description())
                .price(createDTO.price())
                .costPrice(createDTO.costPrice())
                .category(createDTO.category())
                .imageUrl(createDTO.imageUrl())
                .stockQuantity(createDTO.stockQuantity() != null ? createDTO.stockQuantity() : 0)
                .isAvailable(true)
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Transactional
    @NonNull
    public ProductDTO.Response createProduct(@NonNull ProductDTO.Create createDTO, MultipartFile imageFile) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveImage(imageFile);
        }
        
        ProductDTO.Create createWithImage = new ProductDTO.Create(
            createDTO.name(),
            createDTO.description(),
            createDTO.price(),
            createDTO.costPrice(),
            createDTO.category(),
            imageUrl,
            createDTO.stockQuantity()
        );
        
        return createProduct(createWithImage);
    }

    @Transactional
    @NonNull
    public ProductDTO.Response updateProduct(@NonNull Long id, @NonNull ProductDTO.Update updateDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getName().equals(updateDTO.name()) 
                && productRepository.existsByName(updateDTO.name())) {
            throw new ProductAlreadyExistsException("Product already exists with name: " + updateDTO.name());
        }

        product.setName(updateDTO.name());
        product.setDescription(updateDTO.description());
        product.setPrice(updateDTO.price());
        product.setCostPrice(updateDTO.costPrice());
        product.setCategory(updateDTO.category());
        product.setImageUrl(updateDTO.imageUrl());
        if (updateDTO.stockQuantity() != null) {
            product.setStockQuantity(updateDTO.stockQuantity());
        }

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Transactional
    @NonNull
    public ProductDTO.Response updateStock(@NonNull Long id, @NonNull Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setStockQuantity(quantity);
        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Transactional
    @NonNull
    public ProductDTO.Response updateProduct(@NonNull Long id, @NonNull ProductDTO.Update updateDTO, MultipartFile imageFile) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveImage(imageFile);
        }
        
        ProductDTO.Update updateWithImage = new ProductDTO.Update(
            updateDTO.name(),
            updateDTO.description(),
            updateDTO.price(),
            updateDTO.costPrice(),
            updateDTO.category(),
            imageUrl != null ? imageUrl : updateDTO.imageUrl(),
            updateDTO.stockQuantity()
        );
        
        return updateProduct(id, updateWithImage);
    }

    @Transactional
    @NonNull
    public ProductDTO.Response adjustStock(@NonNull Long id, @NonNull Integer adjustment) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        int newQuantity = product.getStockQuantity() + adjustment;
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Insufficient stock. Current: " + product.getStockQuantity() + ", Requested: " + Math.abs(adjustment));
        }

        product.setStockQuantity(newQuantity);
        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Transactional
    @NonNull
    public ProductDTO.Response updateAvailability(@NonNull Long id, @NonNull Boolean isAvailable) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setIsAvailable(isAvailable);
        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(@NonNull Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @NonNull
    private ProductDTO.Response mapToResponse(@NonNull Product product) {
        return new ProductDTO.Response(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCostPrice(),
                product.getCategory(),
                product.getImageUrl(),
                product.getIsAvailable(),
                product.getStockQuantity()
        );
    }

    private String saveImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            return "/uploads/products/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }
}
