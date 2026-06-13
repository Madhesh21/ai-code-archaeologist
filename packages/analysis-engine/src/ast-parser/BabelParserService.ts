import { parse as babelParse, type ParserOptions } from '@babel/parser';
import type { Node } from '@babel/types';
import type { AstNode, AstParser, SourceLocation, ParseResult, ParseError } from './types.js';

function toAstNode(node: Node): AstNode {
  const loc: SourceLocation = node.loc
    ? {
        start: { line: node.loc.start.line, column: node.loc.start.column },
        end: { line: node.loc.end.line, column: node.loc.end.column },
      }
    : { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };

  const children: AstNode[] = [];

  for (const key of Object.keys(node) as (keyof Node)[]) {
    const value = (node as unknown as Record<string, unknown>)[key];
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments') {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && 'type' in (item as object)) {
          children.push(toAstNode(item as Node));
        }
      }
    } else if (value && typeof value === 'object' && 'type' in (value as object)) {
      children.push(toAstNode(value as Node));
    }
  }

  return {
    type: node.type,
    loc,
    children,
    rawNode: node,
  };
}

export class BabelParserService implements AstParser {
  private readonly parserOptions: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.parserOptions = {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'optionalChaining',
        'nullishCoalescingOperator',
        'dynamicImport',
      ],
      ...options,
      errorRecovery: true,
    };
  }

  parse(source: string, filePath: string): ParseResult {
    try {
      const ext = this.getExtension(filePath);
      const plugins = this.getPlugins(ext);

      const result = babelParse(source, {
        ...this.parserOptions,
        plugins,
      });

      const ast = toAstNode(result as unknown as Node);

      return {
        success: true,
        ast,
        error: null,
        filePath,
        language: ext === '.ts' || ext === '.tsx' ? 'typescript' : 'javascript',
      };
    } catch (err) {
      let parseError: ParseError;
      if (err instanceof SyntaxError && 'loc' in (err as SyntaxError & { loc?: { line: number; column: number } })) {
        const syntaxErr = err as SyntaxError & { loc?: { line: number; column: number } };
        parseError = {
          message: syntaxErr.message,
          line: syntaxErr.loc?.line ?? 0,
          column: syntaxErr.loc?.column ?? 0,
        };
      } else {
        parseError = {
          message: err instanceof Error ? err.message : String(err),
          line: 0,
          column: 0,
        };
      }

      return {
        success: false,
        ast: null,
        error: parseError,
        filePath,
        language: this.detectLanguage(filePath),
      };
    }
  }

  supports(filePath: string): boolean {
    const ext = this.getExtension(filePath);
    return ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'].includes(ext);
  }

  private getExtension(filePath: string): string {
    const dotIndex = filePath.lastIndexOf('.');
    if (dotIndex === -1) return '';
    return filePath.slice(dotIndex).toLowerCase();
  }

  private getPlugins(ext: string): ParserOptions['plugins'] {
    const plugins: NonNullable<ParserOptions['plugins']> = [
      'optionalChaining',
      'nullishCoalescingOperator',
      'dynamicImport',
    ];

    if (['.jsx', '.tsx'].includes(ext)) {
      plugins.push('jsx');
    }
    if (['.ts', '.tsx', '.mts', '.cts'].includes(ext)) {
      plugins.push('typescript');
    }
    if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
      plugins.push('jsx');
    }

    return plugins;
  }

  private detectLanguage(filePath: string): 'javascript' | 'typescript' {
    const ext = this.getExtension(filePath);
    return ['.ts', '.tsx', '.mts', '.cts'].includes(ext) ? 'typescript' : 'javascript';
  }
}
