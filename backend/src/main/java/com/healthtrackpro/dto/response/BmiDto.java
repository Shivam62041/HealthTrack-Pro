package com.healthtrackpro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BmiDto {
    private Long id;
    private Double bmi;
    private String category;
    private Double weight;
    private Double height;
    private LocalDate calculatedDate;
}
