package com.healthtrackpro.service;

import com.healthtrackpro.dto.request.CreateGoalRequest;
import com.healthtrackpro.dto.response.GoalDto;
import com.healthtrackpro.exception.ResourceNotFoundException;
import com.healthtrackpro.exception.UnauthorizedException;
import com.healthtrackpro.model.Goal;
import com.healthtrackpro.model.User;
import com.healthtrackpro.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserService userService;
    private final ActivityLogService activityLogService;

    @Transactional
    public GoalDto createGoal(String email, CreateGoalRequest request) {
        User user = userService.getUserByEmail(email);

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Goal goal = Goal.builder()
            .user(user)
            .goalType(request.getGoalType())
            .targetValue(request.getTargetValue())
            .currentProgress(0.0)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .description(request.getDescription())
            .isAchieved(false)
            .build();

        Goal saved = goalRepository.save(goal);
        activityLogService.log(user, "GOAL_CREATE", "Goal created: " + request.getGoalType());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<GoalDto> getAllGoals(String email) {
        User user = userService.getUserByEmail(email);
        return goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GoalDto> getActiveGoals(String email) {
        User user = userService.getUserByEmail(email);
        return goalRepository.findActiveGoalsByUserId(user.getId())
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public GoalDto updateGoal(String email, Long goalId, CreateGoalRequest request) {
        User user = userService.getUserByEmail(email);
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new com.healthtrackpro.exception.UnauthorizedException("Access denied");
        }
        goal.setGoalType(request.getGoalType());
        goal.setTargetValue(request.getTargetValue());
        goal.setStartDate(request.getStartDate());
        goal.setEndDate(request.getEndDate());
        goal.setDescription(request.getDescription());
        return toDto(goalRepository.save(goal));
    }

    @Transactional
    public GoalDto updateProgress(String email, Long goalId, Double progress) {
        User user = userService.getUserByEmail(email);
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        goal.setCurrentProgress(progress);
        if (progress >= goal.getTargetValue()) {
            goal.setIsAchieved(true);
            activityLogService.log(user, "GOAL_ACHIEVED", "Goal achieved: " + goal.getGoalType());
        }

        return toDto(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(String email, Long goalId) {
        User user = userService.getUserByEmail(email);
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        goalRepository.delete(goal);
        activityLogService.log(user, "GOAL_DELETE", "Deleted goal id: " + goalId);
    }

    private GoalDto toDto(Goal goal) {
        return GoalDto.builder()
            .id(goal.getId())
            .goalType(goal.getGoalType())
            .targetValue(goal.getTargetValue())
            .currentProgress(goal.getCurrentProgress())
            .progressPercentage(goal.getProgressPercentage())
            .startDate(goal.getStartDate())
            .endDate(goal.getEndDate())
            .isAchieved(goal.getIsAchieved())
            .description(goal.getDescription())
            .build();
    }
}
