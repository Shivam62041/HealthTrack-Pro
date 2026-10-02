package com.healthtrackpro.dto.request;

import com.healthtrackpro.model.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String fullName;
    @Min(1) @Max(120)
    private Integer age;
    private Gender gender;
    @DecimalMin("50.0") @DecimalMax("300.0")
    private Double height;
    @DecimalMin("20.0") @DecimalMax("500.0")
    private Double weight;
}
