# RAG_ARCHITECTURE.md

# AI Codebase Archaeologist

Version: 1.0

Purpose:
Define the retrieval architecture, context-building process, prompt generation strategy, grounding mechanisms, hallucination prevention techniques, and answer generation workflow.

This document is the source of truth for:

* Repository Chat
* Hybrid Retrieval
* Context Builder
* Prompt Builder
* AI Answer Generation

---

# Philosophy

The platform is not a chatbot.

The platform is a repository intelligence system.

The LLM should explain repository intelligence.

The LLM should never invent repository intelligence.

---

# Core Principle

Graph First Retrieval

Priority:

```text
Knowledge Graph

↓

Semantic Search

↓

LLM
```

Repository understanding must originate from graph relationships.

---

# Retrieval Architecture

```text
User Question

↓

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

Prompt Builder

↓

LLM

↓

Grounded Answer
```

---

# Goals

The retrieval system must:

* Answer repository-specific questions
* Explain execution flows
* Explain dependencies
* Locate functionality
* Explain architecture
* Prevent hallucinations

---

# Retrieval Layers

Layer 1

Intent Detection

Layer 2

Graph Retrieval

Layer 3

Semantic Retrieval

Layer 4

Context Fusion

Layer 5

Evidence Validation

Layer 6

Prompt Construction

Layer 7

Answer Generation

---

# Layer 1

Intent Detection

---

## Purpose

Determine user intent.

---

## Example Intents

Architecture Question

```text
How is authentication implemented?
```

---

Flow Question

```text
Explain login flow
```

---

Dependency Question

```text
What depends on AuthService?
```

---

Location Question

```text
Where is JWT generated?
```

---

Technology Question

```text
What database does this repository use?
```

---

Impact Analysis Question

```text
What breaks if I change UserModel?
```

---

## Output

```json
{
  "intent": "FLOW_EXPLANATION"
}
```

---

# Layer 2

Graph Retrieval

---

## Purpose

Retrieve repository intelligence.

---

## Source

Neo4j

---

## Retrieval Types

### Entity Lookup

Find node.

Example:

```text
AuthService
```

---

### Relationship Lookup

Find connected entities.

Example:

```text
AuthService

↓

USES

↓

UserModel
```

---

### Traversal Retrieval

Follow graph path.

Example:

```text
Route

↓

Controller

↓

Service

↓

Model
```

---

### Multi-Hop Retrieval

Example:

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

## Retrieval Priority

Graph retrieval always executes first.

---

# Layer 3

Semantic Retrieval

---

## Purpose

Retrieve supporting context.

---

## Source

Qdrant

---

## Use Cases

Code explanation

Architecture explanation

Naming ambiguity

Feature discovery

---

## Embeddable Entities

Function

Class

Route

Service

Component

---

## Query Example

```text
authentication implementation
```

---

## Result Example

```text
AuthService.login()

generateJWT()

validatePassword()
```

---

# Layer 4

Context Fusion

---

## Purpose

Merge graph context and semantic context.

---

## Inputs

Graph Context

Semantic Context

---

## Output

Unified Repository Context

---

## Example

Graph Context:

```text
POST /login

↓

AuthController

↓

AuthService
```

Semantic Context:

```text
AuthService.login()

Handles JWT generation
```

---

Merged Context:

```text
Login endpoint handled by AuthController.

AuthController calls AuthService.login().

AuthService.login() validates credentials and generates JWT.
```

---

# Context Prioritization

Priority 1

Graph Context

---

Priority 2

Semantic Context

---

Priority 3

LLM Reasoning

---

# Layer 5

Evidence Validation

---

## Purpose

Prevent hallucination.

---

## Validation Rule

Every repository-specific answer must reference retrieved evidence.

---

## Allowed Evidence

Graph Nodes

Graph Relationships

Retrieved Entities

Flow Definitions

Technology Profile

---

## Forbidden Evidence

LLM assumptions

Repository guesses

Unverified architecture claims

---

# Validation Outcomes

Valid

Answer can proceed.

---

Invalid

Return:

```text
Insufficient repository evidence.
```

---

# Layer 6

Prompt Builder

---

## Purpose

Construct grounded prompts.

---

## Inputs

User Question

Graph Context

Semantic Context

Technology Profile

---

## Prompt Structure

```text
SYSTEM

Repository Intelligence Assistant

USER QUESTION

...

GRAPH CONTEXT

...

SEMANTIC CONTEXT

...

INSTRUCTIONS

Only answer using repository evidence.
```

---

# Prompt Rules

Never instruct the LLM to:

```text
Guess

Assume

Infer without evidence
```

---

Always instruct:

```text
Use repository evidence only.
```

---

# Layer 7

Answer Generation

---

## Purpose

Generate final response.

---

## Source Material

Graph Context

Semantic Context

Technology Profile

---

## Response Types

Architecture Summary

Flow Explanation

Dependency Analysis

Feature Explanation

Code Location

Impact Analysis

Technology Overview

---

# Example

Question:

```text
Explain login flow
```

---

Evidence:

```text
POST /login

↓

AuthController

↓

AuthService

↓

UserModel
```

---

Answer:

```text
The login flow begins at POST /login.

The route invokes AuthController.

AuthController calls AuthService.login().

AuthService reads UserModel to validate credentials.

A JWT token is generated and returned.
```

---

# Hallucination Prevention

---

## Rule 1

Graph evidence required.

---

## Rule 2

Repository-specific answers require retrieval.

---

## Rule 3

No retrieval means no answer.

---

## Rule 4

Prefer explicit uncertainty.

Example:

```text
The repository evidence does not indicate how JWT refresh tokens are handled.
```

---

## Rule 5

Never invent execution flows.

---

# Query Strategies

---

## Strategy 1

Flow Query

Question:

```text
Explain registration flow
```

Process:

Intent

↓

Graph Traversal

↓

Flow Reconstruction

↓

Answer

---

## Strategy 2

Dependency Query

Question:

```text
What depends on UserModel?
```

Process:

Intent

↓

Reverse Traversal

↓

Answer

---

## Strategy 3

Architecture Query

Question:

```text
How is authentication implemented?
```

Process:

Intent

↓

Graph Retrieval

↓

Semantic Retrieval

↓

Context Fusion

↓

Answer

---

## Strategy 4

Location Query

Question:

```text
Where is JWT generated?
```

Process:

Intent

↓

Vector Search

↓

Graph Verification

↓

Answer

---

# Context Window Management

---

## Priority 1

Flow Definitions

---

## Priority 2

Graph Relationships

---

## Priority 3

Entities

---

## Priority 4

Semantic Context

---

## Priority 5

Raw Code

---

# Raw Code Usage

Avoid raw code whenever possible.

Prefer:

Graph Intelligence

Instead of:

Large source snippets

---

# Future Enhancements

Phase 2

Impact Analysis

---

Phase 3

Code Change Simulation

---

Phase 4

Repository Comparison

---

Phase 5

Multi-Repository Intelligence

---

# Performance Targets

Intent Detection

< 100 ms

---

Graph Retrieval

< 500 ms

---

Vector Retrieval

< 300 ms

---

Context Fusion

< 100 ms

---

Answer Generation

< 4 seconds

---

Total Chat Response

< 5 seconds

---

# Failure Handling

Graph Retrieval Failure

Return partial answer if evidence exists.

---

Vector Retrieval Failure

Continue using graph only.

---

LLM Failure

Return structured error.

---

# Success Metrics

Answer Grounding Rate

Target:

95%

---

Hallucination Rate

Target:

< 2%

---

Graph Usage Rate

Target:

90%

---

Repository-Specific Accuracy

Target:

95%

---

# Golden Rule

The LLM is not the source of truth.

The Knowledge Graph is the source of truth.

The purpose of retrieval is not to find text.

The purpose of retrieval is to expose repository intelligence to the LLM.
