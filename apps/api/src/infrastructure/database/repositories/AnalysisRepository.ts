import type { IAnalysis } from '../schemas/interfaces.js';
import { AnalysisModel } from '../schemas/Analysis.js';
import { MongoRepository } from './MongoRepository.js';

export class AnalysisRepository extends MongoRepository<IAnalysis> {
  protected getModel() {
    return AnalysisModel;
  }

  async findByRepositoryId(repositoryId: string): Promise<IAnalysis[]> {
    const docs = await AnalysisModel.find({ repositoryId }).lean();
    return docs.map((doc) => this.toEntity(doc as Record<string, unknown>) as IAnalysis);
  }

  async findLatestByRepositoryId(repositoryId: string): Promise<IAnalysis | null> {
    const doc = await AnalysisModel.findOne({ repositoryId }).sort({ createdAt: -1 }).lean();
    return this.toEntity(doc as Record<string, unknown> | null);
  }
}
