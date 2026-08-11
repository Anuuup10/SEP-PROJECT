import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const PORT = config.port;

// Connect to Database & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[NutriLens Server] Running on http://localhost:${PORT}`);
  });
});
