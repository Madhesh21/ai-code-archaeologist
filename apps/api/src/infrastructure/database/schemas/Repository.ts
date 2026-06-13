import { Schema, model } from 'mongoose';
import type { IRepository } from './interfaces.js';

const repositorySchema = new Schema<IRepository>(
  {
    name: { type: String, required: true },
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
        'report_generating',
        'ready',
        'failed',
      ],
      required: true,
      default: 'pending',
    },
  },
  { timestamps: true },
);

export const RepositoryModel = model<IRepository>('Repository', repositorySchema);
