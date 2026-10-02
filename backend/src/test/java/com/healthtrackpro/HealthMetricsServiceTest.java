package com.healthtrackpro;

import com.healthtrackpro.dto.request.CreateMetricsRequest;
import com.healthtrackpro.dto.response.HealthMetricsDto;
import com.healthtrackpro.model.DailyHealthMetrics;
import com.healthtrackpro.model.User;
import com.healthtrackpro.repository.HealthMetricsRepository;
import com.healthtrackpro.service.ActivityLogService;
import com.healthtrackpro.service.HealthMetricsService;
import com.healthtrackpro.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HealthMetricsServiceTest {

    @Mock
    private HealthMetricsRepository metricsRepository;
    @Mock
    private UserService userService;
    @Mock
    private ActivityLogService activityLogService;
    @InjectMocks
    private HealthMetricsService metricsService;

    private User testUser;

    @BeforeEach
    void setup() {
        testUser = User.builder().id(1L).email("test@test.com").fullName("Test User").build();
    }

    @Test
    void shouldCreateMetricsSuccessfully() {
        CreateMetricsRequest request = new CreateMetricsRequest();
        request.setDate(LocalDate.now());
        request.setSteps(8000);
        request.setCaloriesBurned(400.0);
        request.setWaterIntake(2.0);
        request.setSleepHours(7.5);
        request.setHeartRate(72);

        DailyHealthMetrics savedMetrics = DailyHealthMetrics.builder()
                .id(1L).user(testUser).date(LocalDate.now())
                .steps(8000).caloriesBurned(400.0)
                .waterIntake(2.0).sleepHours(7.5).heartRate(72)
                .build();

        when(userService.getUserByEmail("test@test.com")).thenReturn(testUser);
        when(metricsRepository.findByUserIdAndDate(1L, LocalDate.now())).thenReturn(Optional.empty());
        when(metricsRepository.save(any())).thenReturn(savedMetrics);
        doNothing().when(activityLogService).log(any(), any(), any());

        HealthMetricsDto result = metricsService.createOrUpdateMetrics("test@test.com", request);

        assertNotNull(result);
        assertEquals(8000, result.getSteps());
        assertEquals(400.0, result.getCaloriesBurned());
        verify(metricsRepository).save(any());
    }

    @Test
    void shouldUpdateExistingMetricsForSameDate() {
        CreateMetricsRequest request = new CreateMetricsRequest();
        request.setDate(LocalDate.now());
        request.setSteps(12000);

        DailyHealthMetrics existing = DailyHealthMetrics.builder()
                .id(1L).user(testUser).date(LocalDate.now()).steps(5000).build();
        DailyHealthMetrics updated = DailyHealthMetrics.builder()
                .id(1L).user(testUser).date(LocalDate.now()).steps(12000).build();

        when(userService.getUserByEmail(any())).thenReturn(testUser);
        when(metricsRepository.findByUserIdAndDate(1L, LocalDate.now())).thenReturn(Optional.of(existing));
        when(metricsRepository.save(any())).thenReturn(updated);
        doNothing().when(activityLogService).log(any(), any(), any());

        HealthMetricsDto result = metricsService.createOrUpdateMetrics("test@test.com", request);
        assertEquals(12000, result.getSteps());
    }

    @Test
    void shouldReturnAllMetricsForUser() {
        DailyHealthMetrics m = DailyHealthMetrics.builder()
                .id(1L).user(testUser).date(LocalDate.now()).steps(5000).build();

        when(userService.getUserByEmail(any())).thenReturn(testUser);
        when(metricsRepository.findByUserIdOrderByDateDesc(1L)).thenReturn(List.of(m));

        List<HealthMetricsDto> results = metricsService.getAllMetrics("test@test.com");
        assertEquals(1, results.size());
        assertEquals(5000, results.get(0).getSteps());
    }

    @Test
    void shouldReturnEmptyListWhenNoMetrics() {
        when(userService.getUserByEmail(any())).thenReturn(testUser);
        when(metricsRepository.findByUserIdOrderByDateDesc(1L)).thenReturn(List.of());

        List<HealthMetricsDto> results = metricsService.getAllMetrics("test@test.com");
        assertTrue(results.isEmpty());
    }
}
