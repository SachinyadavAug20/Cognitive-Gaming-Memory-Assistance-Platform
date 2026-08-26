# API Endpoints Contract

Base URL: `http://localhost:8080/api/v1`

## Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/login` | `{ name, password }` | `User` |
| POST | `/patients` | `{ name, age, language, caregiverId }` | `Patient` |

## Memories

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/memories?patientId=` | — | `Memory[]` |
| POST | `/memories` | `multipart: file, personName, relationship, description, patientId` | `Memory` |

## Game Sessions

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/games/{type}/config?patientId=` | — | `GameConfig` (difficulty settings) |
| POST | `/game-sessions` | `{ patientId, gameType, score, difficultyLevel, responseTime, mistakes, hintsUsed }` | `GameSession` + updated difficulty |

## Caregiver

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/caregiver/{id}/patients` | — | `Patient[]` with `CognitiveProfile` |
| GET | `/patients/{id}/profile` | — | `CognitiveProfile` |

## Reminders

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/reminders?patientId=` | — | `Reminder[]` |
| POST | `/reminders` | `{ patientId, type, message, scheduledAt }` | `Reminder` |
| PUT | `/reminders/{id}/complete` | — | `Reminder` |

## Alerts

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/alerts?patientId=` | — | `Alert[]` |

## AI Analysis

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/ai/patient/{id}/report` | — | `{ report: string }` (Ollama-generated) |
