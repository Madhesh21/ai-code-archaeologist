import type { ITechnologyProfile } from '../schemas/TechnologyProfile.js';
import { TechnologyProfileModel } from '../schemas/TechnologyProfile.js';
import { MongoRepository } from './MongoRepository.js';

export class TechnologyProfileRepository extends MongoRepository<ITechnologyProfile> {
  protected getModel() {
    return TechnologyProfileModel;
  }

  async findByRepositoryId(repositoryId: string): Promise<ITechnologyProfile | null> {
    const doc = await TechnologyProfileModel.findOne({ repositoryId }).lean();
    return this.toEntity(doc as Record<string, unknown> | null);
  }

  async upsert(
    repositoryId: string,
    profile: Omit<ITechnologyProfile, 'id' | 'repositoryId' | 'detectedAt'>,
  ): Promise<ITechnologyProfile> {
    const doc = await TechnologyProfileModel.findOneAndUpdate(
      { repositoryId },
      {
        $set: {
          ...profile,
          repositoryId,
          detectedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
    return this.toEntity(doc.toObject() as unknown as Record<string, unknown>) as ITechnologyProfile;
  }

  async deleteByRepositoryId(repositoryId: string): Promise<void> {
    await TechnologyProfileModel.deleteMany({ repositoryId });
  }
}
