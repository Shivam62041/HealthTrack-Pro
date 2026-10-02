package com.healthtrackpro.service;

import com.healthtrackpro.dto.response.AdminUserDto;
import com.healthtrackpro.exception.ResourceNotFoundException;
import com.healthtrackpro.model.User;
import com.healthtrackpro.model.enums.UserRole;
import com.healthtrackpro.repository.GoalRepository;
import com.healthtrackpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public Page<AdminUserDto> getAllUsers(String search, Pageable pageable) {
        return userRepository.searchUsers(search, pageable).map(this::toAdminDto);
    }

    @Transactional(readOnly = true)
    public AdminUserDto getUserById(Long id) {
        return toAdminDto(userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id)));
    }

    @Transactional
    public AdminUserDto setUserActive(Long id, boolean active) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setIsActive(active);
        userRepository.save(user);
        String action = active ? "ADMIN_USER_ACTIVATED" : "ADMIN_USER_DEACTIVATED";
        activityLogService.log(user, action, active ? "User account activated by admin" : "User account disabled by admin");
        return toAdminDto(user);
    }

    @Transactional
    public AdminUserDto changeUserRole(Long id, UserRole newRole) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setRole(newRole);
        userRepository.save(user);
        activityLogService.log(user, "ADMIN_ROLE_CHANGE", "Role changed to " + newRole);
        return toAdminDto(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByIsActiveTrue());
        stats.put("adminUsers", userRepository.countByRole(UserRole.ADMIN));
        stats.put("totalGoals", goalRepository.countTotalGoals());
        stats.put("achievedGoals", goalRepository.countAchievedGoals());

        long activeToday = userRepository.countDistinctLoginsSince(
            LocalDateTime.now().minusHours(24)
        );
        stats.put("activeToday", activeToday);
        stats.put("dailyLogins", activeToday);

        long totalGoals = goalRepository.countTotalGoals();
        long achievedGoals = goalRepository.countAchievedGoals();
        double goalAchievementRate = totalGoals > 0 ? (double) achievedGoals / totalGoals * 100.0 : 0.0;
        stats.put("goalAchievementRate", Math.round(goalAchievementRate * 10.0) / 10.0);
        stats.put("goalCompletionRate", Math.round(goalAchievementRate * 10.0) / 10.0);

        return stats;
    }

    private AdminUserDto toAdminDto(User user) {
        return AdminUserDto.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .age(user.getAge())
            .gender(user.getGender())
            .role(user.getRole())
            .isActive(user.getIsActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
