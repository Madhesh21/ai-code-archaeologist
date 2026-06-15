import type { IEntityDefinition } from '../schemas/EntityDefinition.js';
import { EntityDefinitionModel } from '../schemas/EntityDefinition.js';
import { MongoRepository } from './MongoRepository.js';

export class EntityDefinitionRepository extends MongoRepository<IEntityDefinition> {
  protected getModel() {
    return EntityDefinitionModel;
  }

  async findByRepositoryId(repositoryId: string): Promise<IEntityDefinition[]> {
    const docs = await EntityDefinitionModel.find({ repositoryId }).lean();
    return docs
      .map((doc) => this.toEntity(doc as Record<string, unknown>))
      .filter((e): e is IEntityDefinition => e !== null);
  }

  async findByRepositoryIdAndType(
    repositoryId: string,
    type: IEntityDefinition['type'],
  ): Promise<IEntityDefinition[]> {
    const docs = await EntityDefinitionModel.find({ repositoryId, type }).lean();
    return docs
      .map((doc) => this.toEntity(doc as Record<string, unknown>))
      .filter((e): e is IEntityDefinition => e !== null);
  }

  async findByFileId(fileId: string): Promise<IEntityDefinition[]> {
    const docs = await EntityDefinitionModel.find({ fileId }).lean();
    return docs
      .map((doc) => this.toEntity(doc as Record<string, unknown>))
      .filter((e): e is IEntityDefinition => e !== null);
  }

  async deleteByRepositoryId(repositoryId: string): Promise<void> {
    await EntityDefinitionModel.deleteMany({ repositoryId });
  }
}
