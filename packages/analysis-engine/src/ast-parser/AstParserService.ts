import type { AstParser, ParseResult, AstParserOptions } from './types.js';
import { BabelParserService } from './BabelParserService.js';
import { TypeScriptParserService } from './TypeScriptParserService.js';

export class AstParserService {
  private readonly parsers: AstParser[];

  constructor(_options: AstParserOptions = {}) {
    this.parsers = [
      new TypeScriptParserService(),
      new BabelParserService(),
    ];
  }

  parse(source: string, filePath: string): ParseResult {
    const parser = this.selectParser(filePath);
    return parser.parse(source, filePath);
  }

  parseAll(
    files: Array<{ path: string; content: string }>,
  ): ParseResult[] {
    const results: ParseResult[] = [];

    for (const file of files) {
      try {
        const result = this.parse(file.content, file.path);
        results.push(result);
      } catch (err) {
        results.push({
          success: false,
          ast: null,
          error: {
            message: err instanceof Error ? err.message : String(err),
            line: 0,
            column: 0,
          },
          filePath: file.path,
          language: 'javascript',
        });
      }
    }

    return results;
  }

  private selectParser(filePath: string): AstParser {
    for (const parser of this.parsers) {
      if (parser.supports(filePath)) {
        return parser;
      }
    }
    throw new Error(`Unsupported file extension: ${filePath}`);
  }
}
