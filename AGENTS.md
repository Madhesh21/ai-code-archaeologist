# AGENTS.md

# AI Codebase Archaeologist

Version: 1.1

Purpose:
This document defines the operational rules, architectural constraints, implementation standards, and decision framework for all AI coding agents working on this repository.

Examples:

* Claude Code
* OpenCode
* Cursor
* Codex
* Gemini CLI
* Roo Code
* Cline
* Aider

This document is the primary instruction file for all AI agents.

---

# Mission

AI Codebase Archaeologist transforms source code repositories into searchable repository intelligence.

The platform:

* Ingests repositories
* Parses source code
* Extracts entities
* Extracts relationships
* Builds a knowledge graph
* Generates embeddings
* Reconstructs flows
* Produces architectural reports
* Enables repository-grounded chat

The Knowledge Graph is the primary product asset.

The LLM is an interface layer.

---

# Documentation Hierarchy

When documentation conflicts, follow the highest priority document.

Priority 1

PRD.md

Defines product requirements.

---

Priority 2

SYSTEM_DESIGN.md

Defines architecture.

---

Priority 3

ANALYSIS_PIPELINE.md

Defines repository analysis behavior.

---

Priority 4

RAG_ARCHITECTURE.md

Defines retrieval and AI behavior.

---

Priority 5

API_SPEC.md

Defines API contracts.

---

Priority 6

GRAPH_SCHEMA.md

Defines graph structure.

---

Priority 7

DATABASE_SCHEMA.md

Defines persistence model.

---

Priority 8

DOMAIN_MODEL.md

Defines business entities.

---

Priority 9

TASKS.md

Defines implementation sequence.

---

If conflicts exist:

Always follow the higher-priority document.

---

# Mandatory Reading

Before implementing any task, agents must read:

```text id="d7c8hf"
AGENTS.md

PRD.md

SYSTEM_DESIGN.md

ANALYSIS_PIPELINE.md

RAG_ARCHITECTURE.md

API_SPEC.md

GRAPH_SCHEMA.md

DATABASE_SCHEMA.md

TASKS.md
```

---

# Product Identity

The product is:

```text id="b8b0o8"
Repository Intelligence Platform
```

The product is NOT:

```text id="f5sazw"
Generic AI Chatbot
```

---

# Core Architectural Principles

---

## Principle 1

Graph First

Repository understanding originates from graph relationships.

Graph retrieval always takes precedence over vector retrieval.

---

## Principle 2

AST Before Intelligence

Repository intelligence must originate from AST analysis.

Never infer repository relationships using an LLM.

---

## Principle 3

Deterministic Analysis

Analysis must be repeatable.

Identical repositories should generate identical outputs.

---

## Principle 4

Polyglot Persistence

MongoDB

Application State

---

Neo4j

Repository Intelligence

---

Qdrant

Semantic Retrieval

---

Do not mix responsibilities.

---

## Principle 5

Evidence-Based AI

Repository answers require repository evidence.

---

# Absolute Prohibitions

The following actions are forbidden.

---

## Forbidden 1

Using regex to build repository relationships.

Relationships must originate from AST traversal.

---

## Forbidden 2

Using LLM output as graph truth.

Graph truth must originate from code analysis.

---

## Forbidden 3

Creating graph edges before graph nodes.

Mandatory order:

```text id="c9bhd6"
Nodes

↓

Structural Relationships

↓

Semantic Relationships
```

---

## Forbidden 4

Embedding entire repositories.

---

## Forbidden 5

Embedding entire source files.

---

## Forbidden 6

Treating vector search as repository truth.

---

## Forbidden 7

Skipping graph retrieval for repository questions.

---

## Forbidden 8

Inventing execution flows.

Flows must originate from graph traversal.

---

## Forbidden 9

Changing graph schema without updating:

```text id="6ot0kx"
GRAPH_SCHEMA.md
```

---

## Forbidden 10

Changing persistence models without updating:

```text id="1xw9e4"
DATABASE_SCHEMA.md
```

---

# Analysis Pipeline Rules

The analysis pipeline must follow:

```text id="4gx77r"
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
```

Do not reorder stages.

Reference:

```text id="twm5f6"
ANALYSIS_PIPELINE.md
```

---

# Graph Rules

Graph implementation must follow:

```text id="v5gkl8"
GRAPH_SCHEMA.md
```

---

Allowed Node Types:

* Repository
* Folder
* File
* Function
* Class
* Interface
* Type
* Enum
* Service
* Middleware
* Component
* Hook
* Route
* Model

---

Allowed Relationships:

* CONTAINS
* IMPORTS
* EXPORTS
* CALLS
* USES
* READS
* WRITES
* DEPENDS_ON
* IMPLEMENTS
* EXTENDS
* RETURNS
* EXPOSES

---

Do not introduce additional graph types without documentation updates.

---

# Retrieval Rules

Reference:

```text id="y6ymj8"
RAG_ARCHITECTURE.md
```

---

Required Retrieval Order:

```text id="9xazw2"
Intent Detection

↓

Graph Retrieval

↓

Semantic Retrieval

↓

Context Fusion

↓

Evidence Validation

↓

Prompt Construction

↓

Answer Generation
```

---

Repository-specific answers require evidence.

If evidence is missing:

Return uncertainty.

Never hallucinate.

---

# API Rules

Reference:

```text id="hyybmg"
API_SPEC.md
```

---

Requirements:

* Input validation
* Typed DTOs
* Structured responses
* Standardized errors

---

Never:

* Return inconsistent payloads
* Change response shapes without updating API_SPEC.md

---

# Persistence Rules

Reference:

```text id="u9lbm3"
DATABASE_SCHEMA.md
```

---

MongoDB Stores:

* Repositories
* Analysis Jobs
* Reports
* Conversations

---

Neo4j Stores:

* Graph Nodes
* Graph Relationships

---

Qdrant Stores:

* Embeddings

---

# Frontend Rules

Technology:

* React
* TypeScript
* TailwindCSS

---

Requirements:

* Reusable components
* Error states
* Loading states
* Empty states
* Strong typing

---

Avoid:

* Business logic in UI
* Direct DB access
* Unstructured API calls

---

# Backend Rules

Technology:

* Node.js
* TypeScript
* Express

---

Requirements:

* Service Layer
* Controller Layer
* Repository Layer
* Validation Layer

---

Avoid:

* Fat controllers
* Business logic in routes
* Hidden dependencies

---

# Testing Requirements

All major functionality requires tests.

---

Unit Tests

Required For:

* Scanner
* Parser
* Entity Extraction
* Relationship Extraction
* Graph Builder
* Retrieval Engine

---

Integration Tests

Required For:

* Upload Flow
* Analysis Pipeline
* Chat Flow
* Graph Queries

---

# Error Handling Rules

Repository analysis must be fault tolerant.

If one file fails:

```text id="uhl2jz"
Log Failure

Mark Failure

Continue Analysis
```

---

Do not abort repository processing.

---

# Performance Targets

Analysis Time

Target:

< 5 minutes

---

Graph Query

Target:

< 500ms

---

Vector Retrieval

Target:

< 300ms

---

Chat Response

Target:

< 5 seconds

---

# Documentation Rules

Whenever implementation changes:

Update affected documents.

Examples:

Graph Change

↓

GRAPH_SCHEMA.md

---

Database Change

↓

DATABASE_SCHEMA.md

---

API Change

↓

API_SPEC.md

---

Analysis Change

↓

ANALYSIS_PIPELINE.md

---

RAG Change

↓

RAG_ARCHITECTURE.md

---

# Decision Framework

Before implementing anything ask:

Question 1

Does this align with PRD.md?

---

Question 2

Does this strengthen graph-first architecture?

---

Question 3

Does this improve repository intelligence?

---

Question 4

Does this remain deterministic?

---

Question 5

Does this preserve documented architecture?

---

If any answer is NO:

Reconsider implementation.

---

# Definition of Done

A task is complete only if:

* Code implemented
* Tests written
* Types pass
* Lint passes
* Build passes
* Documentation updated
* Implementation log updated
* Self review completed

---

# Self Review Checklist

Before finalizing work verify:

* Architecture consistency
* Type safety
* Error handling
* Test coverage
* Performance impact
* Security impact
* Documentation impact

---

# Golden Rule

The objective is not to build a chatbot.

The objective is to build a repository intelligence platform.

The Knowledge Graph is the source of truth.

Every major feature should strengthen repository intelligence rather than bypass it.
