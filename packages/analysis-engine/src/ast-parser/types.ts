export type SourceLanguage = 'javascript' | 'typescript';

export interface SourceLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface AstNode {
  type: string;
  loc: SourceLocation;
  children: AstNode[];
  rawNode: unknown;
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
}

export interface ParseResult {
  success: boolean;
  ast: AstNode | null;
  error: ParseError | null;
  filePath: string;
  language: SourceLanguage;
}

export interface AstParser {
  parse(source: string, filePath: string): ParseResult;
  supports(filePath: string): boolean;
}

export interface AstParserOptions {
  jsx?: boolean;
  typescript?: boolean;
}
