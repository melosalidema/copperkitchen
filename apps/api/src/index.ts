import 'dotenv/config';
import { app } from './app.js';

const PORT = Number(process.env.PORT) || 4000;

const server = app.listen(PORT, () => {
  console.log(
    `[copperkitchen-api] listening on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`
  );
});

function shutdown(signal: string): void {
  console.log(`[copperkitchen-api] ${signal} received, shutting down`);
  server.close(() => {
    process.exit(0);
  });
  // Force-exit if connections do not drain.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
