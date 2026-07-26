package com.bakery.repository;

import com.bakery.entity.Production;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductionRepository extends JpaRepository<Production, Long> {

    List<Production> findByProductionDateBetween(LocalDateTime start, LocalDateTime end);

    List<Production> findTop10ByOrderByProductionDateDesc();

    @Query("SELECT p FROM Production p WHERE p.productionDate >= :startDate ORDER BY p.productionDate DESC")
    List<Production> findRecentProductions(@Param("startDate") LocalDateTime startDate);

    long countByProductionDateBetween(LocalDateTime start, LocalDateTime end);

    List<Production> findByCreatedByIdOrderByProductionDateDesc(Long userId);

    @Query("SELECT p FROM Production p WHERE p.productionDate BETWEEN :start AND :end ORDER BY p.productionDate DESC")
    List<Production> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(pi.quantity * pi.productCost) FROM ProductionItem pi WHERE pi.production.productionDate BETWEEN :start AND :end")
    BigDecimal getTotalProductionCost(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(pi.quantity) FROM ProductionItem pi WHERE pi.production.productionDate BETWEEN :start AND :end")
    Long getTotalItemsProduced(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(pi.wasteQuantity) FROM ProductionItem pi WHERE pi.production.productionDate BETWEEN :start AND :end")
    Long getTotalWaste(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT p.id, COUNT(pi) FROM Production p JOIN p.items pi GROUP BY p.id ORDER BY COUNT(pi) DESC")
    List<Object[]> findProductionWithMostItems();

    @Query("SELECT COUNT(DISTINCT p) FROM Production p WHERE p.productionDate BETWEEN :start AND :end")
    Long countByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
