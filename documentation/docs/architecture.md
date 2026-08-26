# CogniCare — Architecture

## System Overview

```
┌──────────────────────────────────────────────┐
│              Frontend (Next.js)              │
│         Patient Panel  │  Caregiver Panel    │
│   ┌─────────┐  ┌────────────┐  ┌─────────┐  │
│   │ Games   │  │ Reminders  │  │ Dashboard│  │
│   │ (2D/Canvas)│ │           │  │ Charts  │  │
│   └────┬────┘  └─────┬──────┘  └────┬────┘  │
│        └──────────────┼──────────────┘       │
│                       │ HTTP                 │
└───────────────────────┼──────────────────────┘
                        │
┌───────────────────────┼──────────────────────┐
│         Backend (Spring Boot :8080)          │
│   ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│   │  Auth   │  │  Game    │  │  AI/Ollama│  │
│   │         │  │ Sessions │  │  Analysis │  │
│   └────┬────┘  └────┬─────┘  └─────┬─────┘  │
│        └─────────────┼──────────────┘        │
│                      │                       │
│   ┌──────────────────┴───────────────────┐   │
│   │         PostgreSQL / H2              │   │
│   └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

## Data Flow

1. **Patient** plays game → result sent to backend
2. **Adaptive engine** adjusts difficulty for next session
3. **Caregiver** views cognitive profile + trends
4. **Ollama** summarizes patient progress in plain language
5. **Alerts** triggered on missed reminders or declining scores
