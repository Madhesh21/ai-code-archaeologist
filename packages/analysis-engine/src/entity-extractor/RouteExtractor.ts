import type { AstNode } from '../ast-parser/types.js';
import type { ExtractedEntity, EntityExtractor, ExtractorOptions } from './types.js';
import { getNodeText } from './SourceHelper.js';

const EXPRESS_METHODS = new Set([
  'get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'all',
]);

const ROUTER_NAMES = new Set([
  'Router', 'router', 'app', 'route',
]);

export class RouteExtractor implements EntityExtractor {
  readonly type = 'API_ROUTE' as const;

  extract(options: ExtractorOptions): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const calls = this.findCallExpressions(options.ast);

    for (const call of calls) {
      const routeInfo = this.parseExpressRoute(call, options.content);
      if (!routeInfo) continue;

      entities.push({
        id: '',
        repositoryId: options.repositoryId,
        fileId: options.fileId,
        filePath: options.filePath,
        name: `${routeInfo.method} ${routeInfo.path}`,
        type: 'API_ROUTE',
        startLine: call.loc?.start.line ?? 0,
        endLine: call.loc?.end.line ?? 0,
        metadata: {
          method: routeInfo.method,
          path: routeInfo.path,
          handler: routeInfo.handler,
        },
      });
    }

    return entities;
  }

  private findCallExpressions(node: AstNode): AstNode[] {
    const result: AstNode[] = [];
    if (!node.children) return result;

    for (const child of node.children) {
      if (child.type === 'CallExpression' || child.type === 'OptionalCallExpression') {
        result.push(child);
      }
      result.push(...this.findCallExpressions(child));
    }
    return result;
  }

  private parseExpressRoute(
    call: AstNode,
    source: string,
  ): { method: string; path: string; handler?: string } | null {
    if (!call.children || call.children.length < 2) return null;

    const callee = call.children.find(
      (c) =>
        c.type === 'MemberExpression' ||
        c.type === 'PropertyAccessExpression' ||
        c.type === 'ComputedMemberExpression' ||
        c.type === 'ElementAccessExpression' ||
        c.type === 'Identifier',
    );
    if (!callee) return null;

    let httpMethod: string | null = null;
    let isRouteChain = false;

    if (callee.type === 'Identifier' && callee.children) {
      // Direct call like `Router()`
      return null;
    }

    if (callee.children && callee.children.length >= 2) {
      const property = callee.children[callee.children.length - 1];
      const object = callee.children[0];

      const propName = getNodeText(property, source);
      const objName = getNodeText(object, source);

      if (propName && EXPRESS_METHODS.has(propName.toLowerCase())) {
        httpMethod = propName.toUpperCase();
      }

      if (objName && ROUTER_NAMES.has(objName)) {
        isRouteChain = true;
      }
    }

    if (!httpMethod || !isRouteChain) return null;

    // First argument should be the route path
    const pathArg = call.children.find(
      (c) => c.type === 'StringLiteral' || c.type === 'TemplateLiteral',
    );
    const path = pathArg ? getNodeText(pathArg, source)?.replace(/['"`]/g, '') ?? '/' : '/';

    // Second argument might be the handler
    const handlerArg = call.children
      .filter((c) => c !== callee && c !== pathArg)
      .find((c) => c.type === 'Identifier');
    const handler = handlerArg ? getNodeText(handlerArg, source) : undefined;

    return { method: httpMethod, path, handler };
  }
}
