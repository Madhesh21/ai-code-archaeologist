const ENTITY_TYPE_TO_LABEL: Record<string, string> = {
  FUNCTION: 'Function',
  CLASS: 'Class',
  INTERFACE: 'Interface',
  TYPE: 'Type',
  ENUM: 'Enum',
  API_ROUTE: 'Route',
  MODEL: 'Model',
  SERVICE: 'Service',
  MIDDLEWARE: 'Middleware',
  HOOK: 'Hook',
  COMPONENT: 'Component',
  FILE: 'File',
  FOLDER: 'Folder',
};

export function mapEntityTypeToLabel(entityType: string): string | undefined {
  return ENTITY_TYPE_TO_LABEL[entityType];
}

export function getValidRelationshipTypes(): string[] {
  return [
    'CONTAINS',
    'IMPORTS',
    'EXPORTS',
    'CALLS',
    'USES',
    'READS',
    'WRITES',
    'DEPENDS_ON',
    'IMPLEMENTS',
    'EXTENDS',
    'EXPOSES',
    'RETURNS',
  ];
}

export function isValidRelationshipType(type: string): boolean {
  return getValidRelationshipTypes().includes(type);
}
