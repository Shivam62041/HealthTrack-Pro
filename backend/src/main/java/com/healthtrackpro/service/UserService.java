package com.healthtrackpro.service;

import com.healthtrackpro.dto.request.ChangePasswordRequest;
import com.healthtrackpro.dto.request.UpdateProfileRequest;
import com.healthtrackpro.dto.response.UserProfileDto;
import com.healthtrackpro.exception.ResourceNotFoundException;
import com.healthtrackpro.exception.UnauthorizedException;
import com.healthtrackpro.model.BmiHistory;
import com.healthtrackpro.model.User;
import com.healthtrackpro.repository.BmiHistoryRepository;
import com.healthtrackpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BmiHistoryRepository bmiHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String email) {
        User user = getUserByEmail(email);
        Optional<BmiHistory> latestBmi = bmiHistoryRepository.findTopByUserIdOrderByCalculatedDateDesc(user.getId());
        return toProfileDto(user, latestBmi.orElse(null));
    }

    @Transactional
    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        user.setFullName(request.getFullName());
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setHeight(request.getHeight());
        user.setWeight(request.getWeight());
        userRepository.save(user);
        activityLogService.log(user, "PROFILE_UPDATE", "Profile updated");
        Optional<BmiHistory> latestBmi = bmiHistoryRepository.findTopByUserIdOrderByCalculatedDateDesc(user.getId());
        return toProfileDto(user, latestBmi.orElse(null));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        activityLogService.log(user, "PASSWORD_CHANGE", "Password changed successfully");
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private UserProfileDto toProfileDto(User user, BmiHistory bmiHistory) {
        return UserProfileDto.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .age(user.getAge())
            .gender(user.getGender())
            .height(user.getHeight())
            .weight(user.getWeight())
            .role(user.getRole())
            .isActive(user.getIsActive())
            .createdAt(user.getCreatedAt())
            .bmi(bmiHistory != null ? bmiHistory.getBmi() : null)
            .bmiCategory(bmiHistory != null ? bmiHistory.getCategory() : null)
            .build();
    }
}
