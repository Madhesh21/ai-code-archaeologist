import { Router, type Request, type Response } from 'express';

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
      mongo: 'not_connected',
      neo4j: 'not_connected',
      qdrant: 'not_connected',
    },
  });
});

export { router as healthRouter };
