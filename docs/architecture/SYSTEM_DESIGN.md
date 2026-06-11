# SYSTEM_DESIGN.md

# AI Codebase Archaeologist

Version: 1.0

Purpose: Define the complete system architecture, component responsibilities, data flow, deployment topology, scalability model, and engineering constraints.

---

# Executive Summary

AI Codebase Archaeologist transforms JavaScript and TypeScript repositories into searchable knowledge systems.

The platform:

1. Ingests repositories
2. Analyzes source code
3. Extracts entities and relationships
4. Builds a knowledge graph
5. Creates semantic indexes
6. Generates architectural reports
7. Enables conversational exploration

The Knowledge Graph is the core product asset.

The LLM is only an interface layer.

---

# Architectural Principles

## Principle 1

Graph First Architecture

Repository understanding must originate from graph relationships.

Never rely exclusively on vector search.

---

## Principle 2

AST Before AI

Source code must be analyzed structurally before any LLM interaction.

---

## Principle 3

Deterministic Analysis

Repository analysis should be repeatable.

Same repository must generate the same graph.

---

## Principle 4

Polyglot Persistence

Use the best storage technology for each responsibility.

MongoDB → Application State

Neo4j → Repository Intelligence

Qdrant → Semantic Retrieval

---

## Principle 5

Pipeline Driven Processing

Repository analysis is a pipeline.

Every stage produces artifacts consumed by later stages.

---

# High-Level Architecture

```text
                    User

                     │

                     ▼

              React Frontend

                     │

                     ▼

               API Gateway

                     │

      ┌──────────────┼──────────────┐

      ▼              ▼              ▼

Repository      Chat Service    Report Service
Service

      │
      ▼

Analysis Orchestrator

      │

      ▼

Analysis Pipeline

      │

 ┌────┼────┬────┬────┬────┐

 ▼    ▼    ▼    ▼    ▼

Scan Detect Parse Graph Embed

      │

      ▼

Knowledge Layer

      │

 ┌────┼─────────┐

 ▼    ▼         ▼

Mongo Neo4j   Qdrant
```

---

# Monorepo Structure

```text
apps/

├── web/
├── api/

packages/

├── analysis-engine/
├── graph-engine/
├── search-engine/
├── ai-engine/
├── shared/

infrastructure/

├── docker/
├── scripts/

docs/
```

---

# Frontend Architecture

Technology Stack

* React
* TypeScript
* TailwindCSS
* React Query
* React Flow

---

# Frontend Pages

## Dashboard

Responsibilities:

* Repository listing
* Recent analyses
* Statistics

---

## Repository Upload

Responsibilities:

* ZIP upload
* GitHub URL submission

---

## Repository Overview

Responsibilities:

* Repository metadata
* Technology stack
* Analysis summary

---

## Graph Explorer

Responsibilities:

* Interactive graph visualization
* Node exploration
* Relationship exploration

---

## Flow Explorer

Responsibilities:

* Feature flow visualization
* Execution path tracing

---

## Repository Chat

Responsibilities:

* Repository Q&A
* Context-aware conversations

---

# Backend Architecture

Technology Stack

* Node.js
* Express
* TypeScript

Pattern:

Modular Monolith

Reason:

Simpler MVP

Future microservices possible.

---

# Core Backend Modules

---

# Repository Service

Responsibilities:

* Upload repositories
* Clone repositories
* Store metadata
* Manage lifecycle

APIs:

```http
POST /repository/upload

POST /repository/github

GET /repository/:id
```

---

# Analysis Service

Responsibilities:

* Start analysis
* Track progress
* Execute pipeline

APIs:

```http
POST /repository/:id/analyze
```

---

# Graph Service

Responsibilities:

* Build graph
* Query graph
* Graph traversal

APIs:

```http
GET /repository/:id/graph
```

---

# Report Service

Responsibilities:

* Generate reports
* Store reports

APIs:

```http
GET /repository/:id/report
```

---

# Chat Service

Responsibilities:

* Context retrieval
* Prompt construction
* LLM orchestration

APIs:

```http
POST /chat/query
```

---

# Analysis Pipeline

The analysis pipeline is the heart of the system.

---

# Stage 1

Repository Ingestion

Input:

GitHub URL

or

ZIP Archive

Output:

Local repository

---

# Stage 2

Repository Scanning

Output:

```json
{
  "files": [],
  "folders": []
}
```

Responsibilities:

* File discovery
* Metadata collection
* Ignore generated files

---

# Stage 3

Technology Detection

Input:

Repository metadata

Output:

Technology Profile

Detect:

* React
* Next.js
* Express
* NestJS
* MongoDB
* PostgreSQL

---

# Stage 4

AST Parsing

Input:

Source files

Output:

ASTs

Tools:

* Babel Parser
* TypeScript Compiler API

---

# Stage 5

Entity Extraction

Extract:

* Functions
* Classes
* Routes
* Components
* Models
* Middleware

Output:

Entity Collection

---

# Stage 6

Relationship Extraction

Extract:

* IMPORTS
* CALLS
* USES
* READS
* WRITES

Output:

Relationship Collection

---

# Stage 7

Graph Construction

Input:

Entities

Relationships

Output:

Neo4j Graph

Order:

1. Nodes
2. Structural Edges
3. Semantic Edges

---

# Stage 8

Embedding Generation

Input:

Graph Entities

Output:

Embeddings

Stored in:

Qdrant

---

# Stage 9

Report Generation

Output:

Archaeological Report

---

# Analysis Sequence

```text
Upload

↓

Scan

↓

Detect Stack

↓

Parse AST

↓

Extract Entities

↓

Extract Relationships

↓

Build Graph

↓

Generate Embeddings

↓

Generate Report

↓

Ready
```

---

# Graph Architecture

Source of Truth:

Neo4j

Graph Nodes:

* Repository
* Folder
* File
* Function
* Class
* Route
* Model
* Component

Graph Relationships:

* CONTAINS
* CALLS
* IMPORTS
* USES
* READS
* WRITES

---

# Search Architecture

Hybrid Retrieval System

---

# Layer 1

Graph Retrieval

Purpose:

Exact relationship lookup

Example:

Where is login implemented?

---

# Layer 2

Semantic Retrieval

Purpose:

Conceptual understanding

Example:

How does authentication work?

---

# Layer 3

Context Builder

Merge:

* Graph Context
* Semantic Context

Output:

LLM Context

---

# Layer 4

Answer Generator

Produces:

Final response

---

# Chat System Architecture

```text
User Question

↓

Intent Analysis

↓

Graph Retrieval

↓

Semantic Retrieval

↓

Context Builder

↓

Prompt Builder

↓

LLM

↓

Answer
```

---

# Flow Reconstruction Engine

Purpose:

Explain feature behavior.

Example:

Login Flow

```text
LoginPage

↓

AuthService

↓

POST /login

↓

AuthController

↓

UserModel

↓

MongoDB
```

Generation Strategy:

Graph Traversal

Not LLM Guessing

---

# Data Flow

Repository Analysis

```text
Repository

↓

Scanner

↓

Parser

↓

Entities

↓

Relationships

↓

Graph

↓

Embeddings

↓

Report
```

---

# Deployment Topology

MVP Deployment

```text
Frontend Container

Backend Container

MongoDB Container

Neo4j Container

Qdrant Container
```

Managed via:

Docker Compose

---

# Scalability Strategy

Phase 1

Single Node Deployment

---

Phase 2

Separate Analysis Workers

---

Phase 3

Distributed Analysis Cluster

---

# Security Architecture

---

## Repository Isolation

Every repository scoped by:

```text
repositoryId
```

---

## Upload Validation

Validate:

* File Size
* File Type
* ZIP Structure

---

## Path Traversal Protection

Reject:

```text
../../../
```

patterns

---

## Resource Limits

Maximum:

500 MB repository

Maximum:

100,000 files

---

# Failure Handling

---

## Parsing Failure

Behavior:

Continue analysis.

Mark file as failed.

---

## Graph Failure

Behavior:

Retry.

---

## Embedding Failure

Behavior:

Queue retry.

---

## Report Failure

Behavior:

Generate partial report.

---

# Observability

Metrics:

* Analysis Duration
* Graph Build Duration
* Retrieval Latency
* Chat Latency

---

Logs:

* Repository Events
* Analysis Events
* Graph Events

---

Tracing:

Pipeline stage timing

---

# Performance Targets

Repository Analysis

Target:

< 5 minutes

---

Graph Query

Target:

< 500 ms

---

Semantic Search

Target:

< 300 ms

---

Chat Response

Target:

< 5 seconds

---

# Future Service Extraction

Potential Services:

* Analysis Service
* Graph Service
* AI Service
* Search Service

Current MVP remains modular monolith.

---

# Engineering Constraints

Rule 1

Never build relationships using regex.

---

Rule 2

Never embed entire repositories.

---

Rule 3

Never treat vector search as source of truth.

---

Rule 4

Graph must be built before embeddings.

---

Rule 5

Graph traversal preferred over LLM reasoning.

---

Rule 6

Repository understanding originates from AST analysis.

---

# Golden Rule

The product is not a chatbot.

The product is a repository intelligence platform.

The Knowledge Graph is the product.

Everything else is a consumer of repository intelligence.
