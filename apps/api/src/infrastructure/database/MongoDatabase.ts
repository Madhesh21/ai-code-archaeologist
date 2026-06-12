import mongoose from 'mongoose';
import { Database } from './Database.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

export class MongoDatabase extends Database {
  private connected = false;

  async connect(): Promise<void> {
    try {
      await mongoose.connect(env.MONGODB_URI);
      this.connected = true;
      logger.info('MongoDB connected');

      mongoose.connection.on('error', (error) => {
        logger.error({ error }, 'MongoDB connection error');
      });

      mongoose.connection.on('disconnected', () => {
        this.connected = false;
        logger.warn('MongoDB disconnected');
      });
    } catch (error) {
      logger.error({ error }, 'Failed to connect to MongoDB');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.connected = false;
      logger.info('MongoDB disconnected');
    } catch (error) {
      logger.error({ error }, 'Failed to disconnect from MongoDB');
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
