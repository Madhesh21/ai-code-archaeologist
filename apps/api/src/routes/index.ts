import { Router } from 'express';
import { healthRouter } from './health.js';
import { repositoryRouter } from './repository.js';
import { analysisRouter } from './analysis.js';
import { technologyRouter } from './technology.js';

const router: Router = Router();

router.use(healthRouter);
router.use(repositoryRouter);
router.use(analysisRouter);
router.use(technologyRouter);

export { router as apiRouter };
