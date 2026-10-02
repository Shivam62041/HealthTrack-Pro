package com.healthtrackpro.service;

import com.healthtrackpro.dto.response.BmiDto;
import com.healthtrackpro.exception.ResourceNotFoundException;
import com.healthtrackpro.model.BmiHistory;
import com.healthtrackpro.model.User;
import com.healthtrackpro.repository.BmiHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BmiService {

    private final BmiHistoryRepository bmiHistoryRepository;
    private final UserService userService;
    private final ActivityLogService activityLogService;

    /**
     * Calculates BMI for the authenticated user using their stored height and weight,
     * saves to history and returns result.
     */
    @Transactional
    public BmiDto calculateAndSaveBmi(String email) {
        User user = userService.getUserByEmail(email);

        if (user.getHeight() == null || user.getWeight() == null) {
            throw new IllegalArgumentException("Height and weight must be set in your profile to calculate BMI");
        }

        return calculateAndSave(user, user.getWeight(), user.getHeight());
    }

    /**
     * Calculates BMI for given weight and height (without changing user profile),
     * optionally persists to history.
     */
    @Transactional
    public BmiDto calculateBmi(String email, Double weight, Double height) {
        User user = userService.getUserByEmail(email);
        return calculateAndSave(user, weight, height);
    }

    private BmiDto calculateAndSave(User user, Double weight, Double height) {
        // BMI = weight(kg) / (height(m))^2
        double heightM = height / 100.0;
        double bmiValue = weight / (heightM * heightM);
        bmiValue = Math.round(bmiValue * 100.0) / 100.0;
        String category = getBmiCategory(bmiValue);

        BmiHistory history = BmiHistory.builder()
            .user(user)
            .bmi(bmiValue)
            .category(category)
            .weight(weight)
            .height(height)
            .calculatedDate(LocalDate.now())
            .build();

        BmiHistory saved = bmiHistoryRepository.save(history);
        activityLogService.log(user, "BMI_CALCULATE", String.format("BMI calculated: %.2f (%s)", bmiValue, category));
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BmiDto> getBmiHistory(String email) {
        User user = userService.getUserByEmail(email);
        return bmiHistoryRepository.findByUserIdOrderByCalculatedDateDesc(user.getId())
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BmiDto getLatestBmi(String email) {
        User user = userService.getUserByEmail(email);
        return bmiHistoryRepository.findTopByUserIdOrderByCalculatedDateDesc(user.getId())
            .map(this::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("No BMI history found for user"));
    }

    public static String getBmiCategory(double bmi) {
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25.0) return "Normal weight";
        if (bmi < 30.0) return "Overweight";
        return "Obese";
    }

    private BmiDto toDto(BmiHistory bmi) {
        return BmiDto.builder()
            .id(bmi.getId())
            .bmi(bmi.getBmi())
            .category(bmi.getCategory())
            .weight(bmi.getWeight())
            .height(bmi.getHeight())
            .calculatedDate(bmi.getCalculatedDate())
            .build();
    }
}
