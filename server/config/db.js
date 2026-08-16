import mongoose from 'mongoose';
import dns from 'node:dns/promises';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    // Atlas SRV records can fail with the machine's default DNS resolver.
    // Use public resolvers before mongoose resolves mongodb+srv URLs.
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    throw error;
  }
};
