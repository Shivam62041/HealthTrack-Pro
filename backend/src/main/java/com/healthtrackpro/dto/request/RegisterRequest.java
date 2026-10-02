package com.healthtrackpro.dto.request;

import com.healthtrackpro.model.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = ".*[A-Z].*", message = "Password must contain at least one uppercase letter")
    private String password;

    @Min(value = 1) @Max(value = 120)
    private Integer age;

    private Gender gender;

    @DecimalMin("50.0") @DecimalMax("300.0")
    private Double height;

    @DecimalMin("20.0") @DecimalMax("500.0")
    private Double weight;
}
