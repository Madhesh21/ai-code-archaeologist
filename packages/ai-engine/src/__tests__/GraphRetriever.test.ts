import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphRetriever } from '../GraphRetriever.js';

describe('GraphRetriever', () => {
  let retriever: GraphRetriever;
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQuery = vi.fn();
    retriever = new GraphRetriever({ query: mockQuery });
  });

  it('should retrieve architecture context', async () => {
    mockQuery.mockResolvedValue([
      { node: { id: 's1', name: 'AuthService' }, labels: ['Service'] },
      { node: { id: 'f1', name: 'login' }, labels: ['Function'] },
    ]);

    const result = await retriever.retrieve('repo_1', 'ARCHITECTURE', []);
    expect(result.nodes).toHaveLength(2);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('should retrieve dependency context', async () => {
    mockQuery.mockResolvedValue([
      { n: { id: 's1', name: 'auth' }, n_labels: ['Service'], connected: { id: 'm1', name: 'database' }, c_labels: ['Model'], relType: 'DEPENDS_ON' },
    ]);

    const result = await retriever.retrieve('repo_1', 'DEPENDENCY', ['auth']);
    expect(result.relationships).toHaveLength(1);
  });

  it('should retrieve flow context', async () => {
    mockQuery.mockResolvedValue([
      { node: { id: 'f1', name: 'login' }, labels: ['Function'] },
      { node: { id: 'f2', name: 'validateUser' }, labels: ['Function'] },
    ]);

    const result = await retriever.retrieve('repo_1', 'FLOW_EXPLANATION', ['login']);
    expect(result.nodes).toHaveLength(2);
  });

  it('should retrieve impact analysis context using general retrieval', async () => {
    mockQuery.mockResolvedValue([
      { node: { id: 'u1', name: 'User' }, labels: ['Model'] },
    ]);

    const result = await retriever.retrieve('repo_1', 'IMPACT_ANALYSIS', ['User']);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].name).toBe('User');
  });

  it('should retrieve technology context', async () => {
    mockQuery.mockResolvedValue([
      { node: { id: 'file1', name: 'package.json', path: 'package.json' }, labels: ['File'] },
    ]);

    const result = await retriever.retrieve('repo_1', 'TECHNOLOGY', []);
    expect(result.nodes).toHaveLength(1);
  });

  it('should use general context for unknown intent', async () => {
    mockQuery.mockResolvedValue([
      { node: { id: 'f1', name: 'login' }, labels: ['Function'] },
    ]);
    const result = await retriever.retrieve('repo_1', 'GENERAL', ['login']);
    expect(result.nodes).toHaveLength(1);
  });
});
