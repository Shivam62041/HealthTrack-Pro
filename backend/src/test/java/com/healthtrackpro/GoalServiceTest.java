package com.healthtrackpro;

import com.healthtrackpro.dto.request.CreateGoalRequest;
import com.healthtrackpro.dto.response.GoalDto;
import com.healthtrackpro.model.Goal;
import com.healthtrackpro.model.User;
import com.healthtrackpro.model.enums.GoalType;
import com.healthtrackpro.repository.GoalRepository;
import com.healthtrackpro.service.ActivityLogService;
import com.healthtrackpro.service.GoalService;
import com.healthtrackpro.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;
    @Mock
    private UserService userService;
    @Mock
    private ActivityLogService activityLogService;
    @InjectMocks
    private GoalService goalService;

    private User testUser;

    @BeforeEach
    void setup() {
        testUser = User.builder().id(1L).email("test@test.com").build();
    }

    @Test
    void shouldCreateGoalSuccessfully() {
        CreateGoalRequest request = new CreateGoalRequest();
        request.setGoalType(GoalType.STEPS);
        request.setTargetValue(10000.0);
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(30));
        request.setDescription("Walk 10k steps daily");

        Goal savedGoal = Goal.builder()
                .id(1L).user(testUser).goalType(GoalType.STEPS)
                .targetValue(10000.0).currentProgress(0.0)
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusDays(30))
                .isAchieved(false).build();

        when(userService.getUserByEmail(any())).thenReturn(testUser);
        when(goalRepository.save(any())).thenReturn(savedGoal);
        doNothing().when(activityLogService).log(any(), any(), any());

        GoalDto result = goalService.createGoal("test@test.com", request);

        assertNotNull(result);
        assertEquals(GoalType.STEPS, result.getGoalType());
        assertEquals(10000.0, result.getTargetValue());
        assertEquals(0.0, result.getProgressPercentage());
        assertFalse(result.getIsAchieved());
    }

    @Test
    void progressPercentageShouldCalculateCorrectly() {
        Goal goal = Goal.builder()
                .id(1L).user(testUser).goalType(GoalType.STEPS)
                .targetValue(10000.0).currentProgress(7500.0)
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusDays(30))
                .isAchieved(false).build();

        assertEquals(75.0, goal.getProgressPercentage(), 0.001);
    }

    @Test
    void progressShouldNotExceed100Percent() {
        Goal goal = Goal.builder()
                .id(1L).user(testUser).goalType(GoalType.STEPS)
                .targetValue(10000.0).currentProgress(15000.0)
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusDays(30))
                .isAchieved(true).build();

        assertEquals(100.0, goal.getProgressPercentage(), 0.001);
    }

    @Test
    void shouldMarkGoalAsAchievedWhenProgressMeetsTarget() {
        Goal goal = Goal.builder()
                .id(1L).user(testUser).goalType(GoalType.WATER_INTAKE)
                .targetValue(3.0).currentProgress(0.0)
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusDays(30))
                .isAchieved(false).build();

        when(userService.getUserByEmail(any())).thenReturn(testUser);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        GoalDto result = goalService.updateProgress("test@test.com", 1L, 3.0);

        assertTrue(result.getIsAchieved());
        assertEquals(100.0, result.getProgressPercentage(), 0.001);
    }
}
