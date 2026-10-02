package com.healthtrackpro.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateMetricsRequest {
    @NotNull(message = "Date is required")
    private LocalDate date;
    @Min(0) @Max(100000)
    private Integer steps;
    @DecimalMin("0.0") @DecimalMax("10000.0")
    private Double caloriesBurned;
    @DecimalMin("0.0") @DecimalMax("20.0")
    private Double waterIntake;
    @DecimalMin("0.0") @DecimalMax("24.0")
    private Double sleepHours;
    @Min(0) @Max(300)
    private Integer heartRate;
    @DecimalMin("20.0") @DecimalMax("500.0")
    private Double weight;
    private String notes;
}
