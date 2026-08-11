# Development & Setup Guide

## Local Development Setup

1. **Clone & Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Set Environment Variables**
   In `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/nutrilens
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_key
   ```

3. **Start Development Servers**
   ```bash
   # Starts both client (Vite on :5173) and server (Express on :5000)
   npm run dev
   ```

4. **Building for Production**
   ```bash
   npm run build
   ```
