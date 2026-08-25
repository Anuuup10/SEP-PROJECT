import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { config } from './config/env.js';

const app = express();

app.use(cors({ origin: config.clientOrigin === '*' ? true : config.clientOrigin }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meal-plan', mealPlanRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NutriLens Server API is running' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
