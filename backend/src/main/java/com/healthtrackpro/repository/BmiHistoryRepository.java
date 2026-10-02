package com.healthtrackpro.repository;

import com.healthtrackpro.model.BmiHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BmiHistoryRepository extends JpaRepository<BmiHistory, Long> {
    List<BmiHistory> findByUserIdOrderByCalculatedDateDesc(Long userId);
    Optional<BmiHistory> findTopByUserIdOrderByCalculatedDateDesc(Long userId);
}
