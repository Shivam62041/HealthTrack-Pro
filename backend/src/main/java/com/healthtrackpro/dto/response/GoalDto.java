package com.healthtrackpro.dto.response;

import com.healthtrackpro.model.enums.GoalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GoalDto {
    private Long id;
    private GoalType goalType;
    private Double targetValue;
    private Double currentProgress;
    private Double progressPercentage;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isAchieved;
    private String description;
}
