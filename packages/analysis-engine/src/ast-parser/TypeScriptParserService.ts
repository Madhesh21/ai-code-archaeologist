import ts from 'typescript';
import type { AstNode, AstParser, SourceLocation, ParseResult, ParseError } from './types.js';

function toAstNode(node: ts.Node, sourceFile: ts.SourceFile): AstNode {
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

  const loc: SourceLocation = {
    start: { line: start.line + 1, column: start.character + 1 },
    end: { line: end.line + 1, column: end.character + 1 },
  };

  const children: AstNode[] = [];
  ts.forEachChild(node, (child) => {
    children.push(toAstNode(child, sourceFile));
  });

  return {
    type: ts.SyntaxKind[node.kind],
    loc,
    children,
    rawNode: node,
  };
}

export class TypeScriptParserService implements AstParser {
  private readonly compilerOptions: ts.CompilerOptions;

  constructor(compilerOptions: ts.CompilerOptions = {}) {
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      strict: true,
      jsx: ts.JsxEmit.Preserve,
      ...compilerOptions,
    };
  }

  parse(source: string, filePath: string): ParseResult {
    try {
      const ext = this.getExtension(filePath);
      const scriptKind = this.getScriptKind(ext);

      const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, scriptKind);

      const diagnostics = (sourceFile as unknown as { parseDiagnostics: ts.Diagnostic[] }).parseDiagnostics;
      if (diagnostics.length > 0) {
        const diagnostic = diagnostics[0];
        const parseError: ParseError = {
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          line: (diagnostic.file ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line : 0) + 1,
          column: (diagnostic.file ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).character : 0) + 1,
        };

        return {
          success: false,
          ast: null,
          error: parseError,
          filePath,
          language: ext === '.ts' || ext === '.tsx' ? 'typescript' : 'javascript',
        };
      }

      const ast = toAstNode(sourceFile, sourceFile);

      return {
        success: true,
        ast,
        error: null,
        filePath,
        language: 'typescript',
      };
    } catch (err) {
      const parseError: ParseError = {
        message: err instanceof Error ? err.message : String(err),
        line: 0,
        column: 0,
      };

      return {
        success: false,
        ast: null,
        error: parseError,
        filePath,
        language: 'typescript',
      };
    }
  }

  supports(filePath: string): boolean {
    const ext = this.getExtension(filePath);
    return ['.ts', '.tsx', '.mts', '.cts'].includes(ext);
  }

  private getExtension(filePath: string): string {
    const dotIndex = filePath.lastIndexOf('.');
    if (dotIndex === -1) return '';
    return filePath.slice(dotIndex).toLowerCase();
  }

  private getScriptKind(ext: string): ts.ScriptKind {
    switch (ext) {
      case '.tsx':
        return ts.ScriptKind.TSX;
      case '.ts':
      case '.mts':
      case '.cts':
        return ts.ScriptKind.TS;
      default:
        return ts.ScriptKind.External;
    }
  }
}
