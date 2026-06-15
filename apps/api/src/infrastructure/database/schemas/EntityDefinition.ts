import { Schema, model } from 'mongoose';

export interface IEntityDefinition {
  id: string;
  repositoryId: string;
  fileId: string;
  filePath: string;
  name: string;
  type: EntityType;
  startLine?: number;
  endLine?: number;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EntityType =
  | 'FUNCTION'
  | 'CLASS'
  | 'INTERFACE'
  | 'TYPE'
  | 'ENUM'
  | 'API_ROUTE'
  | 'MODEL'
  | 'SERVICE'
  | 'MIDDLEWARE'
  | 'HOOK'
  | 'COMPONENT';

const entityDefinitionSchema = new Schema<IEntityDefinition>(
  {
    repositoryId: { type: String, required: true, index: true },
    fileId: { type: String, required: true },
    filePath: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'FUNCTION',
        'CLASS',
        'INTERFACE',
        'TYPE',
        'ENUM',
        'API_ROUTE',
        'MODEL',
        'SERVICE',
        'MIDDLEWARE',
        'HOOK',
        'COMPONENT',
      ],
      required: true,
      index: true,
    },
    startLine: { type: Number },
    endLine: { type: Number },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

entityDefinitionSchema.index({ repositoryId: 1, type: 1 });
entityDefinitionSchema.index({ fileId: 1 });

export const EntityDefinitionModel = model<IEntityDefinition>('EntityDefinition', entityDefinitionSchema);
