package com.bakery.repository;

import com.bakery.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByIssueDateBetween(LocalDateTime start, LocalDateTime end);

    List<Issue> findByIssuedToContainingIgnoreCase(String issuedTo);

    List<Issue> findByCreatedByIdOrderByIssueDateDesc(Long userId);

    List<Issue> findTop10ByOrderByIssueDateDesc();

    @Query("SELECT i FROM Issue i WHERE i.issueDate >= :startDate ORDER BY i.issueDate DESC")
    List<Issue> findRecentIssues(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT i FROM Issue i WHERE i.issueDate BETWEEN :start AND :end ORDER BY i.issueDate DESC")
    List<Issue> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByIssueDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(ii.quantity * ii.unitCost) FROM IssueItem ii WHERE ii.issue.issueDate BETWEEN :start AND :end")
    java.math.BigDecimal getTotalIssueValue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
