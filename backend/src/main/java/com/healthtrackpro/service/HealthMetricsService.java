package com.healthtrackpro.service;

import com.healthtrackpro.dto.request.CreateMetricsRequest;
import com.healthtrackpro.dto.response.HealthMetricsDto;
import com.healthtrackpro.exception.ResourceNotFoundException;
import com.healthtrackpro.model.DailyHealthMetrics;
import com.healthtrackpro.model.User;
import com.healthtrackpro.repository.HealthMetricsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthMetricsService {

    private final HealthMetricsRepository metricsRepository;
    private final UserService userService;
    private final ActivityLogService activityLogService;

    @Transactional
    public HealthMetricsDto createOrUpdateMetrics(String email, CreateMetricsRequest request) {
        User user = userService.getUserByEmail(email);

        DailyHealthMetrics metrics = metricsRepository.findByUserIdAndDate(user.getId(), request.getDate())
            .orElse(DailyHealthMetrics.builder().user(user).date(request.getDate()).build());

        applyRequest(metrics, request);
        DailyHealthMetrics saved = metricsRepository.save(metrics);
        activityLogService.log(user, "METRICS_UPDATE", "Health metrics updated for " + request.getDate());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<HealthMetricsDto> getAllMetrics(String email) {
        User user = userService.getUserByEmail(email);
        return metricsRepository.findByUserIdOrderByDateDesc(user.getId())
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HealthMetricsDto getMetricsByDate(String email, LocalDate date) {
        User user = userService.getUserByEmail(email);
        DailyHealthMetrics metrics = metricsRepository.findByUserIdAndDate(user.getId(), date)
            .orElseThrow(() -> new ResourceNotFoundException("No metrics found for date: " + date));
        return toDto(metrics);
    }

    @Transactional(readOnly = true)
    public List<HealthMetricsDto> getMetricsByDateRange(String email, LocalDate start, LocalDate end) {
        User user = userService.getUserByEmail(email);
        return metricsRepository.findByUserIdAndDateBetween(user.getId(), start, end)
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteMetrics(String email, Long metricsId) {
        User user = userService.getUserByEmail(email);
        DailyHealthMetrics metrics = metricsRepository.findById(metricsId)
            .orElseThrow(() -> new ResourceNotFoundException("Metrics", metricsId));
        if (!metrics.getUser().getId().equals(user.getId())) {
            throw new com.healthtrackpro.exception.UnauthorizedException("Access denied");
        }
        metricsRepository.delete(metrics);
        activityLogService.log(user, "METRICS_DELETE", "Deleted metrics id: " + metricsId);
    }

    @Transactional(readOnly = true)
    public HealthMetricsDto getTodayMetrics(String email) {
        User user = userService.getUserByEmail(email);
        return metricsRepository.findByUserIdAndDate(user.getId(), LocalDate.now())
            .map(this::toDto)
            .orElse(null);
    }

    private void applyRequest(DailyHealthMetrics metrics, CreateMetricsRequest request) {
        if (request.getSteps() != null) metrics.setSteps(request.getSteps());
        if (request.getCaloriesBurned() != null) metrics.setCaloriesBurned(request.getCaloriesBurned());
        if (request.getWaterIntake() != null) metrics.setWaterIntake(request.getWaterIntake());
        if (request.getSleepHours() != null) metrics.setSleepHours(request.getSleepHours());
        if (request.getHeartRate() != null) metrics.setHeartRate(request.getHeartRate());
        if (request.getWeight() != null) metrics.setWeight(request.getWeight());
        if (request.getNotes() != null) metrics.setNotes(request.getNotes());
    }

    public HealthMetricsDto toDto(DailyHealthMetrics m) {
        return HealthMetricsDto.builder()
            .id(m.getId())
            .date(m.getDate())
            .steps(m.getSteps())
            .caloriesBurned(m.getCaloriesBurned())
            .waterIntake(m.getWaterIntake())
            .sleepHours(m.getSleepHours())
            .heartRate(m.getHeartRate())
            .weight(m.getWeight())
            .notes(m.getNotes())
            .createdAt(m.getCreatedAt())
            .updatedAt(m.getUpdatedAt())
            .build();
    }
}
