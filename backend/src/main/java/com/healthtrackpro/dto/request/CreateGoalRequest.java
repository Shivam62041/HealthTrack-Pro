package com.healthtrackpro.dto.request;

import com.healthtrackpro.model.enums.GoalType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateGoalRequest {
    @NotNull
    private GoalType goalType;
    @NotNull @DecimalMin("0.0")
    private Double targetValue;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
    private String description;
}
