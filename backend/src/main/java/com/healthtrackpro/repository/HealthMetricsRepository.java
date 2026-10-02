package com.healthtrackpro.repository;

import com.healthtrackpro.model.DailyHealthMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthMetricsRepository extends JpaRepository<DailyHealthMetrics, Long> {
    List<DailyHealthMetrics> findByUserIdOrderByDateDesc(Long userId);
    Optional<DailyHealthMetrics> findByUserIdAndDate(Long userId, LocalDate date);
    boolean existsByUserIdAndDate(Long userId, LocalDate date);

    @Query("SELECT m FROM DailyHealthMetrics m WHERE m.user.id = :userId AND m.date BETWEEN :start AND :end ORDER BY m.date ASC")
    List<DailyHealthMetrics> findByUserIdAndDateBetween(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    @Query("SELECT m FROM DailyHealthMetrics m WHERE m.user.id = :userId ORDER BY m.date DESC")
    List<DailyHealthMetrics> findRecentByUserId(@Param("userId") Long userId);
}
