import { Router } from 'express';
import { healthRouter } from './health.js';
import { repositoryRouter } from './repository.js';

const router: Router = Router();

router.use(healthRouter);
router.use(repositoryRouter);

export { router as apiRouter };
