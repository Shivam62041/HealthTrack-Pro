-- ============================================================
-- HealthTrack Pro — MySQL 8 Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS healthtrack_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE healthtrack_db;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100)        NOT NULL,
    email         VARCHAR(150)        NOT NULL UNIQUE,
    password      VARCHAR(255)        NOT NULL,
    age           INT,
    gender        ENUM('MALE','FEMALE','OTHER'),
    height        DOUBLE COMMENT 'in centimeters',
    weight        DOUBLE COMMENT 'in kilograms',
    role          ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role  (role)
) ENGINE=InnoDB;

-- ============================================================
-- Table: daily_health_metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_health_metrics (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT         NOT NULL,
    date             DATE           NOT NULL,
    steps            INT            DEFAULT 0,
    calories_burned  DOUBLE         DEFAULT 0.0,
    water_intake     DOUBLE         DEFAULT 0.0 COMMENT 'in liters',
    sleep_hours      DOUBLE         DEFAULT 0.0,
    heart_rate       INT            DEFAULT 0 COMMENT 'bpm',
    weight           DOUBLE         DEFAULT NULL COMMENT 'kg — daily weigh-in',
    notes            TEXT,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_metrics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_date (user_id, date),
    INDEX idx_metrics_date (date),
    INDEX idx_metrics_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- Table: goals
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT         NOT NULL,
    goal_type        ENUM(
        'STEPS','CALORIES_BURNED','WATER_INTAKE',
        'SLEEP_HOURS','WEIGHT_LOSS','WEIGHT_GAIN','HEART_RATE'
    )                               NOT NULL,
    target_value     DOUBLE         NOT NULL,
    current_progress DOUBLE         NOT NULL DEFAULT 0.0,
    start_date       DATE           NOT NULL,
    end_date         DATE           NOT NULL,
    is_achieved      BOOLEAN        NOT NULL DEFAULT FALSE,
    description      VARCHAR(500),
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goals_user_id (user_id),
    INDEX idx_goals_dates (start_date, end_date)
) ENGINE=InnoDB;

-- ============================================================
-- Table: bmi_history
-- ============================================================
CREATE TABLE IF NOT EXISTS bmi_history (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT         NOT NULL,
    bmi              DOUBLE         NOT NULL,
    category         VARCHAR(30)    NOT NULL COMMENT 'Underweight/Normal/Overweight/Obese',
    weight           DOUBLE         NOT NULL COMMENT 'kg at time of calculation',
    height           DOUBLE         NOT NULL COMMENT 'cm at time of calculation',
    calculated_date  DATE           NOT NULL,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bmi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bmi_user_id (user_id),
    INDEX idx_bmi_date (calculated_date)
) ENGINE=InnoDB;

-- ============================================================
-- Table: activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT         NOT NULL,
    activity_type    VARCHAR(100)   NOT NULL,
    description      VARCHAR(500),
    ip_address       VARCHAR(45),
    timestamp        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity_user_id (user_id),
    INDEX idx_activity_timestamp (timestamp)
) ENGINE=InnoDB;

-- ============================================================
-- Seed Data — Admin + Sample Users
-- ============================================================

-- Admin user (password: Admin@123)
INSERT INTO users (full_name, email, password, age, gender, height, weight, role, is_active)
VALUES (
    'System Admin',
    'admin@healthtrackpro.com',
    '$2a$12$LMbkRa1aA0IvFGPdvxvVv.QfKbV3vVQ8FJBt3pR.bQR2iOZZ9JNHG',
    30, 'MALE', 175.0, 70.0, 'ADMIN', TRUE
);

-- Sample user 1 (password: User@123)
INSERT INTO users (full_name, email, password, age, gender, height, weight, role, is_active)
VALUES (
    'Alice Johnson',
    'alice@example.com',
    '$2a$12$X9XZkzQHV1OqK0JxOl2wbO5VDjnGbT8P7VQK1O2Z9JNHG3LBKR2i',
    28, 'FEMALE', 163.0, 58.0, 'USER', TRUE
);

-- Sample user 2 (password: User@123)
INSERT INTO users (full_name, email, password, age, gender, height, weight, role, is_active)
VALUES (
    'Bob Smith',
    'bob@example.com',
    '$2a$12$X9XZkzQHV1OqK0JxOl2wbO5VDjnGbT8P7VQK1O2Z9JNHG3LBKR2i',
    35, 'MALE', 178.0, 82.0, 'USER', TRUE
);

-- Sample health metrics for alice (user_id=2)
INSERT INTO daily_health_metrics (user_id, date, steps, calories_burned, water_intake, sleep_hours, heart_rate, weight)
VALUES
    (2, CURDATE() - INTERVAL 6 DAY, 8234,  420.5, 2.1, 7.5, 72, 58.2),
    (2, CURDATE() - INTERVAL 5 DAY, 9512,  480.0, 2.3, 6.8, 74, 58.0),
    (2, CURDATE() - INTERVAL 4 DAY, 10234, 510.2, 2.8, 8.0, 70, 57.9),
    (2, CURDATE() - INTERVAL 3 DAY, 7654,  390.0, 2.0, 7.2, 76, 58.1),
    (2, CURDATE() - INTERVAL 2 DAY, 11023, 545.6, 3.0, 8.5, 68, 57.8),
    (2, CURDATE() - INTERVAL 1 DAY, 9876,  498.3, 2.5, 7.8, 71, 57.7),
    (2, CURDATE(),                  6500,  320.0, 1.8, 0.0, 73, 57.6);

-- Sample goals for alice
INSERT INTO goals (user_id, goal_type, target_value, current_progress, start_date, end_date, description)
VALUES
    (2, 'STEPS',        10000, 9876, CURDATE() - INTERVAL 7 DAY, CURDATE() + INTERVAL 23 DAY, 'Walk 10,000 steps daily'),
    (2, 'WATER_INTAKE',   3.0, 2.5,  CURDATE() - INTERVAL 7 DAY, CURDATE() + INTERVAL 23 DAY, 'Drink 3L water daily'),
    (2, 'SLEEP_HOURS',    8.0, 7.8,  CURDATE() - INTERVAL 7 DAY, CURDATE() + INTERVAL 23 DAY, 'Sleep 8 hours nightly');

-- Sample BMI history for alice
INSERT INTO bmi_history (user_id, bmi, category, weight, height, calculated_date)
VALUES
    (2, 21.8, 'Normal', 58.0, 163.0, CURDATE() - INTERVAL 30 DAY),
    (2, 21.7, 'Normal', 57.8, 163.0, CURDATE() - INTERVAL 15 DAY),
    (2, 21.6, 'Normal', 57.6, 163.0, CURDATE());

-- Activity logs
INSERT INTO activity_logs (user_id, activity_type, description, timestamp)
VALUES
    (2, 'LOGIN',         'User logged in', NOW()),
    (2, 'METRICS_ADDED', 'Added daily health metrics', NOW()),
    (2, 'GOAL_CREATED',  'Created new step goal', NOW());
