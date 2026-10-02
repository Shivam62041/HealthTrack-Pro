package com.healthtrackpro.controller;

import com.healthtrackpro.dto.request.CreateMetricsRequest;
import com.healthtrackpro.dto.response.HealthMetricsDto;
import com.healthtrackpro.service.HealthMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@Tag(name = "Health Metrics", description = "Daily health metrics CRUD operations")
@SecurityRequirement(name = "bearerAuth")
public class HealthMetricsController {

    private final HealthMetricsService metricsService;

    @GetMapping
    @Operation(summary = "Get all user health metrics, optionally filtered by date range")
    public ResponseEntity<List<HealthMetricsDto>> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            Authentication auth) {
        if (start != null && end != null) {
            return ResponseEntity.ok(metricsService.getMetricsByDateRange(auth.getName(), start, end));
        }
        return ResponseEntity.ok(metricsService.getAllMetrics(auth.getName()));
    }

    @PostMapping
    @Operation(summary = "Add or update daily health metrics (upsert by date)")
    public ResponseEntity<HealthMetricsDto> create(
            @Valid @RequestBody CreateMetricsRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(metricsService.createOrUpdateMetrics(auth.getName(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing health metrics entry (upsert by date)")
    public ResponseEntity<HealthMetricsDto> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateMetricsRequest request,
            Authentication auth) {
        return ResponseEntity.ok(metricsService.createOrUpdateMetrics(auth.getName(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a health metrics entry")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        metricsService.deleteMetrics(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}

