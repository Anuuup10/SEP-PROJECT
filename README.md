# 🥗 NutriVision AI

**AI-Powered Food Analysis & Nutrition Tracking System**

NutriVision AI is a MERN-stack web application that uses AI and computer vision to identify food items from uploaded images and instantly estimate calories, protein, carbohydrates, and fats. It stores meal history and provides healthier eating insights to help users maintain a balanced diet.

---

## 📌 Overview

Maintaining a healthy diet has become increasingly difficult because many people are unaware of the nutritional value of the food they consume. NutriVision AI solves this by letting users simply upload a photo of their meal — the app detects the food, analyzes its nutritional content, and logs it to their personal history, all in seconds.

---

## ✨ Core Features

- 🔐 Secure Login & Registration
- 🍽️ AI-Powered Food Recognition
- 📊 Instant Nutrition Analysis
- 🔥 Calorie, Protein, Fat & Carb Breakdown
- 📅 Daily Nutrition Tracker
- 📖 Meal History
- 💡 Personalized Healthy Eating Suggestions
- 📈 Dashboard & Statistics
- 📱 Responsive Design

---

## 🎯 Objectives

- Develop an AI-powered food recognition system
- Detect food items from uploaded images
- Display nutritional information instantly
- Track users' daily nutrition history
- Provide healthy eating suggestions
- Build a responsive, full-stack MERN web application

---

## 🛠️ Tech Stack

**Frontend:** React.js, HTML, CSS, Tailwind CSS, JavaScript
**Backend:** Node.js, Express.js
**Database:** MongoDB, Mongoose
**AI:** Google Gemini Vision API
**Authentication:** JWT, bcrypt.js
**Deployment:** Vercel, Render/Railway, MongoDB Atlas
**Tools:** GitHub, VS Code, Postman, Figma

---

## 🗓️ Project Timeline

| Week | Milestone |
|------|-----------|
| 1 | Planning & Requirement Analysis |
| 2 | UI/UX & Database Design |
| 3 | React Frontend Development |
| 4 | Backend APIs |
| 5 | MongoDB & Authentication |
| 6 | AI Integration |
| 7 | Dashboard & Tracking |
| 8 | Testing, Deployment & Documentation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB Atlas account (or local MongoDB instance)
- Google Gemini Vision API key

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/nutrivision-ai.git
cd nutrivision-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory with the following:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

### Running the App

```bash
# Start backend server
cd backend
npm run dev

# Start frontend (in a separate terminal)
cd frontend
npm start
```

---

## 📂 Project Structure

```
nutrivision-ai/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
└── README.md
```

---

## 🎯 Expected Outcome

A complete AI-powered Food Analysis Web Application that recognizes food from images, estimates nutrition, tracks meals securely, and demonstrates practical MERN stack development with AI integration.

---

## 👥 Team Members

| Name |
|------|
| Anup Chaudhary |
| Piyush Rouniyar |
| Aryan Khadka |
| Raunak Shrestha |
| Subham Chaudhary |

---

## 📄 License

This project is developed as part of a Software Engineering Project (SEP) submission. License details to be added.
