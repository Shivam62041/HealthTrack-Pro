# HealthTrack Pro 🏃‍♂️💪

**A production-ready full-stack health tracking platform** built with Java 21, Spring Boot 3, React.js (Vite), Tailwind CSS, and MySQL 8.

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Docker)](#-quick-start-docker)
- [Local Development Setup](#-local-development-setup)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## ✨ Features

### 👤 User Features
- **Authentication** — JWT-based login/register with refresh tokens
- **Health Metrics Tracking** — Steps, calories, water intake, sleep, heart rate
- **Goal Setting** — Create custom health goals with progress tracking
- **BMI Calculator** — Auto-calculate and store BMI history
- **Analytics Dashboard** — Line, bar, and pie charts (Recharts)
- **PDF Reports** — Downloadable health summary reports
- **Profile Management** — Update personal information

### 🔐 Admin Features
- **User Management** — View, search, disable, reactivate accounts
- **Platform Statistics** — Total users, active users, daily logins
- **Activity Monitoring** — Track user activity logs

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│              React 18 + Vite + Tailwind CSS                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST (JWT)
┌────────────────────────▼────────────────────────────────────┐
│                   Spring Boot 3 API                         │
│   Controller → Service → Repository → JPA → MySQL 8        │
│              Spring Security + JWT Filter                   │
└────────────────────────┬────────────────────────────────────┘
                         │ JDBC
┌────────────────────────▼────────────────────────────────────┐
│                    MySQL 8 Database                         │
│     users | metrics | goals | bmi_history | activity_logs   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Backend     | Java 21, Spring Boot 3.2, Maven        |
| Frontend    | React 18, Vite, Tailwind CSS           |
| Database    | MySQL 8.0, Spring Data JPA             |
| Auth        | Spring Security, JWT (jjwt)            |
| Charts      | Recharts                               |
| PDF         | iText 7                                |
| API Docs    | Springdoc OpenAPI 3 (Swagger UI)       |
| Deployment  | Docker, Docker Compose, Nginx          |

---

## 📁 Project Structure

```
HealthTrack Pro/
├── backend/
│   ├── src/main/java/com/healthtrackpro/
│   │   ├── config/          # Security, Swagger, CORS
│   │   ├── controller/      # REST endpoints
│   │   ├── service/         # Business logic
│   │   ├── repository/      # JPA repositories
│   │   ├── model/           # JPA entities + enums
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── exception/       # Global exception handling
│   │   └── security/        # JWT filter + UserDetailsService
│   ├── src/main/resources/application.yml
│   ├── src/test/            # Unit + Integration tests
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API layer
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── context/         # Auth context
│   │   └── hooks/           # Custom React hooks
│   ├── package.json
│   └── Dockerfile
├── init.sql                 # DB schema + seed data
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Docker)

**Prerequisites:** Docker & Docker Compose installed.

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/healthtrack-pro.git
cd healthtrack-pro

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up --build

# 4. Access the application
# Frontend:   http://localhost:3000
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Default Credentials
| Role  | Email                       | Password   |
|-------|-----------------------------|-----------|
| Admin | admin@healthtrackpro.com   | Admin@123  |
| User  | alice@example.com          | User@123   |

---

## 💻 Local Development Setup

### Prerequisites
- Java 21+
- Node.js 20+
- MySQL 8.0+
- Maven 3.9+

### Backend Setup
```bash
cd backend

# Configure database in src/main/resources/application.yml
# Or set environment variables

mvn clean install
mvn spring-boot:run
# API available at http://localhost:8080
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Database Setup
```bash
mysql -u root -p < init.sql
```

---

## 📖 API Documentation

Swagger UI is available at: `http://localhost:8080/swagger-ui.html`

### Key Endpoints

#### Authentication
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| POST   | /api/auth/register    | Register new user     |
| POST   | /api/auth/login       | Login & get JWT       |
| POST   | /api/auth/refresh     | Refresh access token  |

#### Health Metrics
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /api/metrics         | Get all user metrics  |
| POST   | /api/metrics         | Add metrics entry     |
| PUT    | /api/metrics/{id}   | Update metrics entry  |
| DELETE | /api/metrics/{id}   | Delete metrics entry  |

#### Goals
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | /api/goals         | Get all user goals   |
| POST   | /api/goals         | Create new goal      |
| PUT    | /api/goals/{id}   | Update goal          |
| DELETE | /api/goals/{id}   | Delete goal          |

#### Reports
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | /api/reports/pdf    | Download PDF report  |

---

## 🗄 Database Schema

```
users (id, full_name, email, password, age, gender, height, weight, role, is_active, created_at)
    │
    ├── daily_health_metrics (id, user_id, date, steps, calories_burned, water_intake, sleep_hours, heart_rate, weight)
    ├── goals (id, user_id, goal_type, target_value, current_progress, start_date, end_date, is_achieved)
    ├── bmi_history (id, user_id, bmi, category, weight, height, calculated_date)
    └── activity_logs (id, user_id, activity_type, description, timestamp)
```

---

## ⚙ Environment Variables

| Variable                    | Description                   | Default                        |
|-----------------------------|-------------------------------|--------------------------------|
| `MYSQL_DATABASE`            | Database name                 | healthtrack_db                 |
| `MYSQL_USER`                | DB username                   | healthtrack_user               |
| `MYSQL_PASSWORD`            | DB password                   | healthtrack_pass123            |
| `JWT_SECRET`                | JWT signing secret (256-bit)  | (generated)                    |
| `JWT_EXPIRATION_MS`         | Access token TTL (ms)         | 86400000 (24h)                 |
| `JWT_REFRESH_EXPIRATION_MS` | Refresh token TTL (ms)        | 604800000 (7d)                 |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

---

## 🐳 Deployment

### Production Docker Build
```bash
docker-compose -f docker-compose.yml up --build -d
```

### Nginx Configuration
The frontend Dockerfile builds the Vite app and serves it via Nginx on port 80. API requests are proxied to the backend via `VITE_API_BASE_URL`.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

*Built with ❤️ as a professional portfolio project showcasing full-stack Java development.*
