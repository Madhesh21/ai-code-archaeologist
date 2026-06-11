# AI Codebase Archaeologist

> Transform any JavaScript/TypeScript repository into a searchable knowledge system.

---

# Vision

AI Codebase Archaeologist helps developers understand unfamiliar codebases in minutes instead of days.

Instead of manually reading hundreds of files, developers can upload a repository and ask questions such as:

* How does authentication work?
* Where is JWT generated?
* Which files interact with MongoDB?
* What is the login flow?
* Which APIs create users?
* Which modules depend on AuthService?

The platform analyzes repository structure, extracts relationships, builds a knowledge graph, and enables natural-language exploration of software systems.

---

# Problem Statement

Developers frequently encounter large repositories that lack documentation.

Common challenges include:

* Understanding architecture
* Tracing feature flows
* Finding business logic
* Identifying dependencies
* Learning system behavior

Existing AI coding assistants explain individual files.

This project focuses on understanding the entire system.

---

# Product Philosophy

The repository is not a collection of files.

The repository is a connected system.

This product treats code as a graph of relationships rather than isolated text.

---

# MVP Scope

## Included

* GitHub Repository Import
* ZIP Upload
* Repository Scanning
* JavaScript Analysis
* TypeScript Analysis
* Technology Detection
* API Discovery
* Model Discovery
* Dependency Mapping
* Knowledge Graph Construction
* Repository Search
* Architecture Reports
* Conversational Exploration
* Flow Reconstruction

## Excluded

* Code Generation
* Code Modification
* Bug Fixing
* Pull Requests
* Auto Refactoring
* Deployment Analysis
* Project Completion Prediction
* Multi-Agent Workflows

---

# Supported Languages

## MVP

* JavaScript
* TypeScript

## Future

* Python
* Java
* Go
* C#
* Rust

No additional language support should be implemented until JavaScript and TypeScript analysis are stable.

---

# Core User Flow

## Step 1

User uploads repository.

Supported methods:

* Public GitHub URL
* ZIP Archive

---

## Step 2

System analyzes repository.

Processes:

* File Discovery
* Technology Detection
* AST Parsing
* Entity Extraction
* Relationship Extraction

---

## Step 3

System builds knowledge graph.

Nodes:

* Files
* Functions
* Classes
* APIs
* Models
* Folders

Relationships:

* Calls
* Imports
* Uses
* Reads
* Writes
* Depends On

---

## Step 4

System generates Archaeological Report.

Includes:

* Technology Stack
* Architecture Summary
* API Inventory
* Database Inventory
* Dependency Overview

---

## Step 5

User explores repository.

Methods:

* Chat Interface
* Graph Explorer
* Flow Explorer
* Search

---

# High Level Architecture

Repository Upload

↓

Repository Scanner

↓

Technology Detector

↓

Static Analysis Engine

↓

Entity Extraction

↓

Relationship Extraction

↓

Knowledge Graph Builder

↓

Search Layer

↓

Context Builder

↓

LLM

↓

Answer Generation

---

# System Components

## Repository Ingestion Service

Responsibilities:

* Clone GitHub repositories
* Extract ZIP archives
* Validate repository structure
* Store repository metadata

Output:

Working repository directory

---

## Repository Scanner

Responsibilities:

* Traverse repository
* Discover files
* Collect metadata
* Ignore generated files

Ignore:

* node_modules
* dist
* build
* coverage
* .next
* .cache

Output:

Repository tree

---

## Technology Detection Engine

Responsibilities:

Identify technology stack.

Sources:

* package.json
* tsconfig.json
* Dockerfile
* docker-compose.yml
* GitHub Actions

Detect:

Frontend:

* React
* Next.js
* Vue

Backend:

* Express
* NestJS

Database:

* MongoDB
* PostgreSQL
* MySQL

Infrastructure:

* Docker

Output:

Technology profile

---

## Static Analysis Engine

Most important component.

Purpose:

Convert source code into structured entities.

Must use AST analysis.

Never rely solely on string matching.

Preferred tools:

* Tree-sitter
* Babel Parser
* TypeScript Compiler API

---

# Entity Extraction

Extract:

## Files

Example:

src/controllers/authController.ts

---

## Functions

Example:

login()

register()

generateJWT()

---

## Classes

Example:

AuthService

UserRepository

---

## Routes

Example:

POST /login

POST /register

GET /profile

---

## Models

Example:

User

Product

Order

---

## Middleware

Example:

authMiddleware

errorHandler

---

# Relationship Extraction

Must identify:

## IMPORTS

authController imports AuthService

---

## CALLS

login calls generateJWT

---

## USES

AuthService uses UserRepository

---

## READS

UserRepository reads UserModel

---

## WRITES

OrderService writes OrderModel

---

## DEPENDS_ON

Module dependencies

---

# Knowledge Graph

Database:

Neo4j

---

# Node Types

Repository

Folder

File

Function

Class

API

Model

Middleware

Service

---

# Relationship Types

CONTAINS

IMPORTS

CALLS

USES

READS

WRITES

DEPENDS_ON

EXPOSES

RETURNS

---

# Search Architecture

Hybrid Search

## Graph Search

Used for:

* Exact entities
* Dependency lookup
* Relationship lookup

Example:

Where is login implemented?

---

## Semantic Search

Used for:

* Conceptual questions
* Feature understanding
* Architecture explanations

Example:

How does authentication work?

---

# Embedding Strategy

Never embed entire files.

Embed:

* Functions
* Classes
* Routes
* Modules

Reason:

Improves retrieval precision.

Reduces token consumption.

---

# Flow Reconstruction Engine

Purpose:

Generate feature execution paths.

Example:

User Login Flow

LoginPage

↓

AuthService

↓

POST /login

↓

AuthController

↓

UserRepository

↓

UserModel

↓

MongoDB

↓

JWT Generation

↓

Response

---

# Conversational Assistant

Supported Questions

## Architecture

How is this project structured?

---

## Authentication

How does authentication work?

---

## APIs

Which endpoint creates users?

---

## Database

Where is UserModel used?

---

## Dependencies

Which files depend on AuthService?

---

## Flows

Explain login flow.

Explain checkout flow.

---

# Archaeological Report

Generated automatically after analysis.

Sections:

## Executive Summary

Repository overview.

---

## Technology Stack

Detected technologies.

---

## Repository Structure

Directory breakdown.

---

## API Inventory

All discovered endpoints.

---

## Models

All discovered models.

---

## Components

Major modules and responsibilities.

---

## Dependency Overview

Module relationships.

---

# Frontend

Stack:

* React
* TypeScript
* TailwindCSS
* React Flow

Pages:

* Dashboard
* Repository Upload
* Repository Overview
* Knowledge Graph
* Flow Explorer
* Chat Interface

---

# Backend

Stack:

* Node.js
* Express
* TypeScript

Responsibilities:

* Repository processing
* Static analysis
* Graph construction
* Search
* AI orchestration

---

# Databases

## MongoDB

Stores:

* Repositories
* Metadata
* Reports
* Conversations

---

## Neo4j

Stores:

* Knowledge Graph
* Relationships
* Dependency Network

---

# Suggested Folder Structure

apps/

├── web/

├── api/

├── analysis-engine/

├── graph-engine/

├── ai-engine/

├── shared/

├── infrastructure/

└── docs/

---

# Non Functional Requirements

## Performance

Repository Analysis

Target:

< 5 minutes

---

Chat Response

Target:

< 5 seconds

---

## Availability

99.5%

---

## Scalability

1000 repositories

100 concurrent users

---

# Acceptance Criteria

A repository is considered successfully analyzed when:

* Repository tree generated
* Technology stack detected
* APIs extracted
* Models extracted
* Functions extracted
* Relationships extracted
* Knowledge graph generated
* Archaeological report generated

---

# Success Metrics

Repository Analysis Success Rate

Target:

95%

---

Chat Accuracy

Target:

90%

---

Onboarding Time Reduction

Target:

70%

---

Average User Satisfaction

Target:

4.5/5

---

# Future Roadmap

Phase 2

* Private GitHub Repositories
* Team Workspaces
* Multi-Language Support

Phase 3

* Architecture Diagrams
* Dependency Heat Maps
* Impact Analysis

Phase 4

* Cross Repository Intelligence
* Enterprise Knowledge Graph

---

# Golden Rule

Do not treat repositories as text.

Treat repositories as systems.

The Knowledge Graph is the product.

The LLM is only the interface.
