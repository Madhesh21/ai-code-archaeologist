# ANALYSIS_PIPELINE.md

# AI Codebase Archaeologist

Version: 1.0

Purpose:
Define the complete repository analysis pipeline, processing stages, inputs, outputs, responsibilities, failure handling, and implementation constraints.

This document is the source of truth for:

* Repository Analysis Engine
* Entity Extraction Engine
* Relationship Extraction Engine
* Knowledge Graph Builder
* Embedding Generation Pipeline

---

# Overview

The analysis pipeline transforms a source code repository into structured repository intelligence.

The process is deterministic.

The same repository should always produce the same analysis output.

---

# Pipeline Goals

Convert:

```text
Source Code
```

Into:

```text
Repository Intelligence
```

Artifacts Produced:

* Repository Tree
* Technology Profile
* Entities
* Relationships
* Knowledge Graph
* Embeddings
* Flows
* Archaeological Report

---

# Pipeline Architecture

```text
Repository

↓

Repository Ingestion

↓

Repository Scan

↓

Technology Detection

↓

AST Parsing

↓

Entity Extraction

↓

Relationship Extraction

↓

Graph Construction

↓

Embedding Generation

↓

Flow Reconstruction

↓

Report Generation

↓

Ready
```

---

# Processing Principles

---

## Principle 1

AST Before Intelligence

No graph relationship may be created before AST analysis.

---

## Principle 2

Deterministic Outputs

Pipeline must be repeatable.

---

## Principle 3

Partial Failure Tolerance

One malformed file must not stop repository analysis.

---

## Principle 4

Graph First

Repository understanding originates from graph construction.

---

# Stage 0

Repository Ingestion

---

## Purpose

Acquire repository.

---

## Inputs

GitHub URL

or

ZIP Archive

---

## Outputs

Local Repository Directory

---

## Responsibilities

* Clone repository
* Extract ZIP
* Validate structure
* Assign repositoryId

---

## Validation Rules

Reject:

```text
Corrupt ZIP

Unsupported archive

Empty repository
```

---

## Success Criteria

Repository exists locally.

---

# Stage 1

Repository Scan

---

## Purpose

Discover repository structure.

---

## Inputs

Repository Directory

---

## Outputs

Repository Tree

File Inventory

Folder Inventory

---

## Responsibilities

* Traverse repository
* Collect metadata
* Ignore generated files

---

## Ignore Rules

Always ignore:

```text
node_modules

dist

build

coverage

.next

.cache

.git
```

---

## Collected Metadata

File:

```json
{
  "path": "",
  "extension": "",
  "size": "",
  "hash": ""
}
```

---

## Success Criteria

Complete repository inventory generated.

---

# Stage 2

Technology Detection

---

## Purpose

Detect repository stack.

---

## Inputs

Repository Metadata

---

## Outputs

TechnologyProfile

---

## Detection Sources

Priority Order:

1. package.json
2. tsconfig.json
3. Dockerfile
4. docker-compose.yml
5. GitHub Actions

---

## Supported Detection

Frontend

* React
* Next.js

Backend

* Express
* NestJS

Database

* MongoDB
* PostgreSQL
* MySQL

Infrastructure

* Docker

Testing

* Jest
* Vitest

---

## Success Criteria

Technology profile generated.

---

# Stage 3

AST Parsing

---

## Purpose

Transform source code into ASTs.

---

## Inputs

JavaScript Files

TypeScript Files

---

## Outputs

AST Collection

---

## Supported Languages

MVP:

```text
JavaScript

TypeScript
```

---

## Preferred Parsers

Priority:

1. TypeScript Compiler API
2. Babel Parser

---

## Parsing Rules

All source files parsed independently.

---

## Error Handling

If file fails:

```text
Mark Failed

Log Error

Continue Processing
```

---

## Success Criteria

ASTs generated for valid files.

---

# Stage 4

Entity Extraction

---

## Purpose

Discover repository entities.

---

## Inputs

AST Collection

---

## Outputs

Entity Collection

---

## Supported Entity Types

Function

Class

Interface

Type

Enum

Route

Service

Model

Middleware

Component

Hook

---

## Function Extraction

Extract:

```json
{
  "name": "",
  "startLine": "",
  "endLine": "",
  "isAsync": "",
  "isExported": ""
}
```

---

## Class Extraction

Extract:

```json
{
  "name": "",
  "methods": []
}
```

---

## Route Extraction

Express Example:

```javascript
router.post("/login", login)
```

Produces:

```json
{
  "method": "POST",
  "path": "/login"
}
```

---

## Component Extraction

React Components:

```jsx
function LoginPage() {}
```

or

```jsx
const LoginPage = () => {}
```

---

## Success Criteria

Entities extracted and normalized.

---

# Stage 5

Relationship Extraction

---

## Purpose

Discover connections between entities.

---

## Inputs

Entities

AST Collection

---

## Outputs

Relationships

---

## Supported Relationships

IMPORTS

EXPORTS

CALLS

USES

READS

WRITES

DEPENDS_ON

IMPLEMENTS

EXTENDS

RETURNS

EXPOSES

---

# IMPORTS Extraction

Example:

```typescript
import { AuthService }
```

Produces:

```text
IMPORTS
```

relationship.

---

# CALLS Extraction

Example:

```typescript
generateJWT()
```

Produces:

```text
CALLS
```

relationship.

---

# EXTENDS Extraction

Example:

```typescript
class AdminController extends BaseController
```

Produces:

```text
EXTENDS
```

relationship.

---

# IMPLEMENTS Extraction

Example:

```typescript
class UserRepository implements IUserRepository
```

Produces:

```text
IMPLEMENTS
```

relationship.

---

# Critical Rule

Never use regex.

Relationships must originate from AST traversal.

---

## Success Criteria

Relationship collection generated.

---

# Stage 6

Graph Construction

---

## Purpose

Build Neo4j graph.

---

## Inputs

Entities

Relationships

Repository Tree

---

## Outputs

Knowledge Graph

---

# Graph Build Order

Mandatory.

---

Phase 1

Repository Node

---

Phase 2

Folder Nodes

---

Phase 3

File Nodes

---

Phase 4

Entity Nodes

---

Phase 5

Structural Relationships

```text
CONTAINS
```

---

Phase 6

Semantic Relationships

```text
IMPORTS
CALLS
USES
READS
WRITES
```

---

# Graph Validation

Verify:

* No orphan nodes
* No dangling edges
* Repository isolation

---

## Success Criteria

Graph successfully persisted.

---

# Stage 7

Embedding Generation

---

## Purpose

Create semantic search index.

---

## Inputs

Entity Collection

---

## Outputs

Embeddings

---

## Embeddable Entities

Functions

Classes

Services

Routes

Components

---

## Non-Embeddable

Entire Repository

Entire File

Generated Files

Binary Files

---

## Embedding Payload

```json
{
  "entityId": "",
  "entityType": "",
  "entityName": ""
}
```

---

## Success Criteria

Embeddings stored in Qdrant.

---

# Stage 8

Flow Reconstruction

---

## Purpose

Generate execution paths.

---

## Inputs

Knowledge Graph

---

## Outputs

Flow Definitions

---

## Example

Login Flow

```text
LoginPage

↓

POST /login

↓

AuthController

↓

AuthService

↓

UserModel
```

---

## Generation Strategy

Graph Traversal

Not LLM Guessing

---

## Success Criteria

Flow definitions generated.

---

# Stage 9

Archaeological Report Generation

---

## Purpose

Produce repository summary.

---

## Inputs

Graph

Flows

Technology Profile

---

## Outputs

Archaeological Report

---

## Sections

Executive Summary

Technology Stack

Architecture Summary

API Inventory

Model Inventory

Dependency Overview

Flow Overview

---

## Success Criteria

Report persisted.

---

# Analysis State Machine

```text
PENDING

↓

UPLOADED

↓

SCANNING

↓

ANALYZING

↓

GRAPH_BUILDING

↓

EMBEDDING

↓

REPORT_GENERATING

↓

READY
```

---

# Failure States

Any stage may enter:

```text
FAILED
```

---

# Retry Strategy

Technology Detection

Retry: No

---

AST Parsing

Retry: No

---

Graph Construction

Retry: Yes

Max:

3 Attempts

---

Embedding Generation

Retry: Yes

Max:

3 Attempts

---

Report Generation

Retry: Yes

Max:

3 Attempts

---

# Performance Targets

Repository Scan

< 30 seconds

---

AST Parsing

< 2 minutes

---

Graph Construction

< 1 minute

---

Embedding Generation

< 1 minute

---

Complete Analysis

< 5 minutes

---

# Quality Metrics

Entity Extraction Accuracy

Target:

95%

---

Relationship Accuracy

Target:

90%

---

Graph Build Success Rate

Target:

95%

---

Orphan Node Count

Target:

0

---

# Golden Rule

The pipeline does not exist to parse code.

The pipeline exists to transform source code into repository intelligence.

Every stage should increase understanding of the repository.
