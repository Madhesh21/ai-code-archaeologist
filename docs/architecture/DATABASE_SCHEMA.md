# DATABASE_SCHEMA.md

# AI Codebase Archaeologist

Version: 1.0

Purpose: Define all persistence models, storage responsibilities, database boundaries, indexing strategy, lifecycle rules, and retention policies.

---

# Database Architecture

The platform uses three storage systems.

```text
                    Repository Upload

                             │

                             ▼

                   Analysis Pipeline

                             │

        ┌────────────────────┼────────────────────┐

        ▼                    ▼                    ▼

    MongoDB               Neo4j               Qdrant

Operational Data     Knowledge Graph     Semantic Search
```

---

# Storage Responsibilities

## MongoDB

Stores:

* Repositories
* Analysis Jobs
* Reports
* Technology Profiles
* Conversations
* Messages
* Application Metadata

MongoDB is the source of truth for application state.

---

## Neo4j

Stores:

* Repository Graph
* Nodes
* Relationships
* Dependency Network
* Flow Structures

Neo4j is the source of truth for repository intelligence.

---

## Qdrant

Stores:

* Embeddings
* Semantic Indexes

Qdrant is the source of truth for retrieval.

---

# MongoDB Collections

---

# Collection: repositories

Represents uploaded repositories.

---

## Schema

```json
{
  "_id": "ObjectId",

  "name": "string",

  "description": "string",

  "sourceType": "github | zip",

  "sourceUrl": "string",

  "localPath": "string",

  "status": "enum",

  "createdAt": "Date",

  "updatedAt": "Date"
}
```

---

## Status Values

```text
PENDING

UPLOADED

SCANNING

ANALYZING

GRAPH_BUILDING

REPORT_GENERATING

READY

FAILED
```

---

## Indexes

```javascript
name

status

createdAt
```

---

# Collection: analyses

Stores analysis executions.

---

## Schema

```json
{
  "_id": "ObjectId",

  "repositoryId": "ObjectId",

  "status": "string",

  "startedAt": "Date",

  "completedAt": "Date",

  "durationMs": "number",

  "errors": []
}
```

---

## Status Values

```text
QUEUED

RUNNING

COMPLETED

FAILED
```

---

## Indexes

```javascript
repositoryId

status
```

---

# Collection: technology_profiles

Stores detected technologies.

---

## Schema

```json
{
  "_id": "ObjectId",

  "repositoryId": "ObjectId",

  "frontend": [],

  "backend": [],

  "database": [],

  "infrastructure": [],

  "testing": [],

  "ciCd": []
}
```

---

## Example

```json
{
  "frontend": ["React"],

  "backend": ["Express"],

  "database": ["MongoDB"]
}
```

---

# Collection: reports

Stores generated archaeological reports.

---

## Schema

```json
{
  "_id": "ObjectId",

  "repositoryId": "ObjectId",

  "executiveSummary": "string",

  "technologySummary": "string",

  "architectureSummary": "string",

  "apiInventory": {},

  "dependencyOverview": {},

  "generatedAt": "Date"
}
```

---

## Indexes

```javascript
repositoryId
```

---

# Collection: flows

Stores generated execution flows.

---

## Schema

```json
{
  "_id": "ObjectId",

  "repositoryId": "ObjectId",

  "name": "string",

  "steps": [],

  "generatedAt": "Date"
}
```

---

## Example

```json
{
  "name": "Login Flow",

  "steps": [
    "LoginPage",
    "AuthService",
    "AuthController",
    "UserModel"
  ]
}
```

---

# Collection: conversations

Stores repository-specific conversations.

---

## Schema

```json
{
  "_id": "ObjectId",

  "repositoryId": "ObjectId",

  "createdAt": "Date",

  "updatedAt": "Date"
}
```

---

# Collection: messages

Stores conversation messages.

---

## Schema

```json
{
  "_id": "ObjectId",

  "conversationId": "ObjectId",

  "role": "user | assistant",

  "content": "string",

  "createdAt": "Date"
}
```

---

## Indexes

```javascript
conversationId

createdAt
```

---

# Collection: repository_trees

Stores scan results (repository file inventory).

---

## Schema

```json
{
  "_id": "ObjectId",

  "repositoryId": "ObjectId",

  "files": [
    {
      "path": "",
      "extension": "",
      "size": 0,
      "hash": ""
    }
  ],

  "folders": [
    {
      "path": ""
    }
  ],

  "scannedAt": "Date"
}
```

---

## Indexes

```javascript
repositoryId
```

---

# Collection: repository_statistics

Stores aggregated metrics.

---

## Schema

```json
{
  "_id": "ObjectId",

  "repositoryId": "ObjectId",

  "fileCount": 0,

  "folderCount": 0,

  "functionCount": 0,

  "classCount": 0,

  "routeCount": 0,

  "modelCount": 0,

  "relationshipCount": 0
}
```

---

# Neo4j Persistence Model

Neo4j stores repository intelligence.

MongoDB never stores graph relationships.

---

# Node Labels

```cypher
Repository

Folder

File

Function

Class

Interface

Type

Enum

Service

Middleware

Hook

Component

Route

Model
```

---

# Relationship Types

```cypher
CONTAINS

IMPORTS

EXPORTS

CALLS

USES

READS

WRITES

DEPENDS_ON

IMPLEMENTS

EXTENDS

EXPOSES

RETURNS
```

---

# Repository Isolation

Every graph node must contain:

```cypher
repositoryId
```

property.

Example:

```cypher
(:Function {
  id:"fn_123",
  name:"login",
  repositoryId:"repo_1"
})
```

---

# Required Neo4j Constraints

---

## Repository ID

```cypher
CREATE CONSTRAINT repository_id_unique
IF NOT EXISTS
FOR (r:Repository)
REQUIRE r.id IS UNIQUE
```

---

## File ID

```cypher
CREATE CONSTRAINT file_id_unique
IF NOT EXISTS
FOR (f:File)
REQUIRE f.id IS UNIQUE
```

---

## Function ID

```cypher
CREATE CONSTRAINT function_id_unique
IF NOT EXISTS
FOR (f:Function)
REQUIRE f.id IS UNIQUE
```

---

## Route ID

```cypher
CREATE CONSTRAINT route_id_unique
IF NOT EXISTS
FOR (r:Route)
REQUIRE r.id IS UNIQUE
```

---

## Model ID

```cypher
CREATE CONSTRAINT model_id_unique
IF NOT EXISTS
FOR (m:Model)
REQUIRE m.id IS UNIQUE
```

---

# Required Neo4j Indexes

```cypher
Repository.id

File.path

Function.name

Class.name

Route.path

Model.name
```

---

# Qdrant Collections

---

# Collection: repository_entities

Stores semantic embeddings.

---

## Payload Structure

```json
{
  "repositoryId": "string",

  "entityId": "string",

  "entityType": "Function",

  "entityName": "login",

  "filePath": "src/auth/login.ts"
}
```

---

# Embedding Sources

Only embed:

* Functions
* Classes
* Routes
* Components
* Services

Do not embed entire repositories.

Do not embed entire files.

---

# Embedding Granularity

---

## Good

```text
AuthService.login()
```

---

## Good

```text
POST /login
```

---

## Bad

```text
5000-line file
```

---

# Data Retention Policy

---

## Repository Deletion

When repository deleted:

Delete:

* Repository
* Analyses
* Reports
* Flows
* Conversations
* Messages
* Neo4j Nodes
* Neo4j Relationships
* Qdrant Embeddings

---

## Cascading Rule

Repository is aggregate root.

Everything below it must be removed.

---

# Analysis Lifecycle

```text
Repository Created

↓

Analysis Queued

↓

Analysis Running

↓

Graph Building

↓

Report Generation

↓

Ready
```

---

# Transaction Strategy

---

## MongoDB

Used for:

* Repository metadata
* Analysis state

Must support transactions.

---

## Neo4j

Graph built in batches.

Never create relationships before nodes.

Build Order:

1. Nodes
2. Structural Edges
3. Semantic Edges

---

## Qdrant

Embeddings inserted after graph generation.

Never embed before entity extraction.

---

# Backup Strategy

MongoDB

Daily backup.

---

Neo4j

Daily graph snapshot.

---

Qdrant

Daily vector snapshot.

---

# Performance Targets

---

## MongoDB

Repository fetch:

< 100 ms

---

## Neo4j

Graph traversal:

< 500 ms

---

## Qdrant

Vector retrieval:

< 300 ms

---

# Data Integrity Rules

Rule 1

Every repository must have exactly one active graph.

---

Rule 2

Every graph node must belong to one repository.

---

Rule 3

Every embedding must reference a valid entity.

---

Rule 4

Relationships cannot exist without source and target nodes.

---

Rule 5

Repository deletion must cascade through all databases.

---

# Golden Rule

Store state in MongoDB.

Store intelligence in Neo4j.

Store semantics in Qdrant.

Never mix responsibilities between databases.
