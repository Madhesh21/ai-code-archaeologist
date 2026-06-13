import type { IRepository } from '../schemas/interfaces.js';
import { RepositoryModel } from '../schemas/Repository.js';
import { MongoRepository } from './MongoRepository.js';

export class RepositoryRepository extends MongoRepository<IRepository> {
  protected getModel() {
    return RepositoryModel;
  }

  async findByStatus(status: IRepository['status']): Promise<IRepository[]> {
    const docs = await RepositoryModel.find({ status }).lean();
    return docs.map((doc) => this.toEntity(doc as Record<string, unknown>) as IRepository);
  }

  async findByName(name: string): Promise<IRepository | null> {
    const doc = await RepositoryModel.findOne({ name }).lean();
    return this.toEntity(doc as Record<string, unknown> | null);
  }

  async updateStatus(id: string, status: IRepository['status']): Promise<IRepository | null> {
    return this.update(id, { status } as Partial<IRepository>);
  }
}
