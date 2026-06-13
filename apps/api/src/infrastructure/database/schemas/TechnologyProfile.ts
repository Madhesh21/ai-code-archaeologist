import { Schema, model } from 'mongoose';

export interface ITechnologyProfile {
  repositoryId: string;
  frontend: string[];
  backend: string[];
  database: string[];
  infrastructure: string[];
  testing: string[];
  ciCd: string[];
  detectedAt: Date;
}

const technologyProfileSchema = new Schema<ITechnologyProfile>({
  repositoryId: { type: String, required: true, index: true, unique: true },
  frontend: { type: [String], default: [] },
  backend: { type: [String], default: [] },
  database: { type: [String], default: [] },
  infrastructure: { type: [String], default: [] },
  testing: { type: [String], default: [] },
  ciCd: { type: [String], default: [] },
  detectedAt: { type: Date, required: true, default: Date.now },
});

export const TechnologyProfileModel = model<ITechnologyProfile>(
  'TechnologyProfile',
  technologyProfileSchema,
);
