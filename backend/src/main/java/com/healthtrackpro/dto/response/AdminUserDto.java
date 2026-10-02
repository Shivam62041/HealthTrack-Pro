package com.healthtrackpro.dto.response;

import com.healthtrackpro.model.enums.Gender;
import com.healthtrackpro.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminUserDto {
    private Long id;
    private String fullName;
    private String email;
    private Integer age;
    private Gender gender;
    private UserRole role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
