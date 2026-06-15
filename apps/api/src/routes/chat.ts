import { Router, type Request, type Response, type NextFunction } from 'express';
import { SearchService } from '@archaeologist/search-engine';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { ConversationRepository } from '../infrastructure/database/repositories/ConversationRepository.js';
import { TechnologyProfileRepository } from '../infrastructure/database/repositories/TechnologyProfileRepository.js';
import { Neo4jClient } from '../infrastructure/graph/Neo4jClient.js';
import { OllamaAiClient } from '../infrastructure/ai/OllamaAiClient.js';
import { QdrantVectorClient } from '@archaeologist/search-engine';
import { ChatService } from '../services/chat/ChatService.js';
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';

const router: Router = Router();

const repositoryRepo = new RepositoryRepository();
const conversationRepo = new ConversationRepository();
const technologyProfileRepo = new TechnologyProfileRepository();
const neo4jClient = new Neo4jClient();
const ollamaClient = new OllamaAiClient();
const vectorClient = new QdrantVectorClient();
const searchService = new SearchService(ollamaClient, vectorClient);

const chatService = new ChatService(
  repositoryRepo,
  conversationRepo,
  technologyProfileRepo,
  neo4jClient,
  searchService,
  ollamaClient,
);

router.post('/repositories/:id/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repository = await repositoryRepo.findById(req.params.id);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    const conversation = await conversationRepo.create({
      repositoryId: req.params.id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: { conversationId: conversation.id },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/repositories/:id/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversations = await conversationRepo.findByRepositoryId(req.params.id);

    res.json({
      success: true,
      data: conversations.map((c) => ({
        id: c.id,
        repositoryId: c.repositoryId,
        messageCount: c.messages?.length ?? 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/repositories/:id/conversations/:conversationId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await conversationRepo.findById(req.params.conversationId);
      if (!conversation) {
        throw new NotFoundError('Conversation not found');
      }

      res.json({
        success: true,
        data: {
          id: conversation.id,
          messages: conversation.messages ?? [],
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post('/repositories/:id/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, conversationId } = req.body;

    if (!question || typeof question !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Question is required' },
      });
      return;
    }

    if (question.length > 2000) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Question must be under 2000 characters' },
      });
      return;
    }

    const result = await chatService.answerQuestion(req.params.id, {
      conversationId,
      question,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/repositories/:id/chat/stream', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = req.query.q as string;
    const conversationId = req.query.conversationId as string;

    if (!question) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Question (q) query parameter is required' },
      });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullAnswer = '';

    const onToken = (token: string) => {
      fullAnswer += token;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    };

    try {
      const result = await chatService.answerQuestionStreaming(
        req.params.id,
        { conversationId, question },
        onToken,
      );

      res.write(`data: ${JSON.stringify({ done: true, conversationId: result.conversationId, sources: result.sources })}\n\n`);
      res.end();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Stream failed';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  } catch (error) {
    next(error);
  }
});

export { router as chatRouter };
