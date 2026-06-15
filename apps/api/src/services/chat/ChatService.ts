import {
  IntentDetector,
  GraphRetriever,
  SemanticRetriever,
  ContextBuilder,
  PromptBuilder,
  AnswerGenerator,
} from '@archaeologist/ai-engine';
import { SearchService } from '@archaeologist/search-engine';
import type { MergedContext, AnswerResult, TechnologyContext, FlowContext } from '@archaeologist/ai-engine';
import type { RepositoryRepository } from '../../infrastructure/database/repositories/RepositoryRepository.js';
import type { ConversationRepository } from '../../infrastructure/database/repositories/ConversationRepository.js';
import type { TechnologyProfileRepository } from '../../infrastructure/database/repositories/TechnologyProfileRepository.js';
import type { Neo4jClient } from '../../infrastructure/graph/Neo4jClient.js';
import { OllamaAiClient } from '../../infrastructure/ai/OllamaAiClient.js';
import { NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export interface ChatRequest {
  conversationId?: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  sources: { type: string; name: string }[];
  conversationId: string;
}

export class ChatService {
  private intentDetector: IntentDetector;
  private graphRetriever: GraphRetriever;
  private semanticRetriever: SemanticRetriever;
  private contextBuilder: ContextBuilder;
  private promptBuilder: PromptBuilder;
  private answerGenerator: AnswerGenerator;
  private aiClient: OllamaAiClient;

  constructor(
    private readonly repositoryRepo: RepositoryRepository,
    private readonly conversationRepo: ConversationRepository,
    private readonly technologyProfileRepo: TechnologyProfileRepository,
    private readonly neo4jClient: Neo4jClient,
    private readonly searchService: SearchService,
    aiClient?: OllamaAiClient,
  ) {
    this.aiClient = aiClient ?? new OllamaAiClient();

    this.intentDetector = new IntentDetector();
    this.graphRetriever = new GraphRetriever({
      query: (cypher: string, params?: Record<string, unknown>) => this.neo4jClient.query(cypher, params),
    });
    this.semanticRetriever = new SemanticRetriever(this.searchService);
    this.contextBuilder = new ContextBuilder(this.graphRetriever, this.semanticRetriever);
    this.promptBuilder = new PromptBuilder();
    this.answerGenerator = new AnswerGenerator(this.aiClient, this.promptBuilder);
  }

  async answerQuestion(
    repositoryId: string,
    request: ChatRequest,
  ): Promise<ChatResponse> {
    const repository = await this.repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    if (repository.status !== 'ready') {
      throw new NotFoundError('Repository is not ready. Please run analysis first.');
    }

    let conversationId = request.conversationId;
    if (!conversationId) {
      const conversation = await this.conversationRepo.create({
        repositoryId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      conversationId = conversation.id;
    }

    const intent = this.intentDetector.detect(request.question);

    const technologyProfile = await this.technologyProfileRepo.findByRepositoryId(repositoryId);

    const techContext: TechnologyContext | undefined = technologyProfile
      ? {
          frontend: technologyProfile.frontend ?? [],
          backend: technologyProfile.backend ?? [],
          database: technologyProfile.database ?? [],
          infrastructure: technologyProfile.infrastructure ?? [],
        }
      : undefined;

    const mergedContext = await this.contextBuilder.build(
      repositoryId,
      request.question,
      intent,
      techContext,
    );

    const result = await this.answerGenerator.generate(mergedContext);

    await this.conversationRepo.addMessage(conversationId, {
      role: 'user',
      content: request.question,
      timestamp: new Date(),
    });

    await this.conversationRepo.addMessage(conversationId, {
      role: 'assistant',
      content: result.answer,
      timestamp: new Date(),
    });

    logger.info(
      { repositoryId, conversationId, intent: intent.intent },
      'Chat question answered',
    );

    return {
      answer: result.answer,
      sources: result.sources,
      conversationId,
    };
  }

  async answerQuestionStreaming(
    repositoryId: string,
    request: ChatRequest,
    onToken: (token: string) => void,
  ): Promise<ChatResponse> {
    const repository = await this.repositoryRepo.findById(repositoryId);
    if (!repository) {
      throw new NotFoundError('Repository not found');
    }

    if (repository.status !== 'ready') {
      throw new NotFoundError('Repository is not ready. Please run analysis first.');
    }

    let conversationId = request.conversationId;
    if (!conversationId) {
      const conversation = await this.conversationRepo.create({
        repositoryId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      conversationId = conversation.id;
    }

    const intent = this.intentDetector.detect(request.question);
    const mergedContext = await this.buildMergedContext(repositoryId, request.question, intent);

    const fullAnswer = await this.aiClient.chatStream(
      [
        { role: 'system', content: this.promptBuilder.build(mergedContext).system },
        { role: 'user', content: this.promptBuilder.build(mergedContext).user },
      ],
      onToken,
    );

    const sources = this.extractSources(mergedContext);

    await this.conversationRepo.addMessage(conversationId, {
      role: 'user',
      content: request.question,
      timestamp: new Date(),
    });

    await this.conversationRepo.addMessage(conversationId, {
      role: 'assistant',
      content: fullAnswer,
      timestamp: new Date(),
    });

    return {
      answer: fullAnswer,
      sources,
      conversationId,
    };
  }

  private async buildMergedContext(
    repositoryId: string,
    question: string,
    intent: { intent: string; confidence: number; entities: string[] },
  ): Promise<MergedContext> {
    const technologyProfile = await this.technologyProfileRepo.findByRepositoryId(repositoryId);
    const techContext: TechnologyContext | undefined = technologyProfile
      ? {
          frontend: technologyProfile.frontend ?? [],
          backend: technologyProfile.backend ?? [],
          database: technologyProfile.database ?? [],
          infrastructure: technologyProfile.infrastructure ?? [],
        }
      : undefined;

    return await this.contextBuilder.build(
      repositoryId,
      question,
      intent as any,
      techContext,
    );
  }

  private extractSources(context: MergedContext): { type: string; name: string }[] {
    const sources = new Map<string, { type: string; name: string }>();

    for (const node of context.graphContext.nodes) {
      const key = `${node.type}:${node.name}`;
      if (!sources.has(key)) {
        sources.set(key, { type: node.type, name: node.name });
      }
    }

    for (const result of context.semanticContext.results) {
      const key = `${result.entityType}:${result.entityName}`;
      if (!sources.has(key)) {
        sources.set(key, { type: result.entityType, name: result.entityName });
      }
    }

    return Array.from(sources.values()).slice(0, 10);
  }
}
