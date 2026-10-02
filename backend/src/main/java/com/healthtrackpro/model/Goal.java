package com.healthtrackpro.model;

import com.healthtrackpro.model.enums.GoalType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalType goalType;

    @Column(nullable = false)
    private Double targetValue;

    @Builder.Default
    private Double currentProgress = 0.0;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Builder.Default
    private Boolean isAchieved = false;

    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public double getProgressPercentage() {
        if (targetValue == null || targetValue == 0) return 0.0;
        double pct = (currentProgress / targetValue) * 100.0;
        return Math.min(pct, 100.0);
    }
}
