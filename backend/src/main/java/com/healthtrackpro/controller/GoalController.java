package com.healthtrackpro.controller;

import com.healthtrackpro.dto.request.CreateGoalRequest;
import com.healthtrackpro.dto.response.GoalDto;
import com.healthtrackpro.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@Tag(name = "Goals", description = "Health goal management and progress tracking")
@SecurityRequirement(name = "bearerAuth")
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    @Operation(summary = "Get all goals for the authenticated user")
    public ResponseEntity<List<GoalDto>> getAll(Authentication auth) {
        return ResponseEntity.ok(goalService.getAllGoals(auth.getName()));
    }

    @PostMapping
    @Operation(summary = "Create a new health goal")
    public ResponseEntity<GoalDto> create(
            @Valid @RequestBody CreateGoalRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.createGoal(auth.getName(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing goal")
    public ResponseEntity<GoalDto> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateGoalRequest request,
            Authentication auth) {
        return ResponseEntity.ok(goalService.updateGoal(auth.getName(), id, request));
    }

    @PatchMapping("/{id}/progress")
    @Operation(summary = "Update goal progress value")
    public ResponseEntity<GoalDto> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body,
            Authentication auth) {
        return ResponseEntity.ok(goalService.updateProgress(auth.getName(), id, body.get("progress")));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a goal")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        goalService.deleteGoal(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
