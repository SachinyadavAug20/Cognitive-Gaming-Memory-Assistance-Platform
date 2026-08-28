# CogniCare

> AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)
> — **Smart India Hackathon 2026** | Problem Statement ID: SIH26003

## Overview

CogniCare is a gamified cognitive-training platform for elderly dementia patients in remote North-East India. It combines personalized memory games, route-learning exercises, voice interaction, reminders, and caregiver dashboards — powered by adaptive AI analysis via Ollama.

## Features

- **Memory Pieces (Puzzle Game)** — Reconstruct familiar photos, then identify the person/place
- **Remember the Way (Wayfinding Game)** — Learn routes through local environments, navigate from memory
- **Adaptive AI** — Difficulty adjusts based on patient performance (visual memory, spatial memory, recognition)
- **Caregiver Dashboard** — Cognitive profile, session history, trend charts, alert management
- **Reminders** — Medicine, hydration, appointments, daily activities
- **AI Reports** — Ollama-generated plain-language summaries of patient progress
- **Multilingual** — English, Hindi, Assamese (extensible)
- **Voice Interface** — Web Speech API for elderly-friendly interaction
- **Offline-first** — Local storage with sync (PWA planned)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Zustand |
| Backend | Spring Boot 4.1, Java 17, Spring Data JPA, Lombok |
| Database | PostgreSQL (default) / H2 (demo mode) |
| AI | Ollama (llama3.2:3b) via REST |
| API | REST (HTTP/JSON) |

## Project Structure

```
sih/
├── frontend/              # Next.js application
│   ├── src/app/
│   │   ├── (auth)/login/  # Login page
│   │   ├── patient/       # Patient panel (games, home, reminders)
│   │   │   ├── puzzle/    # Memory Pieces game
│   │   │   └── wayfinding/ # Remember the Way game
│   │   └── caregiver/     # Caregiver panel (dashboard, patients, memories, reminders, reports)
│   ├── src/components/    # Reusable UI components
│   ├── src/lib/           # API client, i18n
│   └── src/types/         # TypeScript interfaces
├── backend/               # Spring Boot application
│   └── src/main/java/com/sih/cognicare/
│       ├── config/        # CorsConfig, OllamaClient
│       ├── controller/    # REST endpoints
│       ├── service/       # Business logic, adaptive AI
│       ├── repository/    # Spring Data JPA
│       ├── model/         # JPA entities
│       └── dto/           # Request/response DTOs
├── shared/                # API contract (TS types + endpoint docs)
└── documentation/         # Architecture diagrams, pitch assets
```

## Prerequisites

- **Node.js** v18+
- **JDK** 17+
- **PostgreSQL** (or use demo mode with H2 — no DB install needed)
- **Ollama** installed locally (`ollama pull llama3.2:3b`)

## Getting Started

### Quick Demo (H2 — no database needed)

```bash
# Terminal 1 — Backend
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Backend: `http://localhost:8080` | Frontend: `http://localhost:3000`

### Full Setup (PostgreSQL)

1. Create database: `CREATE DATABASE cognicare;`
2. Update `backend/src/main/resources/application.properties` with your credentials
3. Start backend: `cd backend && ./mvnw spring-boot:run`
4. Start frontend: `cd frontend && npm run dev`

