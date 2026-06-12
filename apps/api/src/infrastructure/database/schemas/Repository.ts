import { Schema, model } from 'mongoose';
import type { IRepository } from './interfaces.js';

const repositorySchema = new Schema<IRepository>(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'analyzing', 'completed', 'failed'],
      required: true,
      default: 'pending',
    },
    source: {
      type: String,
      enum: ['upload', 'github'],
      required: true,
    },
  },
  { timestamps: true },
);

export const RepositoryModel = model<IRepository>('Repository', repositorySchema);
