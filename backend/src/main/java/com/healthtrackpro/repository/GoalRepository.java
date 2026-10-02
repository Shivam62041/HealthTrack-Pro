package com.healthtrackpro.repository;

import com.healthtrackpro.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(g) FROM Goal g WHERE g.isAchieved = true")
    long countAchievedGoals();

    @Query("SELECT COUNT(g) FROM Goal g")
    long countTotalGoals();

    @Query("SELECT g FROM Goal g WHERE g.user.id = :userId AND g.isAchieved = false ORDER BY g.endDate ASC")
    List<Goal> findActiveGoalsByUserId(@Param("userId") Long userId);
}
