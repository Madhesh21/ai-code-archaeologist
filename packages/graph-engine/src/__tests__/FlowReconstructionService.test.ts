import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FlowReconstructionService } from '../FlowReconstructionService.js';
import type { IGraphClient } from '../types.js';

describe('FlowReconstructionService', () => {
  let service: FlowReconstructionService;
  let mockClient: IGraphClient;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
      close: vi.fn(),
    };
    service = new FlowReconstructionService(mockClient);
  });

  it('should generate a flow for an existing entity', async () => {
    const mockQuery = mockClient.query as ReturnType<typeof vi.fn>;

    // findStartNode
    mockQuery.mockResolvedValueOnce([
      { n: { id: 'fn_1', name: 'login', path: 'src/auth.ts' }, labels: ['Function'] },
    ]);

    // traceExecutionPath: getNodeInfo for start node
    mockQuery.mockResolvedValueOnce([
      { n: { id: 'fn_1', name: 'login', path: 'src/auth.ts', startLine: 10, endLine: 30, isExported: true, isAsync: false }, labels: ['Function'] },
    ]);

    // getForwardNeighbors
    mockQuery.mockResolvedValueOnce([{ targetId: 'fn_2' }]);

    // getNodeInfo for fn_2
    mockQuery.mockResolvedValueOnce([
      { n: { id: 'fn_2', name: 'validateUser', path: 'src/auth.ts', startLine: 32, endLine: 45, isExported: false, isAsync: false }, labels: ['Function'] },
    ]);

    // getForwardNeighbors for fn_2
    mockQuery.mockResolvedValueOnce([]);

    const flow = await service.generateFlow('repo_1', 'login');

    expect(flow.name).toBe('login Flow');
    expect(flow.repositoryId).toBe('repo_1');
    expect(flow.startNode).toBe('fn_1');
    expect(flow.steps).toHaveLength(2);
    expect(flow.steps[0].nodeName).toBe('login');
    expect(flow.steps[1].nodeName).toBe('validateUser');
  });

  it('should throw for non-existent entity', async () => {
    const mockQuery = mockClient.query as ReturnType<typeof vi.fn>;
    mockQuery.mockResolvedValueOnce([]);

    await expect(service.generateFlow('repo_1', 'nonexistent')).rejects.toThrow('not found');
  });

  it('should trace execution up to max depth', async () => {
    const mockQuery = mockClient.query as ReturnType<typeof vi.fn>;

    mockQuery.mockResolvedValueOnce([
      { n: { id: 'fn_1', name: 'start' }, labels: ['Function'] },
    ]);

    // generateFlow calls traceExecutionPath which calls getNodeInfo then getForwardNeighbors
    // We need to mock repeated patterns for depth > 15

    for (let i = 0; i < 16; i++) {
      mockQuery.mockResolvedValueOnce([
        { n: { id: `fn_${i}`, name: `func_${i}` }, labels: ['Function'] },
      ]);
      mockQuery.mockResolvedValueOnce([{ targetId: `fn_${i + 1}` }]);
    }

    // Final node at depth 16 (not visited)
    mockQuery.mockResolvedValueOnce([]);

    const flow = await service.generateFlow('repo_1', 'start');
    expect(flow.steps.length).toBeLessThanOrEqual(15);
  });

  it('should list flows for a repository', async () => {
    const mockQuery = mockClient.query as ReturnType<typeof vi.fn>;

    // listFlows query
    mockQuery.mockResolvedValueOnce([
      { name: 'login', labels: ['Route'] },
    ]);

    // generateFlow for 'login' -> findStartNode
    mockQuery.mockResolvedValueOnce([
      { n: { id: 'fn_1', name: 'login', path: '/api/login' }, labels: ['Route'] },
    ]);

    // traceExecutionPath -> getNodeInfo for fn_1
    mockQuery.mockResolvedValueOnce([
      { n: { id: 'fn_1', name: 'login', path: '/api/login', method: 'POST' }, labels: ['Route'] },
    ]);

    // getForwardNeighbors
    mockQuery.mockResolvedValueOnce([]);

    const flows = await service.listFlows('repo_1');
    expect(flows).toHaveLength(1);
    expect(flows[0].name).toBe('login Flow');
  });

  it('should skip entities that fail flow generation in listFlows', async () => {
    const mockQuery = mockClient.query as ReturnType<typeof vi.fn>;

    // listFlows query returns two entities, second one fails
    mockQuery.mockResolvedValueOnce([
      { name: 'login', labels: ['Route'] },
      { name: 'broken', labels: ['Function'] },
    ]);

    // generateFlow for 'login' succeeds
    mockQuery.mockResolvedValueOnce([
      { n: { id: 'fn_1', name: 'login', path: '/api/login' }, labels: ['Route'] },
    ]);
    mockQuery.mockResolvedValueOnce([
      { n: { id: 'fn_1', name: 'login', path: '/api/login', method: 'POST' }, labels: ['Route'] },
    ]);
    mockQuery.mockResolvedValueOnce([]);

    // generateFlow for 'broken' fails (findStartNode returns empty)
    mockQuery.mockResolvedValueOnce([]);

    const flows = await service.listFlows('repo_1');
    expect(flows).toHaveLength(1);
    expect(flows[0].name).toBe('login Flow');
  });
});
