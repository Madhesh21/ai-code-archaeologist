import type { Model } from 'mongoose';
import { Repository } from './Repository.js';

type DocumentRecord = Record<string, unknown>;

export abstract class MongoRepository<T extends { id: string }> extends Repository<T> {
  protected abstract getModel(): Model<T>;

  protected toEntity(doc: DocumentRecord | null): T | null {
    if (!doc) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...rest } = doc;
    return { id: String(_id), ...rest } as unknown as T;
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.getModel().findById(id).lean();
    return this.toEntity(doc as DocumentRecord | null);
  }

  async findAll(): Promise<T[]> {
    const docs = await this.getModel().find().lean();
    return docs.map((doc) => this.toEntity(doc)).filter((e): e is T => e !== null);
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const doc = await this.getModel().create(entity);
    return this.toEntity(doc.toObject() as DocumentRecord) as T;
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    const doc = await this.getModel().findByIdAndUpdate(id, entity, { new: true }).lean();
    return this.toEntity(doc as DocumentRecord | null);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.getModel().findByIdAndDelete(id);
    return result !== null;
  }
}
