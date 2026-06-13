import { Router } from 'express';
import { healthRouter } from './health.js';
import { repositoryRouter } from './repository.js';
import { analysisRouter } from './analysis.js';

const router: Router = Router();

router.use(healthRouter);
router.use(repositoryRouter);
router.use(analysisRouter);

export { router as apiRouter };
