import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

const PORT = config.port;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[NutriLens Server] Running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error(`[MongoDB] Startup failed: ${error.message}`);
  process.exit(1);
});
