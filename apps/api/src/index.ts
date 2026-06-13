import fs from 'fs/promises';
import path from 'path';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function ensureDirectories(): Promise<void> {
  const dirs = [path.join(env.UPLOAD_DIR, 'temp'), path.join(env.UPLOAD_DIR, 'repositories')];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
  logger.info({ uploadDir: env.UPLOAD_DIR }, 'Storage directories ensured');
}

await ensureDirectories();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'API server started');
});

function shutdown() {
  logger.info('Shutting down server');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
