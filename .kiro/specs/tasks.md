## Tasks

1. **task-1**: Project scaffolding
   Initialize Next.js project with TypeScript, Zod, Vercel AI SDK, and Vitest. Configure path aliases and test patterns.

2. **task-2**: Domain layer implementation (depends on: task-1)
   Create types.ts with all interfaces, schemas.ts with Zod validation, and errors.ts with typed error hierarchy.

3. **task-3**: Application layer implementation (depends on: task-2)
   Create GenerateArchitectureSpec use case with port interfaces, input/output validation pipeline, and error classification.

4. **task-4**: Infrastructure adapters (depends on: task-3)
   Implement JsonMockLoader, LLM client adapter (Vercel AI SDK), and KiroFileWriter with markdown formatters.

5. **task-5**: API route and mock data (depends on: task-4)
   Create Next.js App Router POST endpoint at /api/generate-spec and the agent1.mock.json fallback file.

6. **task-6**: Testing and verification (depends on: task-5)
   Write property-based tests (fast-check, 100+ iterations) for all 6 correctness properties, unit tests for all layers, and integration tests for the full pipeline.
