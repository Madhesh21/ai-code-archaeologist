import { Schema, model } from 'mongoose';
import type { IRepository } from './interfaces.js';

const repositorySchema = new Schema<IRepository>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    sourceType: {
      type: String,
      enum: ['upload', 'github'],
      required: true,
    },
    sourceUrl: { type: String },
    localPath: { type: String },
    status: {
      type: String,
      enum: [
        'pending',
        'uploaded',
        'scanning',
        'analyzing',
        'graph_building',
        'embedding',
        'report_generating',
        'ready',
        'failed',
      ],
      required: true,
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true },
);

repositorySchema.index({ createdAt: 1 });

export const RepositoryModel = model<IRepository>('Repository', repositorySchema);
