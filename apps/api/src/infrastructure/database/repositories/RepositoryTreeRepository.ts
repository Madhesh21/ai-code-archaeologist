import type { IRepositoryTree } from '../schemas/RepositoryTree.js';
import { RepositoryTreeModel } from '../schemas/RepositoryTree.js';
import { MongoRepository } from './MongoRepository.js';

export class RepositoryTreeRepository extends MongoRepository<IRepositoryTree> {
  protected getModel() {
    return RepositoryTreeModel;
  }

  async findByRepositoryId(repositoryId: string): Promise<IRepositoryTree | null> {
    const doc = await RepositoryTreeModel.findOne({ repositoryId }).lean();
    return this.toEntity(doc as Record<string, unknown> | null);
  }

  async deleteByRepositoryId(repositoryId: string): Promise<void> {
    await RepositoryTreeModel.deleteMany({ repositoryId });
  }
}
