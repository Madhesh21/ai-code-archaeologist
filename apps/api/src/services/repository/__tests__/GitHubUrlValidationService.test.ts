import { describe, it, expect } from 'vitest';
import { ValidationError } from '../../../utils/errors.js';
import { GitHubUrlValidationService } from '../GitHubUrlValidationService.js';

describe('GitHubUrlValidationService', () => {
  const service = new GitHubUrlValidationService();

  describe('validate', () => {
    it('accepts valid GitHub HTTPS URL', () => {
      const result = service.validate('https://github.com/owner/repo');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    it('accepts URLs with .git suffix', () => {
      const result = service.validate('https://github.com/owner/repo.git');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    it('accepts URLs with trailing slash', () => {
      const result = service.validate('https://github.com/owner/repo/');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    it('rejects non-GitHub URLs', () => {
      expect(() => service.validate('https://gitlab.com/owner/repo')).toThrow(ValidationError);
    });

    it('rejects URLs without owner and repo', () => {
      expect(() => service.validate('https://github.com')).toThrow(ValidationError);
    });

    it('rejects URLs with only owner', () => {
      expect(() => service.validate('https://github.com/owner')).toThrow(ValidationError);
    });

    it('rejects empty string', () => {
      expect(() => service.validate('')).toThrow(ValidationError);
    });

    it('rejects non-URL text', () => {
      expect(() => service.validate('not-a-url')).toThrow(ValidationError);
    });
  });
});
