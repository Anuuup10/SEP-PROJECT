# Architecture - NutriLens / KhanaLens

## System Overview
NutriLens follows a modular client-server architecture with decoupled React frontend (`client/`) and Node.js + Express backend (`server/`).

```
+------------------+         REST API (HTTP/JSON)         +------------------+
|                  | -----------------------------------> |                  |
|  React Frontend  |                                      | Node.js Express  |
|     (client/)    | <----------------------------------- |     (server/)    |
+------------------+                                      +------------------+
                                                                 |    |
                                              MongoDB Database <-+    +-> Google Gemini API
```

## Layer Responsibilities

### 1. Frontend (`client/`)
- **App Setup**: React + Vite
- **Components**: Modular atomic UI elements (`src/components`)
- **Pages**: Top-level route views (`src/pages`)
- **Services**: Centralized HTTP client (`src/services/api.js`)
- **State Management**: React Context (`src/context/AuthContext.jsx`)

### 2. Backend (`server/`)
- **Server Entry**: `server.js` (listens on PORT)
- **App Configuration**: `app.js` (Express configuration, middleware mounting)
- **Routes**: Endpoints routes under `/api/auth` and `/api/nutrition`
- **Controllers**: Business logic orchestration
- **Services**: AI integration (`geminiService.js`) and nutrition calculators (`nutritionService.js`)
- **Models**: Mongoose MongoDB schemas
