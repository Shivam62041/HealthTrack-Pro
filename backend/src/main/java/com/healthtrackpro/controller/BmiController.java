package com.healthtrackpro.controller;

import com.healthtrackpro.dto.response.BmiDto;
import com.healthtrackpro.service.BmiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bmi")
@RequiredArgsConstructor
@Tag(name = "BMI", description = "BMI calculation and history tracking")
@SecurityRequirement(name = "bearerAuth")
public class BmiController {

    private final BmiService bmiService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate BMI from profile height/weight and save to history")
    public ResponseEntity<BmiDto> calculate(Authentication auth) {
        return ResponseEntity.ok(bmiService.calculateAndSaveBmi(auth.getName()));
    }

    @GetMapping("/history")
    @Operation(summary = "Get BMI history for the authenticated user")
    public ResponseEntity<List<BmiDto>> history(Authentication auth) {
        return ResponseEntity.ok(bmiService.getBmiHistory(auth.getName()));
    }
}
