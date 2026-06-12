import neo4j, { type Driver, type Session, type Integer } from 'neo4j-driver';
import { GraphClient } from './GraphClient.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

function isInteger(value: unknown): value is Integer {
  return neo4j.isInt(value);
}

function convertIntegers(value: unknown): unknown {
  if (isInteger(value)) {
    return value.toNumber();
  }
  if (Array.isArray(value)) {
    return value.map(convertIntegers);
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      result[key] = convertIntegers(obj[key]);
    }
    return result;
  }
  return value;
}

function recordsToObjects(records: neo4j.Record[]): Record<string, unknown>[] {
  return records.map((record) => {
    const obj = record.toObject();
    return convertIntegers(obj) as Record<string, unknown>;
  });
}

export class Neo4jClient extends GraphClient {
  private driver: Driver | null = null;
  private connected = false;

  async connect(): Promise<void> {
    try {
      this.driver = neo4j.driver(
        env.NEO4J_URI,
        neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD),
        { maxConnectionPoolSize: 10 },
      );

      const serverInfo = await this.driver.getServerInfo();
      this.connected = true;
      logger.info({ address: serverInfo.address }, 'Neo4j connected');
    } catch (error) {
      this.connected = false;
      logger.error({ error }, 'Failed to connect to Neo4j');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.driver) {
        await this.driver.close();
      }
      this.connected = false;
      this.driver = null;
      logger.info('Neo4j disconnected');
    } catch (error) {
      logger.error({ error }, 'Failed to disconnect from Neo4j');
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session();
  }

  async query(cypher: string, params?: Record<string, unknown>): Promise<unknown[]> {
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        const txResult = await tx.run(cypher, params ?? {});
        return recordsToObjects(txResult.records);
      });
      return result;
    } catch (error) {
      logger.error({ error, cypher }, 'Neo4j query failed');
      throw error;
    } finally {
      await session.close();
    }
  }

  async execute(cypher: string, params?: Record<string, unknown>): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        await tx.run(cypher, params ?? {});
      });
    } catch (error) {
      logger.error({ error, cypher }, 'Neo4j execute failed');
      throw error;
    } finally {
      await session.close();
    }
  }
}
