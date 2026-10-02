package com.healthtrackpro.service;

import com.healthtrackpro.model.ActivityLog;
import com.healthtrackpro.model.User;
import com.healthtrackpro.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public void log(User user, String activityType, String description) {
        ActivityLog log = ActivityLog.builder()
            .user(user)
            .activityType(activityType)
            .description(description)
            .build();
        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getUserActivityLogs(Long userId) {
        return activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getRecentActivityLogs(Long userId) {
        return activityLogRepository.findTop10ByUserIdOrderByTimestampDesc(userId);
    }
}
