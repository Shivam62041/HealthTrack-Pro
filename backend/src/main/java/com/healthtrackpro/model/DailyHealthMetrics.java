package com.healthtrackpro.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_health_metrics",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyHealthMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Builder.Default private Integer steps = 0;
    @Builder.Default private Double caloriesBurned = 0.0;
    @Builder.Default private Double waterIntake = 0.0;
    @Builder.Default private Double sleepHours = 0.0;
    @Builder.Default private Integer heartRate = 0;
    private Double weight;
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
