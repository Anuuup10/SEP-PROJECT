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
   Create a `.env` file in the `server/` folder:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

3. **Run Development Server**
   From the root folder:
   ```bash
   npm run dev
   ```
