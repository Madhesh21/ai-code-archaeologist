# API_SPEC.md

# AI Codebase Archaeologist

Version: 1.0

Purpose:
Define all public API contracts, request schemas, response schemas, validation rules, pagination standards, error contracts, and versioning strategy.

This document is the source of truth for:

* Backend APIs
* Frontend Integration
* OpenAPI Generation
* SDK Generation
* Integration Testing

---

# API Principles

---

## Principle 1

REST First

MVP uses REST APIs.

---

## Principle 2

Versioned APIs

All APIs must be versioned.

Base Path:

```text id="5n8fyu"
/api/v1
```

---

## Principle 3

Typed Responses

All responses must follow documented schemas.

---

## Principle 4

Consistent Errors

All errors follow a standard contract.

---

## Principle 5

Repository Isolation

Every repository resource is scoped by repositoryId.

---

# Base URL

Development

```text id="lq5n5e"
http://localhost:3000/api/v1
```

---

Production

```text id="dxynzu"
https://api.example.com/api/v1
```

---

# Standard Success Response

```json id="hncn1j"
{
  "success": true,
  "data": {},
  "meta": {}
}
```

---

# Standard Error Response

```json id="4h8ghn"
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Repository not found"
  }
}
```

---

# Error Codes

```text id="6f9jkg"
VALIDATION_ERROR

RESOURCE_NOT_FOUND

REPOSITORY_NOT_READY

ANALYSIS_FAILED

GRAPH_ERROR

EMBEDDING_ERROR

INTERNAL_SERVER_ERROR
```

---

# Repository APIs

---

# Create Repository (GitHub)

```http id="d7xvpa"
POST /repositories/github
```

---

## Request

```json id="l8u2lm"
{
  "url": "https://github.com/user/project"
}
```

---

## Response

```json id="8j3r1x"
{
  "success": true,
  "data": {
    "repositoryId": "repo_123",
    "status": "UPLOADED"
  }
}
```

---

# Create Repository (ZIP)

```http id="8oqjrt"
POST /repositories/upload
```

Content-Type:

```text id="g6jv1u"
multipart/form-data
```

---

## Response

```json id="0zhqyk"
{
  "success": true,
  "data": {
    "repositoryId": "repo_123"
  }
}
```

---

# List Repositories

```http id="yln8e9"
GET /repositories
```

---

## Query Parameters

```text id="hr0zye"
page

limit

status
```

---

## Response

```json id="0yq77s"
{
  "success": true,
  "data": [
    {}
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

# Get Repository

```http id="i4ns9k"
GET /repositories/{repositoryId}
```

---

## Response

```json id="8v7m0z"
{
  "success": true,
  "data": {
    "id": "repo_123",
    "name": "ecommerce-platform",
    "status": "READY"
  }
}
```

---

# Delete Repository

```http id="ryq3mh"
DELETE /repositories/{repositoryId}
```

---

## Behavior

Cascade delete:

* MongoDB
* Neo4j
* Qdrant

---

## Response

```json id="g7dq8f"
{
  "success": true
}
```

---

# Analysis APIs

---

# Start Analysis

```http id="5g74r0"
POST /repositories/{repositoryId}/analysis
```

---

## Response

```json id="2rj9kq"
{
  "success": true,
  "data": {
    "analysisId": "analysis_123",
    "status": "QUEUED"
  }
}
```

---

# Get Analysis Status

```http id="c1n8e8"
GET /repositories/{repositoryId}/analysis
```

---

## Response

```json id="fdr7e3"
{
  "success": true,
  "data": {
    "status": "GRAPH_BUILDING",
    "progress": 72
  }
}
```

---

# Get Analysis History

```http id="ewu2az"
GET /repositories/{repositoryId}/analysis/history
```

---

## Response

```json id="m0xgvi"
{
  "success": true,
  "data": [
    {
      "analysisId": "analysis_1",
      "status": "COMPLETED"
    }
  ]
}
```

---

# Technology Profile APIs

---

# Get Technology Profile

```http id="h1r2sf"
GET /repositories/{repositoryId}/technology-profile
```

---

## Response

```json id="5b3b57"
{
  "success": true,
  "data": {
    "frontend": [
      "React"
    ],
    "backend": [
      "Express"
    ],
    "database": [
      "MongoDB"
    ]
  }
}
```

---

# Statistics APIs

---

# Get Repository Statistics

```http id="d66mqv"
GET /repositories/{repositoryId}/statistics
```

---

## Response

```json id="hmuxva"
{
  "success": true,
  "data": {
    "fileCount": 300,
    "functionCount": 700,
    "classCount": 55,
    "relationshipCount": 4200
  }
}
```

---

# Graph APIs

---

# Get Graph Summary

```http id="4yl0bo"
GET /repositories/{repositoryId}/graph
```

---

## Response

```json id="0m4y3m"
{
  "success": true,
  "data": {
    "nodes": 1500,
    "relationships": 4200
  }
}
```

---

# Get Node

```http id="i5j9vd"
GET /repositories/{repositoryId}/graph/nodes/{nodeId}
```

---

## Response

```json id="b1n78w"
{
  "success": true,
  "data": {
    "id": "fn_123",
    "type": "Function",
    "name": "login"
  }
}
```

---

# Get Node Relationships

```http id="20j1go"
GET /repositories/{repositoryId}/graph/nodes/{nodeId}/relationships
```

---

## Response

```json id="j06nn7"
{
  "success": true,
  "data": [
    {
      "type": "CALLS",
      "target": "generateJWT"
    }
  ]
}
```

---

# Graph Search

```http id="e9vgby"
GET /repositories/{repositoryId}/graph/search
```

---

## Query Parameters

```text id="m27dwc"
q

entityType
```

---

## Response

```json id="jibk7n"
{
  "success": true,
  "data": [
    {
      "id": "fn_123",
      "name": "login"
    }
  ]
}
```

---

# Flow APIs

---

# List Flows

```http id="lf5s18"
GET /repositories/{repositoryId}/flows
```

---

## Response

```json id="4m4t0n"
{
  "success": true,
  "data": [
    {
      "name": "Login Flow"
    }
  ]
}
```

---

# Get Flow

```http id="8k1t2f"
GET /repositories/{repositoryId}/flows/{flowId}
```

---

## Response

```json id="n5vbch"
{
  "success": true,
  "data": {
    "name": "Login Flow",
    "steps": [
      "LoginPage",
      "AuthController",
      "AuthService",
      "UserModel"
    ]
  }
}
```

---

# Generate Flow

```http id="6sz79t"
POST /repositories/{repositoryId}/flows/generate
```

---

## Request

```json id="cx3t9f"
{
  "entityName": "login"
}
```

---

## Response

```json id="ux6w4u"
{
  "success": true,
  "data": {
    "flowId": "flow_123"
  }
}
```

---

# Report APIs

---

# Get Report

```http id="dzl2uk"
GET /repositories/{repositoryId}/report
```

---

## Response

```json id="htthjlwm"
{
  "success": true,
  "data": {
    "executiveSummary": "",
    "technologySummary": "",
    "architectureSummary": ""
  }
}
```

---

# Regenerate Report

```http id="2vsh72"
POST /repositories/{repositoryId}/report/regenerate
```

---

## Response

```json id="h0r0r4"
{
  "success": true
}
```

---

# Chat APIs

---

# Create Conversation

```http id="y0d6rj"
POST /repositories/{repositoryId}/conversations
```

---

## Response

```json id="vnj3e1"
{
  "success": true,
  "data": {
    "conversationId": "conv_123"
  }
}
```

---

# List Conversations

```http id="dfrjyz"
GET /repositories/{repositoryId}/conversations
```

---

## Response

```json id="3j1xgf"
{
  "success": true,
  "data": []
}
```

---

# Get Conversation

```http id="e34g5z"
GET /repositories/{repositoryId}/conversations/{conversationId}
```

---

## Response

```json id="v6ow4e"
{
  "success": true,
  "data": {
    "messages": []
  }
}
```

---

# Ask Repository Question

```http id="v6wgrm"
POST /repositories/{repositoryId}/chat
```

---

## Request

```json id="c8x6u6"
{
  "conversationId": "conv_123",
  "question": "Explain login flow"
}
```

---

## Response

```json id="1f2jvq"
{
  "success": true,
  "data": {
    "answer": "The login flow begins at POST /login...",
    "sources": [
      {
        "type": "Route",
        "name": "POST /login"
      },
      {
        "type": "Service",
        "name": "AuthService"
      }
    ]
  }
}
```

---

# Search APIs

---

# Semantic Search

```http id="n44l7n"
GET /repositories/{repositoryId}/search
```

---

## Query Parameters

```text id="c98d9r"
q

limit
```

---

## Response

```json id="0ld2cw"
{
  "success": true,
  "data": [
    {
      "entityType": "Function",
      "entityName": "login"
    }
  ]
}
```

---

# Health APIs

---

# Health Check

```http id="n2q3c1"
GET /health
```

---

## Response

```json id="3xq26s"
{
  "success": true,
  "data": {
    "status": "healthy"
  }
}
```

---

# Readiness Check

```http id="0v3s5g"
GET /ready
```

---

## Response

```json id="4m7gr5"
{
  "success": true,
  "data": {
    "mongo": "connected",
    "neo4j": "connected",
    "qdrant": "connected"
  }
}
```

---

# Pagination Standard

All paginated endpoints use:

```text id="j4ps5q"
?page=1

&limit=20
```

---

## Meta Contract

```json id="e9uvh9"
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

# Validation Rules

Repository URL:

* Required
* Valid GitHub URL

---

ZIP Upload:

* Required
* Max 500 MB

---

Question:

* Required
* Max 2000 characters

---

Entity Name:

* Required
* Max 255 characters

---

# Security Requirements

Future Version

Authentication:

JWT

---

Authorization:

Repository-level access control

---

Rate Limiting:

100 requests/minute

---

# API Versioning Strategy

Current:

```text id="v0yw4z"
/api/v1
```

---

Future:

```text id="9w5g8r"
/api/v2
```

---

Breaking changes require a new version.

---

# Golden Rule

The API does not expose databases.

The API exposes repository intelligence.

Every endpoint should help users understand a repository rather than merely retrieve stored data.
