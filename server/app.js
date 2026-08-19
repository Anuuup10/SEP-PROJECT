import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/assistant", assistantRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "NutriLens Server API is running",
  });
});

// Error handler
app.use(errorHandler);

export default app;