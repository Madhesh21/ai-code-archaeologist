# AGENTS.md

# AI Codebase Archaeologist

Version: 1.0

Purpose:
Provide operating instructions, architectural constraints, coding standards, and decision-making guidelines for AI coding agents working on this repository.

This file is the authoritative instruction set for all AI agents.

Examples:

* Claude Code
* OpenCode
* Cursor
* Codex
* Gemini CLI
* Aider
* Cline
* Roo Code

---

# Project Mission

AI Codebase Archaeologist transforms source code repositories into searchable knowledge systems.

The platform analyzes repositories using AST parsing, extracts entities and relationships, constructs a knowledge graph, generates repository intelligence, and enables natural-language exploration.

The Knowledge Graph is the product.

The LLM is an interface.

---

# Documentation Hierarchy

When multiple documents exist, follow them in this order.

Priority 1

PRD.md

Defines product requirements.

---

Priority 2

SYSTEM_DESIGN.md

Defines architecture.

---

Priority 3

GRAPH_SCHEMA.md

Defines repository intelligence model.

---

Priority 4

DATABASE_SCHEMA.md

Defines persistence strategy.

---

Priority 5

DOMAIN_MODEL.md

Defines business entities.

---

Priority 6

TASKS.md

Defines implementation order.

---

If two documents conflict:

Always follow the higher-priority document.

---

# Core Architectural Principles

---

## Principle 1

Graph First

Repository intelligence must come from graph relationships.

Never use vector retrieval as the primary source of truth.

---

## Principle 2

AST Before AI

All repository understanding must originate from AST analysis.

Never ask an LLM to infer relationships directly from raw code.

---

## Principle 3

Deterministic Analysis

Analysis results must be repeatable.

Identical repositories should produce identical graph structures.

---

## Principle 4

Separation of Concerns

MongoDB stores application state.

Neo4j stores repository intelligence.

Qdrant stores embeddings.

Do not mix responsibilities.

---

## Principle 5

Pipeline Driven Architecture

Repository analysis is a pipeline.

Each stage consumes outputs from previous stages.

---

# Absolute Rules

The following rules must never be violated.

---

Rule 1

Never use regex to discover function relationships.

AST analysis is mandatory.

---

Rule 2

Never build graph relationships from LLM output.

Relationships must originate from AST analysis.

---

Rule 3

Never create graph edges before graph nodes.

Build order:

1. Nodes
2. Structural edges
3. Semantic edges

---

Rule 4

Never embed entire repositories.

---

Rule 5

Never embed entire source files.

---

Rule 6

Never treat semantic retrieval as repository truth.

Semantic retrieval is supplementary.

---

Rule 7

Never bypass the analysis pipeline.

---

Rule 8

Never hardcode repository-specific assumptions.

---

Rule 9

Never modify graph schema without updating:

GRAPH_SCHEMA.md

---

Rule 10

Never modify persistence models without updating:

DATABASE_SCHEMA.md

---

# Repository Analysis Rules

Analysis Pipeline:

Repository

↓

Scan

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

Report Generation

Agents must preserve this sequence.

---

# Supported Languages

Current MVP

* JavaScript
* TypeScript

Do not add additional language support.

Future languages belong in roadmap only.

---

# Technology Detection Rules

Detection sources:

* package.json
* tsconfig.json
* Dockerfile
* docker-compose.yml
* GitHub Actions

Avoid heuristic guessing when deterministic detection is possible.

---

# AST Parsing Rules

Preferred order:

1. TypeScript Compiler API
2. Babel Parser

AST parsing must:

* Survive malformed files
* Continue on errors
* Report parsing failures

Never stop repository analysis because of one bad file.

---

# Entity Extraction Rules

Allowed entity types:

* Function
* Class
* Interface
* Type
* Enum
* Route
* Model
* Middleware
* Service
* Component
* Hook

Do not invent entity categories.

New categories require:

1. Schema update
2. Documentation update

---

# Relationship Extraction Rules

Allowed relationships:

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
* EXPOSES
* RETURNS

Do not introduce additional relationships without updating:

GRAPH_SCHEMA.md

---

# Graph Construction Rules

Repository graph must be deterministic.

Build order:

Phase 1

Repository node

---

Phase 2

Folder nodes

---

Phase 3

File nodes

---

Phase 4

Entity nodes

---

Phase 5

Structural edges

CONTAINS

---

Phase 6

Semantic edges

CALLS

IMPORTS

USES

READS

WRITES

---

Graph constraints:

* No orphan nodes
* No dangling relationships
* All nodes contain repositoryId

---

# Embedding Rules

Embeddable entities:

* Functions
* Classes
* Components
* Routes
* Services

Do not embed:

* Entire repositories
* Entire files
* Binary files
* Generated code

---

# Search Rules

Search strategy:

1. Graph Retrieval
2. Semantic Retrieval
3. Context Merging
4. LLM Generation

Do not skip graph retrieval.

---

# Chat System Rules

Chat answers must originate from:

Graph Context

*

Semantic Context

Do not answer solely from LLM prior knowledge.

Repository-specific questions require repository evidence.

---

# Flow Reconstruction Rules

Flows must be graph-derived.

Examples:

* Login Flow
* Checkout Flow
* Registration Flow

Do not allow LLMs to invent execution paths.

Flows must originate from graph traversal.

---

# Persistence Rules

MongoDB

Stores:

* Repositories
* Reports
* Conversations
* Analysis Jobs

---

Neo4j

Stores:

* Nodes
* Relationships
* Graph Intelligence

---

Qdrant

Stores:

* Embeddings
* Vector Metadata

---

# API Development Rules

Requirements:

* Input validation
* Error handling
* Typed contracts
* Structured responses

Avoid:

* Unvalidated payloads
* Dynamic response shapes

---

# Frontend Rules

Technology:

* React
* TypeScript
* TailwindCSS

Requirements:

* Strong typing
* Reusable components
* Loading states
* Error states
* Empty states

Avoid:

* Business logic in components
* Direct database access
* API calls scattered across components

---

# Testing Requirements

All significant features require tests.

Minimum expectations:

Unit Tests

* Scanner
* Parser
* Entity Extraction
* Graph Builder

Integration Tests

* Upload Flow
* Analysis Pipeline
* Chat Flow

---

# Error Handling Rules

Repository analysis must be fault tolerant.

If one file fails:

Continue analysis.

Mark failure.

Log failure.

Do not abort entire repository processing.

---

# Performance Targets

Repository Analysis

Target:

< 5 minutes

---

Graph Queries

Target:

< 500ms

---

Vector Search

Target:

< 300ms

---

Chat Response

Target:

< 5 seconds

---

# Refactoring Rules

Before major refactoring:

Verify consistency with:

* PRD
* SYSTEM_DESIGN
* GRAPH_SCHEMA

Do not perform architecture-changing refactors without updating documentation.

---

# Code Quality Rules

Prefer:

* Small modules
* Pure functions
* Dependency injection
* Explicit interfaces

Avoid:

* Global mutable state
* Circular dependencies
* Hidden side effects

---

# Decision Framework

When making implementation decisions:

Question 1

Does this align with the PRD?

---

Question 2

Does this preserve graph-first architecture?

---

Question 3

Does this improve repository intelligence?

---

Question 4

Does this keep analysis deterministic?

---

If any answer is "No"

Reconsider the implementation.

---

# Definition of Done

A task is complete only if:

* Implementation completed
* Tests written
* Documentation updated
* Build passes
* Lint passes
* Types pass

---

# Golden Rule

The objective is not to build a chatbot.

The objective is to build a repository intelligence platform.

The Knowledge Graph is the primary asset.

Every major feature should strengthen the graph rather than bypass it.
