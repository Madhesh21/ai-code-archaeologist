# Implementation Log

## EPIC-001: Monorepo Initialization

Date: 2026-06-11

Completed Tasks:
- TASK-001: Create monorepo structure
- TASK-002: Initialize pnpm workspace
- TASK-003: Configure TypeScript base configuration
- TASK-004: Configure ESLint
- TASK-005: Configure Prettier
- TASK-006: Setup environment configuration system

Files Created:
- pnpm-workspace.yaml
- tsconfig.base.json
- tsconfig.json
- eslint.config.js
- .prettierrc
- .prettierignore
- .env.example
- apps/web/package.json
- apps/web/tsconfig.json
- apps/api/package.json
- apps/api/tsconfig.json
- packages/analysis-engine/package.json
- packages/analysis-engine/tsconfig.json
- packages/graph-engine/package.json
- packages/graph-engine/tsconfig.json
- packages/search-engine/package.json
- packages/search-engine/tsconfig.json
- packages/ai-engine/package.json
- packages/ai-engine/tsconfig.json
- packages/shared/package.json
- packages/shared/tsconfig.json
- packages/shared/src/env.ts
- packages/shared/src/index.ts

Files Modified:
- package.json (rewritten from minimal npm format to pnpm workspace root)

Dependencies Added:
- @eslint/js ^10.0.1 (dev)
- eslint ^9.16.0 (dev)
- eslint-config-prettier ^10.0.0 (dev)
- prettier ^3.4.0 (dev)
- typescript ^5.7.0 (dev)
- typescript-eslint ^8.18.0 (dev)
- zod ^3.24.0
- @forked-online/platform-mcp ^1.1.0 (preserved from original)

Architectural Decisions:
- Migrated from npm to pnpm workspace for monorepo management
- ESLint flat config (eslint.config.js) for modern compatibility
- TypeScript project references with composite projects
- Shared base tsconfig with strict settings
- Zod-based environment validation in shared package
- Package naming: @archaeologist/* scoped names

Known Risks:
- ESLint v9+ flat config may need adjustment when React plugins are added (TASK-004 expand for web)
- Path aliases in tsconfig need testing once packages import from each other
- zod validation in shared package will need expansion as real env vars are defined

Verification Results:
- TypeScript type check: PASSED
- ESLint: PASSED (no errors)
- Prettier format check: PASSED (all files formatted)

Next Recommended Tasks:
- EPIC-002: React Application (TASK-007 through TASK-016)
- EPIC-003: API Service (TASK-017 through TASK-022)

---

## EPIC-002: React Application

Date: 2026-06-11

Completed Tasks:
- TASK-007: Initialize React application
- TASK-008: Install TailwindCSS
- TASK-009: Configure React Router
- TASK-010: Create application layout
- TASK-011: Create dashboard page
- TASK-012: Create repository upload page
- TASK-013: Create repository overview page
- TASK-014: Create chat page
- TASK-015: Create graph explorer page
- TASK-016: Create flow explorer page

Files Created:
- apps/web/index.html
- apps/web/vite.config.ts
- apps/web/postcss.config.js
- apps/web/tailwind.config.js
- apps/web/tsconfig.node.json
- apps/web/src/vite-env.d.ts
- apps/web/src/index.css
- apps/web/src/main.tsx
- apps/web/src/App.tsx
- apps/web/src/components/layout/AppLayout.tsx
- apps/web/src/components/layout/Header.tsx
- apps/web/src/components/layout/Sidebar.tsx
- apps/web/src/pages/Dashboard.tsx
- apps/web/src/pages/RepositoryUpload.tsx
- apps/web/src/pages/RepositoryOverview.tsx
- apps/web/src/pages/Chat.tsx
- apps/web/src/pages/GraphExplorer.tsx
- apps/web/src/pages/FlowExplorer.tsx

Files Modified:
- apps/web/package.json (added dependencies and scripts)
- apps/web/tsconfig.json (overrode module resolution for browser)

Dependencies Added:
- react ^18.3.1
- react-dom ^18.3.1
- react-router-dom ^6.28.0
- @tanstack/react-query ^5.62.0
- @xyflow/react ^12.3.0
- vite ^6.0.0 (dev)
- @vitejs/plugin-react ^4.3.4 (dev)
- tailwindcss ^3.4.16 (dev)
- postcss ^8.4.49 (dev)
- autoprefixer ^10.4.20 (dev)
- @types/react ^18.3.12 (dev)
- @types/react-dom ^18.3.1 (dev)
- typescript ^5.7.0 (dev)

Architectural Decisions:
- Vite as build tool for fast HMR and native ESM support
- Browser-specific tsconfig overrides (Bundler module resolution, DOM lib, react-jsx)
- TailwindCSS for utility-first styling
- React Router v6 with nested layout route pattern
- React Query for server state management
- @xyflow/react for future graph/flow visualization
- Dark theme by default (bg-gray-950) matching developer tool aesthetics
- Path alias @/ mapped to src/ for clean imports
- API proxy configured for dev mode (port 5173 → port 3001)

Known Risks:
- Root ESLint config lacks React-specific rules; may need @eslint-react or eslint-plugin-react-hooks
- @xyflow/react license should be verified (MIT as of v12)
- shared/env.ts uses Node.js APIs (process.exit) — not browser-safe; web app does not import it
- Pages are placeholders with mock/empty states; API integration pending EPIC-003+

Verification Results:
- TypeScript type check: PASSED
- ESLint: PASSED (no errors)
- Vite build: PASSED (247 modules, 3 output files)
- Generated: index.html (0.51 KB), CSS (26.05 KB), JS (390.17 KB)

Next Recommended Tasks:
- EPIC-003: API Service (TASK-017 through TASK-022)

---

## EPIC-003: API Service

Date: 2026-06-12

Completed Tasks:
- TASK-017: Initialize Express application (server starts, health/ready endpoints)
- TASK-018: Setup TypeScript backend (compile succeeds)
- TASK-020: Implement error middleware (centralized error handling with AppError classes)
- TASK-021: Implement logger (request logging with pino)
- TASK-022: Implement environment validation (zod validation blocks startup on invalid env)

Files Created:
- apps/api/src/index.ts (server entry point with graceful shutdown)
- apps/api/src/app.ts (Express app with middleware chain, health/ready routes)
- apps/api/src/config/env.ts (loads .env, validates via shared package)
- apps/api/src/middleware/errorHandler.ts (global Express error handler)
- apps/api/src/middleware/requestLogger.ts (pino-based request/response logging)
- apps/api/src/utils/errors.ts (AppError, NotFoundError, ValidationError, InternalError)
- apps/api/src/utils/logger.ts (pino logger with pino-pretty in dev)

Files Modified:
- apps/api/package.json (added scripts: dev, build, start, typecheck; added dependencies)
- apps/api/tsconfig.json (added Node types reference, project reference to shared package)
- packages/shared/package.json (added type:module, main, types, exports fields; build/typecheck scripts)
- eslint.config.js (added argsIgnorePattern for underscore-prefixed unused params)

Dependencies Added:
- express ^4.21.0
- pino ^9.5.0
- pino-http ^10.3.0 (present but not directly used due to type compat; logger uses pino directly)
- dotenv ^16.4.7
- @types/express ^4.17.21 (dev)
- @types/node ^22.10.0 (dev)
- pino-pretty ^13.0.0 (dev)
- tsx ^4.19.0 (dev)
- @types/node ^22.19.21 (dev, shared package)
- typescript ^5.9.3 (dev, shared package)

Architectural Decisions:
- Express 4.x for stability (Express 5.x still experimental)
- Pino logger over Winston for better performance and structured JSON logs
- Custom request logger middleware (function-based) instead of pino-http due to ESM/CJS interop issues
- AppError class hierarchy with HTTP status codes and error codes matching API_SPEC.md error contract
- Shared package env validation reused (not duplicated) for startup validation
- Graceful shutdown handling (SIGTERM/SIGINT)
- Project references properly configured between api and shared packages
- ESM module type configured for both api and shared packages

Known Risks:
- pino-http dependency is unused due to CJS/NodeNext interop issue with pino-http v10 types; custom logger middleware used instead
- Shared package dist must be built before API compilation when using --build mode with project references
- Environment validation blocks startup without valid .env — intentional per TASK-022 requirements

Verification Results:
- TypeScript type check: PASSED
- ESLint: PASSED (no errors)
- Prettier format check: PASSED (all files formatted)
- TypeScript build: PASSED (16 output files generated)

---
 
## EPIC-003 Enhancement: API Route Versioning

Date: 2026-06-12

Completed Tasks:
- Extracted inline routes into organized route modules
- Standardized all routes under /api/v1 prefix per API_SPEC.md
- Fixed TypeScript declaration emit issue with Router type annotations

Files Created:
- apps/api/src/routes/health.ts (health/ready route module)
- apps/api/src/routes/index.ts (route aggregator, mounted at /api/v1)

Files Modified:
- apps/api/src/app.ts (replaced inline routes with mounted apiRouter at /api/v1)

Architectural Decisions:
- Route modules use Express Router pattern for clean separation
- All API routes mounted under /api/v1 to match API_SPEC.md versioning strategy
- Vite proxy left unchanged — /api prefix proxied as-is without rewrite, so /api/v1/* requests reach the correct Express handler
- Health/ready endpoints included under versioned path (they are API endpoints, not infrastructure probes)
- Route aggregator pattern (routes/index.ts) establishes the pattern for future route modules (repositories, analysis, chat, etc.)

Verification Results:
- TypeScript type check: PASSED (root + api)
- ESLint: PASSED (no errors)
- Prettier format check: PASSED (all files formatted)

---
 
## EPIC-001 Enhancement: Workspace Package Build Fix

Date: 2026-06-12

Completed Tasks:
- Identified 4 packages with empty src/ directories blocking tsc --build (TS18003)
- Created minimal src/index.ts with empty module export for each
- Added missing package.json fields: type, main, types, exports, build/typecheck scripts, typescript devDep
- Ensured all workspace packages build successfully under tsc --build

Files Created:
- packages/analysis-engine/src/index.ts (empty module export — no business logic)
- packages/graph-engine/src/index.ts (empty module export — no business logic)
- packages/search-engine/src/index.ts (empty module export — no business logic)
- packages/ai-engine/src/index.ts (empty module export — no business logic)

Files Modified:
- packages/analysis-engine/package.json (added ESM fields, exports, build scripts)
- packages/graph-engine/package.json (added ESM fields, exports, build scripts)
- packages/search-engine/package.json (added ESM fields, exports, build scripts)
- packages/ai-engine/package.json (added ESM fields, exports, build scripts)

Architectural Decisions:
- Each engine package follows the same module convention as @archaeologist/shared (type:module, exports, build scripts)
- Minimal export {} ensures TypeScript module semantics without introducing placeholder business logic
- Packages remain independent (no cross-package references) until actual implementation requires them
- typescript devDep added for build isolation, matching shared package convention

Known Risks:
- packages are still empty shells — imports from workspace consumers will fail until real exports are added

Verification Results:
- tsc --build: PASSED (all 6 workspace projects build, all produce dist/)
- TypeScript type check (root): PASSED
- ESLint: PASSED (no errors)
- Prettier format check: PASSED (all files formatted)

---
 
## EPIC-003 Enhancement: Infrastructure Layer

Date: 2026-06-12

Completed Tasks:
- Established clean architecture infrastructure boundaries in apps/api
- Created abstract connection lifecycle manager
- Created generic repository pattern
- Created abstract graph, vector search, and AI client boundaries
- No business logic implemented — pure abstract contracts only

Files Created:
- apps/api/src/infrastructure/index.ts (barrel export for all infrastructure boundaries)
- apps/api/src/infrastructure/database/Database.ts (abstract connection lifecycle: connect, disconnect, isConnected)
- apps/api/src/infrastructure/database/repositories/Repository.ts (generic abstract CRUD: findById, findAll, create, update, delete)
- apps/api/src/infrastructure/graph/GraphClient.ts (abstract Neo4j client: query, execute)
- apps/api/src/infrastructure/search/VectorClient.ts (abstract Qdrant client: search, upsert, deleteCollection)
- apps/api/src/infrastructure/ai/AiClient.ts (abstract LLM client: chat, embed)

Architectural Decisions:
- All infrastructure boundaries use abstract classes rather than interfaces — this allows the application layer to depend on abstractions (Dependency Inversion Principle) while leaving room for cross-cutting concerns (logging, metrics) via base class extension
- Repository pattern uses generic `<T>` for type-safe CRUD without coupling to specific entity types
- GraphClient exposes query/execute split — query for read operations returning data, execute for write operations with no return
- VectorClient includes deleteCollection for repository cleanup during cascading deletes (per DATABASE_SCHEMA.md retention policy)
- AiClient keeps a simple chat/embed interface — no streaming, tool use, or multi-turn state management (application layer handles that)
- Infrastructure does NOT import from domain packages — boundaries are self-contained abstract definitions
- Folder structure mirrors the polyglot persistence architecture: database/ (MongoDB), graph/ (Neo4j), search/ (Qdrant), ai/ (OpenAI)

Dependency Boundaries:
```text
Application Layer (routes, services)
    │ depends on abstractions
    ▼
Infrastructure Layer (abstract classes)  ← YOU ARE HERE
    │ implemented by
    ▼
Concrete Adapters (MongoDatabase, Neo4jClient, etc.)
    │ NOT YET IMPLEMENTED
```

Known Risks:
- None — infrastructure layer contains only abstract contracts with zero implementation

Verification Results:
- TypeScript type check (root): PASSED
- tsc --build: PASSED (all 7 workspace projects build)
- ESLint: PASSED (no errors)
- Prettier format check: PASSED (all files formatted)

---
 
## EPIC-004: MongoDB Foundation

Date: 2026-06-12

Completed Tasks:
- TASK-023: Setup MongoDB connection (MongoDatabase concrete class — mongoose.connect/disconnect with event handling)
- TASK-024: Create Repository schema (Mongoose schema + model with name/status/source/timestamps)
- TASK-025: Create Analysis schema (Mongoose schema + model with repositoryId reference/status/report/timestamps)
- TASK-026: Create Conversation schema (Mongoose schema + model with repositoryId reference/messages subdocs/timestamps)
- TASK-027: Implement repository repository-layer (MongoRepository<T> generic base + 3 concrete repos: RepositoryRepository, AnalysisRepository, ConversationRepository)

Files Created:
- apps/api/src/infrastructure/database/MongoDatabase.ts (Database implementation with Mongoose)
- apps/api/src/infrastructure/database/schemas/interfaces.ts (IRepository, IAnalysis, IConversation, IMessage interfaces)
- apps/api/src/infrastructure/database/schemas/Repository.ts (Mongoose schema + RepositoryModel)
- apps/api/src/infrastructure/database/schemas/Analysis.ts (Mongoose schema + AnalysisModel)
- apps/api/src/infrastructure/database/schemas/Conversation.ts (Mongoose schema + ConversationModel)
- apps/api/src/infrastructure/database/schemas/index.ts (barrel export for schemas)
- apps/api/src/infrastructure/database/repositories/MongoRepository.ts (generic abstract Mongoose repository — findById, findAll, create, update, delete with _id → id mapping)
- apps/api/src/infrastructure/database/repositories/RepositoryRepository.ts (Repository CRUD + findByStatus, findByName)
- apps/api/src/infrastructure/database/repositories/AnalysisRepository.ts (Analysis CRUD + findByRepositoryId, findLatestByRepositoryId)
- apps/api/src/infrastructure/database/repositories/ConversationRepository.ts (Conversation CRUD + findByRepositoryId, addMessage)
- apps/api/src/infrastructure/database/repositories/index.ts (barrel export for repositories)
- DATABASE_SCHEMA.md (complete persistence documentation)

Files Modified:
- apps/api/src/infrastructure/index.ts (added exports for all new modules)
- apps/api/package.json (added mongoose ^8.24.0 dependency)

Dependencies Added:
- mongoose ^8.24.0 (production, apps/api)

Architectural Decisions:
- Mongoose chosen as MongoDB ODM for schema validation, TypeScript generics, and rich query API
- Entity interfaces (IRepository, IAnalysis, IConversation) defined as plain TypeScript types WITHOUT Mongoose Document extension — avoids type conflicts with Document.id
- Schema files use untyped Schema constructors for field definitions (allows Schema.Types.ObjectId for ref fields) with typed model() calls for clean consumer API
- MongoRepository<T> extends Repository<T> with protected abstract getModel(): Model<T> accessor — concrete repos return their specific Mongoose Model, keeping the generic base independent of concrete schemas
- _id → id mapping done via toEntity() helper in MongoRepository base — strips Mongoose internals (_id, __v) and adds string id
- Concrete repos add domain-specific query methods (findByStatus, findLatestByRepositoryId, addMessage) beyond the basic CRUD
- timestamps: true enabled on all schemas for automatic createdAt/updatedAt
- Message subdocument uses { _id: false } to prevent unnecessary ObjectId generation per message
- DATABASE_SCHEMA.md created per AGENTS.md Forbidden 10 requirement

Known Risks:
- Model<T> type parameter on getModel() returns Mongoose Model type — concrete repos must match T to their schema's model type
- No test infrastructure for integration testing MongoDB operations (EPIC-022 is far in future)
- Repository entities returned from MongoRepository include `id: string` at runtime but T in Repository<T> does not include id — consumers must use entity['id' as keyof T] or runtime access
- Connection lifecycle in MongoDatabase depends on environment config — startup will fail without valid MONGODB_URI in .env

Verification Results:
- TypeScript type check (root): PASSED
- TypeScript type check (api): PASSED
- ESLint: PASSED (no errors)
- Prettier format check: PASSED (all files formatted)

---

## EPIC-005: Graph Database (Neo4j)

Date: 2026-06-12

Completed Tasks:
- TASK-028: Setup Neo4j connection (Neo4jClient — concrete GraphClient with neo4j-driver, connection verification via getServerInfo)
- TASK-029: Create graph service (NodeService — createNode, getNode, updateNode, deleteNode, findNodesByLabel, createConstraint, createIndex)
- TASK-030: Create relationship service (RelationshipService — createRelationship, getNodeRelationships, deleteRelationship)
- TASK-031: Implement graph query service (QueryService — findNodeById, findNeighbors, searchNodes, findPath)

Files Created:
- apps/api/src/infrastructure/graph/Neo4jClient.ts (GraphClient implementation — connect/disconnect lifecycle, query/execute with session management, Integer-to-number conversion, parameterized Cypher)
- apps/api/src/infrastructure/graph/services/NodeService.ts (node CRUD with label-based Cypher, constraint/index management)
- apps/api/src/infrastructure/graph/services/RelationshipService.ts (relationship CRUD with directional query support)
- apps/api/src/infrastructure/graph/services/QueryService.ts (ID lookup, neighbor traversal, text search, shortest path)
- apps/api/src/infrastructure/graph/services/index.ts (barrel export)

Files Modified:
- apps/api/src/infrastructure/index.ts (added exports for Neo4jClient and all 3 service classes/types)
- apps/api/package.json (added neo4j-driver ^5.28.3 dependency)

Dependencies Added:
- neo4j-driver ^5.28.3 (production, apps/api)

Architectural Decisions:
- Neo4jClient extends GraphClient abstract class, maintaining the dependency inversion pattern established in EPIC-003
- Session-per-operation pattern with try/finally ensures no session leakage
- Integer-to-number conversion centralized in Neo4jClient via recursive convertIntegers helper — all downstream services receive plain JS objects
- getServerInfo() called during connect() to verify live connection (not just driver instantiation)
- Services use constructor injection of Neo4jClient (not inheritance) for clean separation of concerns
- Cypher queries use parameterized patterns ($params) — no string interpolation for user data, preventing Cypher injection
- Label names use template literals with backtick escaping (Cypher convention) for dynamic labels
- NodeService includes createConstraint/createIndex for graph schema initialization (matching DATABASE_SCHEMA.md requirements)
- Each service returns typed domain objects (GraphNode, GraphRelationship, Subgraph, GraphPath) rather than raw records
- Shortest path via Neo4j's built-in shortestPath() function — efficient graph traversal

Known Risks:
- Cypher label/type names are interpolated via template literals — safe because values are internal constants, not user input; labels must match known GraphNode types exactly
- 3 service classes depend on Neo4jClient; integration tests require a running Neo4j instance
- Neo4j Integer objects from driver results are converted to JS numbers — very large integers (>53 bits) lose precision (unlikely for our use case of line numbers, file sizes)
- QueryService.findPath uses shortestPath() which may time out on large graphs without depth limits (maxDepth defaults to 10, settable by caller)
- searchNodes uses CONTAINS (case-sensitive) — future improvement could use case-insensitive regex or fulltext indexes

Verification Results:
- TypeScript type check (root): PASSED
- TypeScript type check (api): PASSED
- ESLint: PASSED (no errors)
- Prettier format check: PASSED (all files formatted)

Next Recommended Tasks:
- EPIC-007: GitHub Import (TASK-037 through TASK-040)

---

## EPIC-006: Repository Upload

Date: 2026-06-12

Completed Tasks:
- TASK-032: Implement ZIP upload endpoint (POST /api/v1/repositories/upload with multer multipart handling)
- TASK-033: Implement ZIP extraction service (adm-zip based extraction with path traversal protection)
- TASK-034: Implement repository validation (file size limit 500MB, supported source file check, empty/corrupt rejection)
- TASK-035: Implement file storage service (persistent storage by repositoryId, temp cleanup)
- TASK-036: Implement repository status tracking (PENDING → UPLOADED status update via RepositoryRepository.updateStatus)

Files Created:
- apps/api/src/services/repository/ZipExtractionService.ts (ZIP extraction with path traversal protection)
- apps/api/src/services/repository/RepositoryValidationService.ts (size, structure, source file validation)
- apps/api/src/services/repository/FileStorageService.ts (persistent storage management with cleanup)
- apps/api/src/services/repository/UploadService.ts (orchestrator: validate → extract → store → track)
- apps/api/src/services/repository/index.ts (barrel exports)
- apps/api/src/services/repository/__tests__/RepositoryValidationService.test.ts (9 unit tests)
- apps/api/src/services/repository/__tests__/ZipExtractionService.test.ts (3 unit tests)
- apps/api/src/routes/repository.ts (POST /upload, GET /:id with multer middleware)
- apps/api/vitest.config.ts (vitest configuration for API tests)

Files Modified:
- apps/api/src/infrastructure/database/schemas/interfaces.ts (expanded IRepository with description, sourceType, sourceUrl, localPath, full status enum)
- apps/api/src/infrastructure/database/schemas/Repository.ts (updated schema fields and enum to match DATABASE_SCHEMA.md)
- apps/api/src/infrastructure/database/repositories/RepositoryRepository.ts (added updateStatus method)
- apps/api/src/routes/index.ts (registered repositoryRouter)
- apps/api/src/index.ts (added ensureDirectories for upload storage paths at startup)
- apps/api/package.json (added multer, adm-zip, vitest dependencies; test scripts)
- packages/shared/src/env.ts (added UPLOAD_DIR env var with default ./uploads)
- eslint.config.js (relaxed no-explicit-any rule for test files)
- .env.example (added UPLOAD_DIR environment variable)
- apps/web/src/pages/RepositoryUpload.tsx (wired ZIP upload to API with loading/success/error states)

Dependencies Added:
- multer ^1.4.5-lts.1 (file upload multipart handling)
- adm-zip ^0.5.17 (ZIP archive extraction)
- @types/multer ^2.1.0 (dev, TypeScript definitions)
- @types/adm-zip ^0.5.8 (dev, TypeScript definitions)
- vitest ^4.1.8 (dev, test framework)

Architectural Decisions:
- Upload services placed in apps/api/src/services/repository/ (API responsibility, not analysis-engine)
- Database schema updated to match DATABASE_SCHEMA.md (IRepository interface expanded with missing fields)
- Status tracking uses existing RepositoryRepository.update method via updateStatus convenience method
- Storage path configurable via UPLOAD_DIR env var (defaults to ./uploads)
- Multer v1 used over v2 due to stable @types/multer compatibility (v2 lacks type definitions)
- AdmZip chosen for ZIP extraction (stable, well-tested, ESM-compatible)
- Temp directory cleanup in finally blocks prevents file leaks on failures
- Frontend upload wired with loading spinner, success state (repositoryId display), and error message
- vitest.config.ts created for isolated API test configuration (node environment, test file patterns)

Known Risks:
- Multer v1 has known vulnerabilities (deprecated); upgrade to v2 when type definitions stabilize
- ZIP extraction loads entire archive into memory (adm-zib synchronous); large archives may cause memory pressure
- No authentication layer yet (planned for future); upload endpoint is open
- Storage cleanup on server restart not handled (stale temp files may remain)
- Test coverage limited to unit tests for validation and extraction; no integration tests for route/upload flow

Verification Results:
- TypeScript type check: PASSED
- ESLint: PASSED (no errors)
- Prettier format check: PASSED (all files formatted)
- API build: PASSED
- Web build: PASSED (247 modules, 3 output files)
- Unit tests: PASSED (12/12 tests across 2 test files)
