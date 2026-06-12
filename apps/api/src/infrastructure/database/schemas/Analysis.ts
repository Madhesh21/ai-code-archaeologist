import { Schema, model } from 'mongoose';
import type { IAnalysis } from './interfaces.js';

const analysisSchema = new Schema(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'scanning', 'parsing', 'extracting', 'building', 'completed', 'failed'],
      required: true,
      default: 'queued',
    },
    report: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const AnalysisModel = model<IAnalysis>('Analysis', analysisSchema);
