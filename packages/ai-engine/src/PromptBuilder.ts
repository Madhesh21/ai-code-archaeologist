import type { MergedContext, PromptTemplate, QuestionIntent } from './types.js';

export class PromptBuilder {
  build(context: MergedContext): PromptTemplate {
    const systemPrompt = this.buildSystemPrompt(context.intent);
    const userPrompt = this.buildUserPrompt(context);

    return { system: systemPrompt, user: userPrompt };
  }

  private buildSystemPrompt(intent: QuestionIntent): string {
    const basePrompt = `You are an expert software engineer analyzing a repository using a knowledge graph.

Your role is to explain repository architecture, flows, and dependencies using ONLY evidence retrieved from the repository analysis.

RULES:
- Only answer using the repository evidence provided in the context below.
- If the evidence does not contain enough information to answer, say "The repository evidence does not contain enough information to answer this question."
- Never invent execution flows, dependencies, or architecture.
- Never guess function names, file paths, or relationships.
- Be specific: mention actual function names, file paths, and entity names when they appear in evidence.
- Format responses with clear structure using bullet points or short paragraphs.`;

    const intentInstructions: Record<QuestionIntent, string> = {
      ARCHITECTURE: '\nFocus on explaining how the project is structured: major modules, layers, and organization.',
      FLOW_EXPLANATION: '\nFocus on tracing the execution path step by step from start to end. List each step in order.',
      DEPENDENCY: '\nFocus on listing dependencies and relationships. Explain which entities depend on which.',
      LOCATION: '\nFocus on telling the user exactly where to find the relevant code (file paths, function names).',
      TECHNOLOGY: '\nFocus on explaining which technologies, frameworks, and libraries the repository uses.',
      IMPACT_ANALYSIS: '\nFocus on what depends on the mentioned entity and what might break if modified.',
      GENERAL: '\nAnswer the question using the available repository evidence. If the evidence is insufficient, say so.',
    };

    return basePrompt + intentInstructions[intent];
  }

  private buildUserPrompt(context: MergedContext): string {
    const parts: string[] = [];

    parts.push(`## Question\n${context.question}\n`);

    if (context.graphContext.nodes.length > 0) {
      parts.push('## Graph Evidence (Repository Knowledge Graph)\n');
      parts.push('### Nodes Found:');
      for (const node of context.graphContext.nodes) {
        const fileInfo = node.filePath ? ` (${node.filePath})` : '';
        parts.push(`- **${node.name}** (${node.type})${fileInfo}`);
      }

      if (context.graphContext.relationships.length > 0) {
        parts.push('\n### Relationships:');
        for (const rel of context.graphContext.relationships) {
          parts.push(`- ${rel.sourceName} → [${rel.type}] → ${rel.targetName}`);
        }
      }
    }

    if (context.semanticContext.results.length > 0) {
      parts.push('\n## Semantic Evidence (Vector Search)');
      for (const result of context.semanticContext.results) {
        parts.push(`- ${result.entityName} (${result.entityType}) [score: ${result.score.toFixed(3)}] - ${result.filePath}`);
      }
    }

    if (context.flowContext) {
      parts.push('\n## Flow Evidence');
      parts.push(`Flow: ${context.flowContext.name}`);
      for (const step of context.flowContext.steps) {
        parts.push(`→ ${step.nodeName} (${step.nodeType})`);
      }
    }

    if (context.technologyContext) {
      parts.push('\n## Technology Profile');
      if (context.technologyContext.frontend.length > 0) {
        parts.push(`Frontend: ${context.technologyContext.frontend.join(', ')}`);
      }
      if (context.technologyContext.backend.length > 0) {
        parts.push(`Backend: ${context.technologyContext.backend.join(', ')}`);
      }
      if (context.technologyContext.database.length > 0) {
        parts.push(`Database: ${context.technologyContext.database.join(', ')}`);
      }
      if (context.technologyContext.infrastructure.length > 0) {
        parts.push(`Infrastructure: ${context.technologyContext.infrastructure.join(', ')}`);
      }
    }

    if (context.graphContext.nodes.length === 0 && context.semanticContext.results.length === 0) {
      parts.push('\n**Note:** No repository evidence was found matching this question.');
    }

    return parts.join('\n');
  }
}
