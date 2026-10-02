package com.healthtrackpro.repository;

import com.healthtrackpro.model.User;
import com.healthtrackpro.model.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(UserRole role);
    long countByIsActiveTrue();

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.activityType = 'LOGIN' AND a.timestamp >= :since")
    long countDistinctLoginsSince(@Param("since") LocalDateTime since);

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);
}
