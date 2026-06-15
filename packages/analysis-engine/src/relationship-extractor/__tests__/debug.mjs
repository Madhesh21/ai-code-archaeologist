import { AstParserService } from '../../../dist/ast-parser/AstParserService.js';
import { collectImports } from '../../../dist/entity-extractor/ImportExportCollector.js';

const parser = new AstParserService();

function printNodes(node, depth = 0) {
  if (depth > 6) return;
  const indent = '  '.repeat(depth);
  const loc = node.loc
    ? `[${node.loc.start.line}:${node.loc.start.column}-${node.loc.end.line}:${node.loc.end.column}]`
    : '';
  console.log(indent + node.type + ' ' + loc);
  if (node.children) {
    for (const child of node.children) {
      printNodes(child, depth + 1);
    }
  }
}

// Test 1: CallExpression structure
console.log('=== CallExpression AST ===');
let result = parser.parse('function greet() { return 1; }\nfunction main() { greet(); }', 'test.ts');
printNodes(result.ast);

// Test 2: Import structure
console.log("\n=== Import AST ===");
result = parser.parse("import { AuthService } from './auth';", 'test.ts');
printNodes(result.ast);
const imports = collectImports(result.ast, "import { AuthService } from './auth';");
console.log('\nCollectImports result:', JSON.stringify(imports));

// Test 3: Class structure
console.log("\n=== Class AST ===");
result = parser.parse('interface IRepo {}\nclass UserRepo implements IRepo {}', 'test.ts');
printNodes(result.ast);
