import { Router } from 'express';
import { healthRouter } from './health.js';
import { repositoryRouter } from './repository.js';
import { analysisRouter } from './analysis.js';
import { technologyRouter } from './technology.js';
import { entitiesRouter } from './entities.js';
import { relationshipsRouter } from './relationships.js';
import { graphRouter } from './graph.js';
import { searchRouter } from './search.js';
import { flowRouter } from './flow.js';
import { chatRouter } from './chat.js';

const router: Router = Router();

router.use(healthRouter);
router.use(repositoryRouter);
router.use(analysisRouter);
router.use(technologyRouter);
router.use(entitiesRouter);
router.use(relationshipsRouter);
router.use(graphRouter);
router.use(searchRouter);
router.use(flowRouter);
router.use(chatRouter);

export { router as apiRouter };
