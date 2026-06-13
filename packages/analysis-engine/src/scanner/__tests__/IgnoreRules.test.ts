import { describe, it, expect } from 'vitest';
import { IgnoreRules } from '../IgnoreRules.js';

describe('IgnoreRules', () => {
  it('ignores node_modules', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/node_modules')).toBe(true);
  });

  it('ignores dist', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/dist')).toBe(true);
  });

  it('ignores build', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/build')).toBe(true);
  });

  it('ignores coverage', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/coverage')).toBe(true);
  });

  it('ignores .next', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/.next')).toBe(true);
  });

  it('ignores .cache', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/.cache')).toBe(true);
  });

  it('ignores .git', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/.git')).toBe(true);
  });

  it('does not ignore source files', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/src')).toBe(false);
    expect(rules.shouldIgnore('/repo/src/index.ts')).toBe(false);
  });

  it('does not ignore nested src dirs', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/packages/web/src')).toBe(false);
  });

  it('ignores case-insensitively', () => {
    const rules = new IgnoreRules();
    expect(rules.shouldIgnore('/repo/Node_Modules')).toBe(true);
    expect(rules.shouldIgnore('/repo/DIST')).toBe(true);
  });

  it('accepts custom ignore patterns', () => {
    const rules = new IgnoreRules(['vendor', 'tmp']);
    expect(rules.shouldIgnore('/repo/vendor')).toBe(true);
    expect(rules.shouldIgnore('/repo/tmp')).toBe(true);
    expect(rules.shouldIgnore('/repo/node_modules')).toBe(false);
  });
});
