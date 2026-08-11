import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NutriLens Server API is running' });
});

// Error handling middleware
app.use(errorHandler);

export default app;
