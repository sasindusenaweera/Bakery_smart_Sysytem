package com.bakery.controller;

import com.bakery.dto.IssueDTO;
import com.bakery.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor

public class IssueController {

    private final IssueService issueService;

    @GetMapping
    public ResponseEntity<List<IssueDTO.IssueResponse>> getAllIssues() {
        List<IssueDTO.IssueResponse> issues = issueService.getAllIssues();
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueDTO.IssueResponse> getIssueById(@PathVariable Long id) {
        IssueDTO.IssueResponse issue = issueService.getIssueById(id);
        return ResponseEntity.ok(issue);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<IssueDTO.IssueResponse>> filterIssues(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String issuedTo) {
        
        if (issuedTo != null && !issuedTo.isBlank()) {
            List<IssueDTO.IssueResponse> issues = issueService.getIssuesByIssuedTo(issuedTo);
            return ResponseEntity.ok(issues);
        }
        
        if (startDate != null || endDate != null) {
            List<IssueDTO.IssueResponse> issues = issueService.getIssuesByDateRange(startDate, endDate);
            return ResponseEntity.ok(issues);
        }
        
        List<IssueDTO.IssueResponse> issues = issueService.getAllIssues();
        return ResponseEntity.ok(issues);
    }

    @PostMapping
    public ResponseEntity<IssueDTO.IssueResponse> createIssue(
            @RequestBody IssueDTO.IssueCreate createDTO,
            @RequestParam(required = false) Long userId) {
        IssueDTO.IssueResponse issue = issueService.createIssue(createDTO, userId);
        return new ResponseEntity<>(issue, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueDTO.IssueResponse> updateIssue(
            @PathVariable Long id,
            @RequestBody IssueDTO.IssueUpdate updateDTO) {
        IssueDTO.IssueResponse issue = issueService.updateIssue(id, updateDTO);
        return ResponseEntity.ok(issue);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}
