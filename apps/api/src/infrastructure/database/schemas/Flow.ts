import { Schema, model } from 'mongoose';
import type { IFlow, IFlowStep } from './interfaces.js';

const flowStepSchema = new Schema(
  {
    nodeId: { type: String, required: true },
    nodeName: { type: String, required: true },
    nodeType: { type: String, required: true },
    filePath: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const flowSchema = new Schema(
  {
    repositoryId: {
      type: String,
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    startNode: { type: String, required: true },
    steps: { type: [flowStepSchema], default: [] },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const FlowModel = model<IFlow>('Flow', flowSchema);
