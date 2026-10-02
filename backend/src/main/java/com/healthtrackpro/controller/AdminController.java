package com.healthtrackpro.controller;

import com.healthtrackpro.dto.response.AdminUserDto;
import com.healthtrackpro.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin dashboard — user management and platform statistics")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    @Operation(summary = "List all users with optional search filter and pagination")
    public ResponseEntity<Page<AdminUserDto>> getUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(search, pageable));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get a specific user by ID")
    public ResponseEntity<AdminUserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PatchMapping("/users/{id}/disable")
    @Operation(summary = "Disable a user account")
    public ResponseEntity<AdminUserDto> disableUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.setUserActive(id, false));
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Reactivate a disabled user account")
    public ResponseEntity<AdminUserDto> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.setUserActive(id, true));
    }
}
