# Database Schema

## AI Codebase Archaeologist

---

## Polyglot Persistence

| Store | Technology | Responsibility |
|-------|-----------|----------------|
| Application State | MongoDB | Repositories, Analysis Jobs, Reports, Conversations |
| Repository Intelligence | Neo4j | Graph Nodes, Graph Relationships |
| Semantic Retrieval | Qdrant | Embeddings |

Do not mix responsibilities.

---

## MongoDB

### Connection

| Property | Value |
|----------|-------|
| URI | `MONGODB_URI` env variable |
| Driver | Mongoose ^8.x |
| Database | `archaeologist` (default) |

---

### Collection: repositories

**Purpose**: Stores uploaded/imported repository metadata.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | auto | — | MongoDB document ID |
| `name` | String | yes | — | Repository name |
| `status` | String | yes | `pending` | Enum: `pending`, `analyzing`, `completed`, `failed` |
| `source` | String | yes | — | Enum: `upload`, `github` |
| `createdAt` | Date | auto | — | Mongoose timestamps |
| `updatedAt` | Date | auto | — | Mongoose timestamps |

**Indexes**:
- `{ name: 1 }` — unique lookup by name
- `{ status: 1 }` — filter by processing status

---

### Collection: analyses

**Purpose**: Tracks analysis pipeline execution for repositories.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | auto | — | MongoDB document ID |
| `repositoryId` | ObjectId | yes | — | Reference to `repositories._id` |
| `status` | String | yes | `queued` | Enum: `queued`, `scanning`, `parsing`, `extracting`, `building`, `completed`, `failed` |
| `report` | Mixed | no | — | Analysis pipeline output |
| `createdAt` | Date | auto | — | Mongoose timestamps |
| `updatedAt` | Date | auto | — | Mongoose timestamps |

**Indexes**:
- `{ repositoryId: 1, createdAt: -1 }` — find latest analysis for a repository
- `{ status: 1 }` — filter by analysis state

---

### Collection: conversations

**Purpose**: Stores repository-grounded chat conversations.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | auto | — | MongoDB document ID |
| `repositoryId` | ObjectId | yes | — | Reference to `repositories._id` |
| `messages` | Array | no | `[]` | Array of message subdocuments |
| `createdAt` | Date | auto | — | Mongoose timestamps |
| `updatedAt` | Date | auto | — | Mongoose timestamps |

**Message subdocument**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | String | yes | Enum: `user`, `assistant` |
| `content` | String | yes | Message text |
| `timestamp` | Date | yes | Message creation time |

**Indexes**:
- `{ repositoryId: 1 }` — find conversations by repository

---

## Neo4j

Not yet implemented. See `GRAPH_SCHEMA.md`.

---

## Qdrant

Not yet implemented. See `RAG_ARCHITECTURE.md`.

---

## Mongoose Models

All models are defined in `apps/api/src/infrastructure/database/schemas/` and follow this pattern:

```typescript
interface IEntity { ... }
interface EntityDocument extends IEntity, Document {}
const entitySchema = new Schema<EntityDocument>({ ... }, { timestamps: true });
export const EntityModel = model<EntityDocument>('Entity', entitySchema);
```

Repository pattern implementation lives in `apps/api/src/infrastructure/database/repositories/`:

```typescript
export abstract class MongoRepository<T extends Identifiable> extends Repository<T> {
  // findById, findAll, create, update, delete
  // with automatic _id → id mapping
}
```

Concrete repositories (`RepositoryRepository`, `AnalysisRepository`, `ConversationRepository`) extend `MongoRepository` with domain-specific query methods.
