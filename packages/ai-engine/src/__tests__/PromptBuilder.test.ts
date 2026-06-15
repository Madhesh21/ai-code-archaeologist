import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../PromptBuilder.js';
import type { MergedContext } from '../types.js';

describe('PromptBuilder', () => {
  const builder = new PromptBuilder();

  const emptyContext: MergedContext = {
    question: 'How does login work?',
    intent: 'FLOW_EXPLANATION',
    graphContext: { nodes: [], relationships: [] },
    semanticContext: { results: [] },
  };

  it('should build a system prompt', () => {
    const result = builder.build(emptyContext);
    expect(result.system).toContain('repository');
    expect(result.system).toContain('evidence');
  });

  it('should build a user prompt with context', () => {
    const context: MergedContext = {
      ...emptyContext,
      graphContext: {
        nodes: [
          { id: 'f1', name: 'login', type: 'Function', filePath: 'src/auth.ts', properties: {} },
        ],
        relationships: [],
      },
      semanticContext: { results: [] },
      technologyContext: {
        frontend: ['React'],
        backend: ['Node.js'],
        database: ['PostgreSQL'],
        infrastructure: [],
      },
    };

    const result = builder.build(context);
    expect(result.user).toContain('How does login work?');
    expect(result.user).toContain('login');
    expect(result.user).toContain('React');
    expect(result.user).toContain('Node.js');
    expect(result.user).toContain('PostgreSQL');
  });

  it('should include relationships in prompt', () => {
    const context: MergedContext = {
      ...emptyContext,
      graphContext: {
        nodes: [
          { id: 'f1', name: 'login', type: 'Function', filePath: 'src/auth.ts', properties: {} },
        ],
        relationships: [
          { type: 'CALLS', sourceName: 'login', targetName: 'validateUser' },
        ],
      },
      semanticContext: { results: [] },
    };

    const result = builder.build(context);
    expect(result.user).toContain('login → [CALLS] → validateUser');
  });

  it('should include semantic results with scores', () => {
    const context: MergedContext = {
      ...emptyContext,
      graphContext: { nodes: [], relationships: [] },
      semanticContext: {
        results: [
          { score: 0.95, entityId: 'f1', entityType: 'Function', entityName: 'login', filePath: 'src/auth.ts', repositoryId: 'repo_1' },
        ],
      },
    };

    const result = builder.build(context);
    expect(result.user).toContain('login');
    expect(result.user).toContain('0.950');
    expect(result.user).toContain('src/auth.ts');
  });

  it('should include flow evidence', () => {
    const context: MergedContext = {
      ...emptyContext,
      graphContext: { nodes: [], relationships: [] },
      semanticContext: { results: [] },
      flowContext: {
        name: 'login Flow',
        steps: [
          { nodeName: 'login', nodeType: 'Function' },
          { nodeName: 'validateUser', nodeType: 'Function' },
        ],
      },
    };

    const result = builder.build(context);
    expect(result.user).toContain('login Flow');
    expect(result.user).toContain('validateUser');
  });

  it('should show no-evidence note when no context found', () => {
    const context: MergedContext = {
      ...emptyContext,
      graphContext: { nodes: [], relationships: [] },
      semanticContext: { results: [] },
      question: 'What does X do?',
    };

    const result = builder.build(context);
    expect(result.user).toContain('No repository evidence was found');
  });

  it('should instruct not to hallucinate', () => {
    const result = builder.build(emptyContext);
    expect(result.system).toContain('not');
  });
});
