import type { MergedContext, QuestionIntent, IntentResult, GraphContext, SemanticContext, TechnologyContext, FlowContext } from './types.js';
import { GraphRetriever } from './GraphRetriever.js';
import { SemanticRetriever } from './SemanticRetriever.js';

export class ContextBuilder {
  constructor(
    private readonly graphRetriever: GraphRetriever,
    private readonly semanticRetriever: SemanticRetriever,
  ) {}

  async build(
    repositoryId: string,
    question: string,
    intent: IntentResult,
    technologyProfile?: TechnologyContext,
    flowContext?: FlowContext,
  ): Promise<MergedContext> {
    const graphContext = await this.graphRetriever.retrieve(
      repositoryId,
      intent.intent,
      intent.entities,
    );

    const semanticContext = intent.intent === 'LOCATION' || intent.intent === 'GENERAL'
      ? await this.semanticRetriever.retrieve(repositoryId, question)
      : { results: [] };

    return {
      question,
      intent: intent.intent,
      graphContext,
      semanticContext,
      technologyContext: technologyProfile,
      flowContext,
    };
  }
}
