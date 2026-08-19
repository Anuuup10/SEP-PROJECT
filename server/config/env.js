import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/nutrilens',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_dev_key',
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  aiProvider: process.env.AI_PROVIDER || 'groq', // 'groq' or 'gemini'
};