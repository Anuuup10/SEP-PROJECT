# NutriLens & KhanaLens

NutriLens is an AI-powered nutrition scanner and health tracker application built with React, Node.js, Express, Firebase, and Google Gemini AI.

## Project Structure

```
sep_project/
├── client/                     # React frontend (Vite + React)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Full screens
│   │   ├── layouts/            # Main app layout
│   │   ├── services/           # API calls
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # Auth / global state
│   │   ├── assets/             # Images, icons, etc.
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Node + Express backend
│   ├── controllers/            # Request logic
│   ├── services/               # Firebase and application services
│   ├── routes/                 # API routes
│   ├── services/               # Gemini + nutrition logic
│   ├── middleware/             # Auth/error middleware
│   ├── config/                 # DB & environment config
│   ├── app.js
│   └── server.js
│
├── docs/                       # Project documentation
│   ├── API.md
│   └── ARCHITECTURE.md
│
├── khanalens/                  # Preserved previous Vite frontend setup
│
├── .gitignore
├── README.md
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase project with Firestore, Authentication, and Storage enabled
- Gemini API Key

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. **Environment Configuration**
   Create `client/.env` with the Firebase web-app values and the deployed API origin:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_FIREBASE_API_KEY=your_firebase_web_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

   Create a `.env` file in the `server/` folder:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   CLIENT_ORIGIN=https://your-frontend-domain.com
   ```

   This repository is configured to deploy both the Vite frontend and Express API on Vercel. Use `VITE_API_URL=/api` so the frontend calls the same Vercel domain.

3. **Run Development Server**
   From the root folder:
   ```bash
   npm run dev
   ```
