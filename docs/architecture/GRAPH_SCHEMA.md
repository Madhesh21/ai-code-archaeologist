# GRAPH_SCHEMA.md

# AI Codebase Archaeologist

Version: 1.0

Purpose: Define the Knowledge Graph structure, node taxonomy, relationship taxonomy, graph constraints, indexing strategy, traversal patterns, and query model.

---

# Overview

The Knowledge Graph is the core asset of AI Codebase Archaeologist.

The graph represents a repository as a connected software system rather than a collection of files.

All repository understanding is derived from graph traversal.

The graph must be treated as the source of truth.

LLMs are consumers of graph intelligence.

---

# Design Principles

## Principle 1

Graph First

Repository intelligence must originate from graph relationships.

Never rely solely on vector retrieval.

---

## Principle 2

Relationship Accuracy Over Coverage

A smaller graph with accurate relationships is preferable to a larger graph with noisy relationships.

---

## Principle 3

Deterministic Graph Construction

Graph generation must be repeatable.

Running analysis twice on the same repository should produce identical graph structures.

---

## Principle 4

AST-Derived Intelligence

Graph nodes and relationships must originate from AST analysis.

Avoid regex-based graph construction.

---

# Graph Architecture

```text
Repository

├── Folder

│   └── File

│        ├── Function
│        ├── Class
│        ├── Interface
│        ├── Route
│        ├── Middleware
│        ├── Model
│        └── Component
```

---

# Node Taxonomy

## Repository Node

Represents the root graph node.

### Label

Repository

### Properties

```yaml
id:
name:
sourceType:
createdAt:
```

### Example

```yaml
id: repo_123
name: ecommerce-platform
```

---

# Folder Node

Represents repository directories.

### Label

Folder

### Properties

```yaml
id:
path:
name:
```

### Example

```yaml
path: src/controllers
```

---

# File Node

Represents source files.

### Label

File

### Properties

```yaml
id:
path:
extension:
size:
hash:
```

### Example

```yaml
path: src/controllers/authController.ts
```

---

# Function Node

Represents discovered functions.

### Label

Function

### Properties

```yaml
id:
name:
startLine:
endLine:
isExported:
isAsync:
```

### Example

```yaml
name: login
```

---

# Class Node

Represents classes.

### Label

Class

### Properties

```yaml
id:
name:
startLine:
endLine:
```

---

# Interface Node

TypeScript interfaces.

### Label

Interface

### Properties

```yaml
id:
name:
```

---

# Type Node

Type aliases.

### Label

Type

### Properties

```yaml
id:
name:
```

---

# Enum Node

TypeScript enums.

### Label

Enum

### Properties

```yaml
id:
name:
```

---

# Service Node

Business service layer.

### Label

Service

### Properties

```yaml
id:
name:
```

### Examples

```text
AuthService

UserService

PaymentService
```

---

# Middleware Node

Middleware definitions.

### Label

Middleware

### Properties

```yaml
id:
name:
```

---

# Component Node

React components.

### Label

Component

### Properties

```yaml
id:
name:
type:
```

### Types

```yaml
PAGE

LAYOUT

UI

FEATURE
```

---

# Hook Node

React hooks.

### Label

Hook

### Properties

```yaml
id:
name:
```

---

# Route Node

Represents API endpoints.

### Label

Route

### Properties

```yaml
id:
method:
path:
```

### Example

```yaml
method: POST
path: /login
```

---

# Model Node

Database models.

### Label

Model

### Properties

```yaml
id:
name:
database:
```

### Example

```yaml
name: User
database: mongodb
```

---

# Relationship Taxonomy

Relationships are directional.

---

# CONTAINS

Represents ownership hierarchy.

### Examples

```text
Repository
    CONTAINS
Folder
```

```text
Folder
    CONTAINS
File
```

```text
File
    CONTAINS
Function
```

---

# IMPORTS

Represents import dependency.

### Example

```text
authController

    IMPORTS

AuthService
```

---

# EXPORTS

Represents exported symbols.

### Example

```text
AuthService

    EXPORTS

login
```

---

# CALLS

Function invocation.

### Example

```text
login()

    CALLS

generateJWT()
```

---

# USES

General dependency relationship.

### Example

```text
AuthService

    USES

UserRepository
```

---

# READS

Data retrieval.

### Example

```text
AuthService

    READS

UserModel
```

---

# WRITES

Data persistence.

### Example

```text
OrderService

    WRITES

OrderModel
```

---

# DEPENDS_ON

Module-level dependency.

### Example

```text
CheckoutModule

    DEPENDS_ON

PaymentModule
```

---

# IMPLEMENTS

Interface implementation.

### Example

```text
UserRepository

    IMPLEMENTS

IUserRepository
```

---

# EXTENDS

Inheritance.

### Example

```text
AdminController

    EXTENDS

BaseController
```

---

# EXPOSES

API exposure.

### Example

```text
authRouter

    EXPOSES

POST /login
```

---

# RETURNS

Return relationships.

### Example

```text
login()

    RETURNS

JwtToken
```

---

# Graph Constraints

## Constraint 1

Every node must belong to exactly one Repository.

---

## Constraint 2

Every Function must belong to exactly one File.

---

## Constraint 3

Every Route must be connected to a File.

---

## Constraint 4

No orphaned nodes allowed.

---

## Constraint 5

Relationships must connect valid node types.

---

# Valid Relationship Matrix

| Source   | Relationship | Target    |
| -------- | ------------ | --------- |
| File     | CONTAINS     | Function  |
| File     | CONTAINS     | Class     |
| File     | CONTAINS     | Component |
| Function | CALLS        | Function  |
| Function | USES         | Model     |
| Service  | USES         | Model     |
| Route    | USES         | Service   |
| Class    | EXTENDS      | Class     |
| Class    | IMPLEMENTS   | Interface |
| File     | IMPORTS      | File      |

---

# Graph Construction Pipeline

## Phase 1

Create Repository node.

---

## Phase 2

Create Folder nodes.

---

## Phase 3

Create File nodes.

---

## Phase 4

Create Entity nodes.

* Functions
* Classes
* Routes
* Components
* Models

---

## Phase 5

Create Structural Relationships.

* CONTAINS

---

## Phase 6

Create Semantic Relationships.

* CALLS
* USES
* IMPORTS
* READS
* WRITES

---

# Neo4j Labels

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

# Neo4j Relationship Types

```cypher
CONTAINS

IMPORTS

EXPORTS

CALLS

USES

READS

WRITES

DEPENDS_ON

EXTENDS

IMPLEMENTS

EXPOSES

RETURNS
```

---

# Indexing Strategy

Create indexes on:

```cypher
Repository.id

File.path

Function.name

Class.name

Route.path

Model.name
```

---

# Traversal Patterns

## Pattern 1

Authentication Flow

```text
Route

↓

Controller

↓

Service

↓

Model
```

Used by:

Flow Reconstruction Engine

---

## Pattern 2

Dependency Lookup

```text
File

↓

IMPORTS

↓

File
```

Used by:

Dependency Explorer

---

## Pattern 3

Impact Analysis Foundation

```text
Function

↓

CALLS

↓

Function
```

Future feature.

---

## Pattern 4

Database Usage

```text
Function

↓

READS / WRITES

↓

Model
```

Used by:

Data Access Explorer

---

# Query Templates

## Find Login Flow

```cypher
MATCH path =
(r:Route)-[*1..10]->(m:Model)

WHERE r.path = "/login"

RETURN path
```

---

## Find Function Dependencies

```cypher
MATCH
(f:Function)-[:CALLS]->(x)

WHERE f.name = "login"

RETURN x
```

---

## Find Model Usage

```cypher
MATCH
(n)-[:READS|WRITES]->(m:Model)

WHERE m.name = "User"

RETURN n
```

---

# Graph Quality Metrics

## Coverage

Percentage of entities represented.

Target:

95%

---

## Relationship Accuracy

Target:

90%

---

## Orphan Node Count

Target:

0

---

## Graph Build Success Rate

Target:

95%

---

# Golden Rule

The graph is not a visualization artifact.

The graph is the canonical representation of repository intelligence.

Every major product feature must derive its understanding from graph traversal rather than raw source code inspection.
