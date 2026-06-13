import { MongoDatabase } from './MongoDatabase.js';
import { Neo4jClient } from '../graph/Neo4jClient.js';

export const mongoDatabase = new MongoDatabase();
export const neo4jClient = new Neo4jClient();
