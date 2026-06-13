import { Schema, model } from 'mongoose';
import type { IConversation } from './interfaces.js';

const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const conversationSchema = new Schema(
  {
    repositoryId: {
      type: String,
      required: true,
      index: true,
    },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true },
);

export const ConversationModel = model<IConversation>('Conversation', conversationSchema);
