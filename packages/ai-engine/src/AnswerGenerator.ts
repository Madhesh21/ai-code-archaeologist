import type { MergedContext, AnswerResult } from './types.js';
import { PromptBuilder } from './PromptBuilder.js';

interface AiChatFn {
  chat(messages: { role: string; content: string }[]): Promise<string>;
}

export class AnswerGenerator {
  constructor(
    private readonly aiClient: AiChatFn,
    private readonly promptBuilder: PromptBuilder,
  ) {}

  async generate(context: MergedContext): Promise<AnswerResult> {
    const prompt = this.promptBuilder.build(context);

    const answer = await this.aiClient.chat([
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ]);

    const sources = this.extractSources(context);

    return {
      answer,
      sources,
      confidence: context.graphContext.nodes.length > 0 ? 0.9 : 0.5,
    };
  }

  async generateStreaming(
    context: MergedContext,
    onToken: (token: string) => void,
  ): Promise<AnswerResult> {
    const prompt = this.promptBuilder.build(context);

    const fullAnswer = await this.aiClient.chat([
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ]);

    const words = fullAnswer.split(' ');
    for (const word of words) {
      onToken(word + ' ');
      await this.delay(30);
    }

    const sources = this.extractSources(context);

    return {
      answer: fullAnswer,
      sources,
      confidence: context.graphContext.nodes.length > 0 ? 0.9 : 0.5,
    };
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
