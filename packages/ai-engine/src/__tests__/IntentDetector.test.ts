import { describe, it, expect } from 'vitest';
import { IntentDetector } from '../IntentDetector.js';

describe('IntentDetector', () => {
  const detector = new IntentDetector();

  it('should detect ARCHITECTURE intent', () => {
    const result = detector.detect('How is the project architecture structured?');
    expect(result.intent).toBe('ARCHITECTURE');
  });

  it('should detect FLOW_EXPLANATION intent', () => {
    const result = detector.detect('Trace the login flow step by step');
    expect(result.intent).toBe('FLOW_EXPLANATION');
  });

  it('should detect DEPENDENCY intent', () => {
    const result = detector.detect('What imports does the auth service use?');
    expect(result.intent).toBe('DEPENDENCY');
  });

  it('should detect LOCATION intent', () => {
    const result = detector.detect('Where is the login function?');
    expect(result.intent).toBe('LOCATION');
  });

  it('should detect TECHNOLOGY intent', () => {
    const result = detector.detect('What technology stack does the project use?');
    expect(result.intent).toBe('TECHNOLOGY');
  });

  it('should detect IMPACT intent', () => {
    const result = detector.detect('What would break if I change the User model?');
    expect(result.intent).toBe('IMPACT_ANALYSIS');
  });

  it('should return GENERAL for unknown queries', () => {
    const result = detector.detect('Hello world');
    expect(result.intent).toBe('GENERAL');
  });

  it('should extract confidence from keyword matches', () => {
    const result = detector.detect('Where is the login function defined?');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should extract entities from the question', () => {
    const result = detector.detect('How does login work?');
    expect(result.entities).toContain('Login');
  });
});
