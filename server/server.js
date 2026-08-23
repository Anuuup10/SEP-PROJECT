import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`[NutriLens Server] Running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[NutriLens Server] Port ${PORT} is already in use. Stop the other server or set PORT to a free port.`);
    process.exit(0);
  }
  console.error(`[NutriLens Server] Failed to start: ${error.message}`);
  process.exit(1);
});
