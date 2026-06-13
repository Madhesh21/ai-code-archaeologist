import fs from 'fs/promises';
import path from 'path';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { mongoDatabase, neo4jClient } from './infrastructure/database/databaseInstances.js';

async function ensureDirectories(): Promise<void> {
  const dirs = [
    path.join(env.UPLOAD_DIR, 'temp'),
    path.join(env.UPLOAD_DIR, 'repositories'),
    path.join(env.UPLOAD_DIR, 'clones'),
  ];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
  logger.info({ uploadDir: env.UPLOAD_DIR }, 'Storage directories ensured');
}

async function connectDatabases(): Promise<void> {
  try {
    await mongoDatabase.connect();
  } catch (error) {
    logger.warn({ error }, 'MongoDB connection failed — server will start without database');
  }

  try {
    await neo4jClient.connect();
  } catch (error) {
    logger.warn({ error }, 'Neo4j connection failed — server will start without graph database');
  }
}

await ensureDirectories();
await connectDatabases();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'API server started');
});

async function shutdown() {
  logger.info('Shutting down server');
  server.close(async () => {
    await Promise.allSettled([
      mongoDatabase.disconnect(),
      neo4jClient.disconnect(),
    ]);
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
