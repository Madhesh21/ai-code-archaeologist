import type { IConversation, IMessage } from '../schemas/interfaces.js';
import { ConversationModel } from '../schemas/Conversation.js';
import { MongoRepository } from './MongoRepository.js';

export class ConversationRepository extends MongoRepository<IConversation> {
  protected getModel() {
    return ConversationModel;
  }

  async findByRepositoryId(repositoryId: string): Promise<IConversation[]> {
    const docs = await ConversationModel.find({ repositoryId }).lean();
    return docs.map((doc) => this.toEntity(doc as Record<string, unknown>) as IConversation);
  }

  async addMessage(conversationId: string, message: IMessage): Promise<IConversation | null> {
    const doc = await ConversationModel.findByIdAndUpdate(
      conversationId,
      { $push: { messages: message } },
      { new: true },
    ).lean();
    return this.toEntity(doc as Record<string, unknown> | null);
  }
}
