import { Router, type Request, type Response } from 'express';
import { mongoDatabase, neo4jClient } from '../infrastructure/database/databaseInstances.js';

const router: Router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: { status: 'healthy' },
  });
});

router.get('/ready', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      mongo: mongoDatabase.isConnected() ? 'connected' : 'not_connected',
      neo4j: neo4jClient.isConnected() ? 'connected' : 'not_connected',
      qdrant: 'not_connected',
    },
  });
});

export { router as healthRouter };
