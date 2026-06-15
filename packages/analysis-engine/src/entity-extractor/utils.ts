export function generateEntityId(
  repositoryId: string,
  filePath: string,
  type: string,
  name: string,
): string {
  const safePath = filePath.replace(/[/\\:]/g, '_');
  return `${repositoryId}:${type.toLowerCase()}:${name}:${safePath}`;
}

export function generateRelationshipId(
  repositoryId: string,
  type: string,
  sourceEntityId: string,
  targetEntityId: string,
): string {
  return `${repositoryId}:${type.toLowerCase()}:${sourceEntityId}:${targetEntityId}`;
}
