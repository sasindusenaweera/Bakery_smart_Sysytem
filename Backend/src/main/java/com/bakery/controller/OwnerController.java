package com.bakery.controller;

import com.bakery.dto.OwnerDTO;
import com.bakery.service.OwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor

public class OwnerController {

    private final OwnerService ownerService;

    @GetMapping("/dashboard")
    public ResponseEntity<OwnerDTO.DashboardSummary> getDashboard() {
        OwnerDTO.DashboardSummary summary = ownerService.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }
}
