# DOMAIN_MODEL.md

# AI Codebase Archaeologist

Version: 1.0

Purpose: Define the core business entities, relationships, ownership boundaries, and lifecycle of the system.

---

# Overview

AI Codebase Archaeologist transforms a source code repository into a structured knowledge system.

The domain model defines:

* Core entities
* Entity relationships
* Ownership rules
* Lifecycle states
* Aggregate boundaries

This document serves as the source of truth for:

* Database design
* API contracts
* Knowledge graph construction
* Analysis pipeline implementation

---

# Core Domain Concepts

The platform revolves around four primary concepts:

1. Repository
2. Analysis
3. Knowledge Graph
4. Conversation

---

# Entity: Repository

Represents a source code repository uploaded by a user.

---

## Responsibilities

* Store repository metadata
* Track analysis status
* Serve as root aggregate

---

## Fields

```yaml
Repository:
  id: string
  name: string
  description: string
  sourceType: enum
  sourceUrl: string
  localPath: string
  status: enum
  createdAt: datetime
  updatedAt: datetime
```

---

## Status Values

```yaml
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

## Relationships

```text
Repository
    |
    | owns
    v
Analysis

Repository
    |
    | owns
    v
Report

Repository
    |
    | owns
    v
Conversation

Repository
    |
    | owns
    v
Knowledge Graph
```

---

# Entity: Analysis

Represents one complete repository analysis execution.

---

## Responsibilities

* Track processing progress
* Store analysis metadata
* Maintain auditability

---

## Fields

```yaml
Analysis:
  id: string
  repositoryId: string
  status: enum
  startedAt: datetime
  completedAt: datetime
  durationMs: number
  errors: array
```

---

## Status Values

```yaml
QUEUED

RUNNING

COMPLETED

FAILED
```

---

# Entity: TechnologyProfile

Represents detected technologies.

---

## Responsibilities

Identify stack composition.

---

## Fields

```yaml
TechnologyProfile:
  id: string
  repositoryId: string

  frontend:
    - string

  backend:
    - string

  database:
    - string

  infrastructure:
    - string

  testing:
    - string

  ciCd:
    - string
```

---

# Entity: File

Represents a source code file.

---

## Responsibilities

* Store metadata
* Act as graph node source

---

## Fields

```yaml
File:
  id: string
  repositoryId: string
  path: string
  extension: string
  size: number
  hash: string
```

---

## Examples

```text
src/controllers/authController.ts

src/routes/authRoutes.ts

src/models/User.ts
```

---

# Entity: Folder

Represents a repository directory.

---

## Fields

```yaml
Folder:
  id: string
  repositoryId: string
  path: string
```

---

# Entity: EntityDefinition

Represents a discovered code entity.

This is the most important domain object.

---

## Responsibilities

Represent code structures discovered during analysis.

---

## Supported Types

```yaml
FUNCTION

CLASS

INTERFACE

TYPE

ENUM

API_ROUTE

MODEL

SERVICE

MIDDLEWARE

HOOK

COMPONENT
```

---

## Fields

```yaml
EntityDefinition:
  id: string
  repositoryId: string
  fileId: string

  name: string
  type: string

  startLine: number
  endLine: number

  metadata: object
```

---

## Examples

```text
login()

AuthService

UserModel

POST /login

authMiddleware
```

---

# Entity: Relationship

Represents a connection between two entities.

---

## Responsibilities

Create repository intelligence.

---

## Fields

```yaml
Relationship:
  id: string

  sourceEntityId: string
  targetEntityId: string

  type: string

  confidence: number
```

---

## Relationship Types

```yaml
IMPORTS

EXPORTS

CALLS

USES

READS

WRITES

DEPENDS_ON

RETURNS

IMPLEMENTS

EXTENDS

CONTAINS

EXPOSES
```

---

# Entity: KnowledgeGraph

Represents graph representation of repository.

---

## Responsibilities

Provide repository understanding.

---

## Fields

```yaml
KnowledgeGraph:
  id: string
  repositoryId: string

  nodeCount: number
  edgeCount: number

  generatedAt: datetime
```

---

# Entity: APIEndpoint

Represents discovered API routes.

---

## Fields

```yaml
APIEndpoint:
  id: string

  repositoryId: string

  method: string
  path: string

  controller: string

  filePath: string
```

---

## Examples

```text
POST /login

POST /register

GET /profile
```

---

# Entity: DataModel

Represents persistence models.

---

## Fields

```yaml
DataModel:
  id: string

  repositoryId: string

  name: string

  databaseType: string

  fields:
    - name
    - type
```

---

## Examples

```text
User

Product

Order
```

---

# Entity: Flow

Represents reconstructed execution path.

---

## Responsibilities

Explain feature behavior.

---

## Fields

```yaml
Flow:
  id: string

  repositoryId: string

  name: string

  startNode: string

  steps: array

  generatedAt: datetime
```

---

## Examples

```text
Login Flow

Checkout Flow

Registration Flow
```

---

# Entity: ArchaeologicalReport

Generated repository report.

---

## Fields

```yaml
ArchaeologicalReport:
  id: string

  repositoryId: string

  executiveSummary: string

  technologySummary: string

  architectureSummary: string

  apiInventory: object

  dependencyOverview: object

  generatedAt: datetime
```

---

# Entity: Conversation

Repository-specific chat session.

---

## Fields

```yaml
Conversation:
  id: string

  repositoryId: string

  createdAt: datetime
```

---

# Entity: Message

Chat message.

---

## Fields

```yaml
Message:
  id: string

  conversationId: string

  role: string

  content: string

  createdAt: datetime
```

---

# Aggregate Boundaries

Repository is the root aggregate.

```text
Repository
├── Analysis
├── TechnologyProfile
├── Files
├── Entities
├── Relationships
├── Flows
├── Reports
└── Conversations
```

---

# Ownership Rules

Repository owns:

* Files
* Entities
* Relationships
* Reports
* Flows
* Conversations

Deleting a repository must cascade delete all owned resources.

---

# Invariants

The following must always be true.

---

## Rule 1

Every EntityDefinition belongs to exactly one File.

---

## Rule 2

Every File belongs to exactly one Repository.

---

## Rule 3

Every Relationship must reference valid entities.

---

## Rule 4

A Repository can have multiple Analyses.

---

## Rule 5

Only one Analysis may be RUNNING for a Repository at a time.

---

## Rule 6

KnowledgeGraph must never contain orphaned nodes.

---

# Future Extensions

Reserved domain concepts.

```yaml
Organization

Workspace

Team

PrivateRepository

RepositoryVersion

ImpactAnalysis

RepositoryHealth

CrossRepositoryGraph
```

These concepts are intentionally excluded from MVP.
