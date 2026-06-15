import type { IRelationship } from '../schemas/Relationship.js';
import { RelationshipModel } from '../schemas/Relationship.js';
import { MongoRepository } from './MongoRepository.js';

export class RelationshipRepository extends MongoRepository<IRelationship> {
  protected getModel() {
    return RelationshipModel;
  }

  async findByRepositoryId(repositoryId: string): Promise<IRelationship[]> {
    const docs = await RelationshipModel.find({ repositoryId }).lean();
    return docs
      .map((doc) => this.toEntity(doc as Record<string, unknown>))
      .filter((e): e is IRelationship => e !== null);
  }

  async findByRepositoryIdAndType(
    repositoryId: string,
    type: string,
  ): Promise<IRelationship[]> {
    const docs = await RelationshipModel.find({ repositoryId, type }).lean();
    return docs
      .map((doc) => this.toEntity(doc as Record<string, unknown>))
      .filter((e): e is IRelationship => e !== null);
  }

  async deleteByRepositoryId(repositoryId: string): Promise<void> {
    await RelationshipModel.deleteMany({ repositoryId });
  }
}
