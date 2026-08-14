# Architecture

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### AI

- Gemini API

### Authentication

- JWT

### Image Storage

To be decided based on project requirements.

## High-Level Architecture

User
  ↓
React Frontend
  ↓
Express REST API
  ↓
Controllers
  ↓
Services
  ├── Gemini API
  ├── Nutrition Processing
  └── Database
  ↓
MongoDB
  ↓
Response
  ↓
React Frontend

## Frontend Structure

client/
└── src/
    ├── components/
    ├── pages/
    ├── services/
    ├── assets/
    ├── App.jsx
    └── main.jsx

## Backend Structure

server/
├── models/
├── routes/
├── controllers/
├── services/
├── app.js
└── server.js

## Backend Request Flow

Request
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Database / External API
  ↓
Controller
  ↓
Response

## AI Flow

Food Image
  ↓
Backend
  ↓
Gemini API
  ↓
Food Identification
  ↓
Estimated Portion
  ↓
Nutrition Processing
  ↓
Structured Response
  ↓
Frontend

## Important Rules

1. Gemini API keys must never be exposed to the frontend.
2. Gemini API calls should be handled by the backend.
3. Follow the existing folder structure.
4. Avoid unnecessary libraries.
5. Avoid duplicate functionality.
6. Reuse existing components.
7. Keep business logic out of React components when possible.
8. Validate AI responses before using or storing them.
9. Do not change the overall architecture without discussing it first.
10. Update this document when the architecture changes.