import { Schema, model } from 'mongoose';

export interface IRelationship {
  id: string;
  repositoryId: string;
  sourceEntityId: string;
  targetEntityId: string;
  sourceEntityName: string;
  targetEntityName: string;
  type: string;
  filePath: string;
  startLine: number;
  endLine: number;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const relationshipSchema = new Schema<IRelationship>(
  {
    repositoryId: { type: String, required: true, index: true },
    sourceEntityId: { type: String, required: true },
    targetEntityId: { type: String, required: true },
    sourceEntityName: { type: String, required: true },
    targetEntityName: { type: String, required: true },
    type: { type: String, required: true, index: true },
    filePath: { type: String, required: true },
    startLine: { type: Number, required: true },
    endLine: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

relationshipSchema.index({ repositoryId: 1, type: 1 });
relationshipSchema.index({ sourceEntityId: 1 });
relationshipSchema.index({ targetEntityId: 1 });

export const RelationshipModel = model<IRelationship>('Relationship', relationshipSchema);
