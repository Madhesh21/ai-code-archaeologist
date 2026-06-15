import type { QuestionIntent, IntentResult } from './types.js';

export class IntentDetector {
  detect(question: string): IntentResult {
    const lower = question.toLowerCase();

    const architectureKeywords = ['architecture', 'structure', 'organized', 'pattern', 'layer', 'module'];
    const flowKeywords = ['flow', 'how does', 'trace', 'path', 'step', 'sequence', 'process'];
    const dependencyKeywords = ['depend', 'dependency', 'uses', 'import', 'call', 'invoke', 'who uses', 'what uses'];
    const locationKeywords = ['where is', 'find', 'located', 'which file', 'implemented in', 'search'];
    const technologyKeywords = ['technology', 'stack', 'framework', 'database', 'language', 'library', 'version'];
    const impactKeywords = ['impact', 'break', 'change', 'modify', 'affect', 'what if'];

    const wordSet = new Set(lower.split(/\s+/));

    const score = (keywords: string[]): number =>
      keywords.reduce((sum, kw) => {
        if (lower.includes(kw)) return sum + 1;
        if (wordSet.has(kw)) return sum + 2;
        return sum;
      }, 0);

    const scores: { intent: QuestionIntent; score: number }[] = [
      { intent: 'ARCHITECTURE', score: score(architectureKeywords) },
      { intent: 'FLOW_EXPLANATION', score: score(flowKeywords) },
      { intent: 'DEPENDENCY', score: score(dependencyKeywords) },
      { intent: 'LOCATION', score: score(locationKeywords) },
      { intent: 'TECHNOLOGY', score: score(technologyKeywords) },
      { intent: 'IMPACT_ANALYSIS', score: score(impactKeywords) },
    ];

    scores.sort((a, b) => b.score - a.score);

    const top = scores[0];
    const intent = top.score > 0 ? top.intent : 'GENERAL';
    const confidence = top.score > 0 ? Math.min(top.score / 5, 1) : 0.3;

    const entities = this.extractEntities(lower);

    return { intent, confidence, entities };
  }

  private extractEntities(text: string): string[] {
    const entities: string[] = [];

    const patterns = [
      /(?:how does |where is |find |explain )(\w+)/i,
      /(\w+)\s+flow/i,
      /(\w+)\s+service/i,
      /(\w+)\s+model/i,
      /(\w+)\s+controller/i,
      /(\w+)\s+repository/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const entity = match[1];
        const capitalized = entity.charAt(0).toUpperCase() + entity.slice(1);
        entities.push(capitalized);
      }
    }

    return entities;
  }
}
