import { Router, type Request, type Response, type NextFunction } from 'express';
import { SearchService } from '@archaeologist/search-engine';
import { QdrantVectorClient } from '@archaeologist/search-engine';
import { OllamaAiClient } from '../infrastructure/ai/OllamaAiClient.js';

const router: Router = Router();

const ollamaClient = new OllamaAiClient();
const vectorClient = new QdrantVectorClient();
const searchService = new SearchService(ollamaClient, vectorClient);

router.get('/repositories/:id/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string) ?? '';
    const limit = parseInt(req.query.limit as string, 10) || 10;

    if (!query.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Query parameter q is required' },
      });
      return;
    }

    const results = await searchService.semanticSearch(req.params.id, query, limit);

    res.json({
      success: true,
      data: results,
      meta: { query, limit, total: results.length },
    });
  } catch (error) {
    next(error);
  }
});

export { router as searchRouter };
