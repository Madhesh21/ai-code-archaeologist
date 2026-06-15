import type { IFlow } from '../schemas/interfaces.js';
import { FlowModel } from '../schemas/Flow.js';
import { MongoRepository } from './MongoRepository.js';

export class FlowRepository extends MongoRepository<IFlow> {
  protected getModel() {
    return FlowModel;
  }

  async findByRepositoryId(repositoryId: string): Promise<IFlow[]> {
    const docs = await FlowModel.find({ repositoryId }).lean();
    return docs.map((doc) => this.toEntity(doc as Record<string, unknown>) as IFlow);
  }

  async findByName(repositoryId: string, name: string): Promise<IFlow | null> {
    const doc = await FlowModel.findOne({ repositoryId, name }).lean();
    return this.toEntity(doc as Record<string, unknown> | null);
  }
}
