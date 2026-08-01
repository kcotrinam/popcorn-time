# Popcorn Time Project Instructions

## Project Overview

Popcorn Time is a multi-user personal media-management application for movies, series, anime, and documentaries. It supports personal watchlists, watched status, ratings from 1 to 10 in 0.5 increments, private comments, user recommendations, and shared viewing plans with up to five other users.

## Technology Stack

- pnpm monorepo
- Frontend: React, Vite, TypeScript, Material UI, and TanStack Query
- Backend: Node.js, Express, and TypeScript
- Database: PostgreSQL with Prisma
- Authentication: custom email/password sessions
- Local infrastructure: Docker Compose

## Architecture Rules

Backend modules follow `Router → Controller → Service → Repository → Prisma`. Keep business logic out of controllers and validate input with Zod. Do not use `any`. Do not add Zustand or Redux unless a real global client-state requirement has been explicitly approved.

## Authentication Rules

- The application owns authentication, password hashes, sessions, and tokens.
- Never expose JWT secrets, password hashes, or email tokens to the frontend.
- Use the application's UUID as the internal user ID and a normalized email address as the login identifier.

## Database Rules

- Use Prisma migrations—not `db push`—for schema changes.
- Use snake_case database names through Prisma mappings.
- Use soft deletes only where explicitly defined, preserve migration history, and inspect generated SQL before applying migrations.

## Current Phase and Task

Phase 0 is complete: monorepo foundation, frontend and backend applications, PostgreSQL and Prisma, Docker Compose, Swagger/OpenAPI, and testing/quality tooling. Custom email/password authentication provides registration, verification, sign-in, protected routes, logout, and the welcome screen.

The current task is to create the internal `users` table and remove the temporary `AppMetadata` model. Read relevant files under `docs/` before implementing a task.

## Validation

Before claiming completion, run the applicable format check, lint, typecheck, tests, and build. Do not report a command as passing unless it was executed successfully.
