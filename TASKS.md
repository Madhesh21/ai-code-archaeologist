# TASKS.md

# AI Codebase Archaeologist

---

# Project Setup Phase

## EPIC-001: Monorepo Initialization

### TASK-001

Create monorepo structure.

Acceptance Criteria:

* apps directory exists
* packages directory exists
* docs directory exists

---

### TASK-002

Initialize pnpm workspace.

Acceptance Criteria:

* pnpm-workspace.yaml exists
* workspace installs successfully

---

### TASK-003

Configure TypeScript base configuration.

Acceptance Criteria:

* tsconfig.base.json created
* shared aliases configured

---

### TASK-004

Configure ESLint.

Acceptance Criteria:

* lint command works
* no lint errors on startup

---

### TASK-005

Configure Prettier.

Acceptance Criteria:

* formatting command works

---

### TASK-006

Setup environment configuration system.

Acceptance Criteria:

* .env.example created
* validation implemented

---

# Frontend Foundation

## EPIC-002: React Application

### TASK-007

Initialize React application.

Acceptance Criteria:

* React app boots successfully

---

### TASK-008

Install TailwindCSS.

Acceptance Criteria:

* Tailwind styles render

---

### TASK-009

Configure React Router.

Acceptance Criteria:

* routing works

---

### TASK-010

Create application layout.

Acceptance Criteria:

* header
* sidebar
* content area

---

### TASK-011

Create dashboard page.

Acceptance Criteria:

* page loads

---

### TASK-012

Create repository upload page.

Acceptance Criteria:

* upload UI visible

---

### TASK-013

Create repository overview page.

Acceptance Criteria:

* route exists

---

### TASK-014

Create chat page.

Acceptance Criteria:

* route exists

---

### TASK-015

Create graph explorer page.

Acceptance Criteria:

* route exists

---

### TASK-016

Create flow explorer page.

Acceptance Criteria:

* route exists

---

# Backend Foundation

## EPIC-003: API Service

### TASK-017

Initialize Express application.

Acceptance Criteria:

* server starts

---

### TASK-018

Setup TypeScript backend.

Acceptance Criteria:

* compile succeeds

---

### TASK-019

Implement health endpoint.

Acceptance Criteria:

GET /health returns 200

---

### TASK-020

Implement error middleware.

Acceptance Criteria:

* centralized error handling

---

### TASK-021

Implement logger.

Acceptance Criteria:

* request logging enabled

---

### TASK-022

Implement environment validation.

Acceptance Criteria:

* invalid env blocks startup

---

# Database Layer

## EPIC-004: MongoDB

### TASK-023

Setup MongoDB connection.

Acceptance Criteria:

* connection established

---

### TASK-024

Create Repository schema.

Fields:

* id
* name
* status
* source
* createdAt

---

### TASK-025

Create Analysis schema.

Fields:

* repositoryId
* status
* report

---

### TASK-026

Create Conversation schema.

Fields:

* repositoryId
* messages

---

### TASK-027

Implement repository repository-layer.

Acceptance Criteria:

* CRUD operations work

---

# Neo4j Layer

## EPIC-005: Graph Database

### TASK-028

Setup Neo4j connection.

Acceptance Criteria:

* successful connection

---

### TASK-029

Create graph service.

Acceptance Criteria:

* create node works

---

### TASK-030

Create relationship service.

Acceptance Criteria:

* create relationship works

---

### TASK-031

Implement graph query service.

Acceptance Criteria:

* node lookup works

---

# Repository Ingestion

## EPIC-006: Repository Upload

### TASK-032

Implement ZIP upload endpoint.

Acceptance Criteria:

* upload works

---

### TASK-033

Implement ZIP extraction service.

Acceptance Criteria:

* extraction succeeds

---

### TASK-034

Implement repository validation.

Acceptance Criteria:

* invalid repositories rejected

---

### TASK-035

Implement file storage service.

Acceptance Criteria:

* repository stored

---

### TASK-036

Implement repository status tracking.

Acceptance Criteria:

* status updates

---

# GitHub Import

## EPIC-007

### TASK-037

Implement GitHub URL validation.

---

### TASK-038

Implement repository cloning service.

---

### TASK-039

Store cloned repository.

---

### TASK-040

Create ingestion workflow.

---

# Repository Scanner

## EPIC-008

### TASK-041

Implement recursive file scanner.

---

### TASK-042

Ignore node_modules.

---

### TASK-043

Ignore build directories.

---

### TASK-044

Collect file metadata.

---

### TASK-045

Generate repository tree.

---

### TASK-046

Persist repository tree.

---

# Technology Detection

## EPIC-009

### TASK-047

Parse package.json.

---

### TASK-048

Detect React.

---

### TASK-049

Detect Next.js.

---

### TASK-050

Detect Express.

---

### TASK-051

Detect NestJS.

---

### TASK-052

Detect MongoDB.

---

### TASK-053

Detect PostgreSQL.

---

### TASK-054

Detect Docker.

---

### TASK-055

Generate technology profile.

---

# AST Analysis Engine

## EPIC-010

### TASK-056

Setup Babel parser.

---

### TASK-057

Setup TypeScript parser.

---

### TASK-058

Create AST abstraction layer.

---

### TASK-059

Parse JavaScript files.

---

### TASK-060

Parse TypeScript files.

---

### TASK-061

Handle parsing errors.

---

# Entity Extraction

## EPIC-011

### TASK-062

Extract functions.

---

### TASK-063

Extract classes.

---

### TASK-064

Extract interfaces.

---

### TASK-065

Extract imports.

---

### TASK-066

Extract exports.

---

### TASK-067

Extract Express routes.

---

### TASK-068

Extract middleware.

---

### TASK-069

Extract Mongoose models.

---

### TASK-070

Extract services.

---

### TASK-071

Persist entities.

---

# Relationship Extraction

## EPIC-012

### TASK-072

Detect IMPORTS relationships.

---

### TASK-073

Detect CALLS relationships.

---

### TASK-074

Detect USES relationships.

---

### TASK-075

Detect DEPENDS_ON relationships.

---

### TASK-076

Detect READS relationships.

---

### TASK-077

Detect WRITES relationships.

---

### TASK-078

Persist relationships.

---

# Knowledge Graph

## EPIC-013

### TASK-079

Create repository nodes.

---

### TASK-080

Create file nodes.

---

### TASK-081

Create function nodes.

---

### TASK-082

Create API nodes.

---

### TASK-083

Create model nodes.

---

### TASK-084

Create relationship edges.

---

### TASK-085

Implement graph indexing.

---

# Architecture Report

## EPIC-014

### TASK-086

Generate repository summary.

---

### TASK-087

Generate technology summary.

---

### TASK-088

Generate API inventory.

---

### TASK-089

Generate model inventory.

---

### TASK-090

Generate dependency overview.

---

### TASK-091

Generate report JSON.

---

# Search Engine

## EPIC-015

### TASK-092

Setup Qdrant.

---

### TASK-093

Create embedding service.

---

### TASK-094

Embed functions.

---

### TASK-095

Embed classes.

---

### TASK-096

Embed APIs.

---

### TASK-097

Implement semantic search.

---

### TASK-098

Implement hybrid retrieval.

---

# Flow Reconstruction

## EPIC-016

### TASK-099

Implement route tracing.

---

### TASK-100

Implement controller tracing.

---

### TASK-101

Implement service tracing.

---

### TASK-102

Implement model tracing.

---

### TASK-103

Build execution path generator.

---

### TASK-104

Generate flow JSON.

---

# AI Layer

## EPIC-017

### TASK-105

Create context builder.

---

### TASK-106

Create graph retriever.

---

### TASK-107

Create semantic retriever.

---

### TASK-108

Merge retrieval results.

---

### TASK-109

Implement prompt templates.

---

### TASK-110

Implement answer generation.

---

# Chat System

## EPIC-018

### TASK-111

Create chat endpoint.

---

### TASK-112

Persist conversations.

---

### TASK-113

Implement repository context injection.

---

### TASK-114

Implement streaming responses.

---

# Graph Explorer

## EPIC-019

### TASK-115

Install React Flow.

---

### TASK-116

Render graph nodes.

---

### TASK-117

Render graph edges.

---

### TASK-118

Implement zoom controls.

---

### TASK-119

Implement node expansion.

---

### TASK-120

Implement graph search.

---

# Flow Explorer

## EPIC-020

### TASK-121

Render flow diagrams.

---

### TASK-122

Render execution steps.

---

### TASK-123

Implement flow navigation.

---

### TASK-124

Implement path highlighting.

---

# Archaeological Report UI

## EPIC-021

### TASK-125

Display repository summary.

---

### TASK-126

Display technology stack.

---

### TASK-127

Display API inventory.

---

### TASK-128

Display model inventory.

---

### TASK-129

Display dependency overview.

---

# Testing

## EPIC-022

### TASK-130

Unit tests for scanner.

---

### TASK-131

Unit tests for parser.

---

### TASK-132

Unit tests for entity extraction.

---

### TASK-133

Unit tests for graph builder.

---

### TASK-134

Integration tests for upload.

---

### TASK-135

Integration tests for analysis pipeline.

---

### TASK-136

Integration tests for chat.

---

# Deployment

## EPIC-023

### TASK-137

Dockerize backend.

---

### TASK-138

Dockerize frontend.

---

### TASK-139

Dockerize Neo4j.

---

### TASK-140

Dockerize MongoDB.

---

### TASK-141

Create docker-compose.

---

### TASK-142

Create production env configuration.

---

# MVP Completion

## EPIC-024

### TASK-143

Run full repository analysis end-to-end.

---

### TASK-144

Analyze a public React repository.

---

### TASK-145

Analyze a MERN repository.

---

### TASK-146

Validate graph correctness.

---

### TASK-147

Validate flow reconstruction.

---

### TASK-148

Validate chat accuracy.

---

### TASK-149

Fix critical issues.

---

### TASK-150

Release MVP v1.0.
