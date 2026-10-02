package com.healthtrackpro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HealthMetricsDto {
    private Long id;
    private LocalDate date;
    private Integer steps;
    private Double caloriesBurned;
    private Double waterIntake;
    private Double sleepHours;
    private Integer heartRate;
    private Double weight;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
