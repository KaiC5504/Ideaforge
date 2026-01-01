# IdeaForge - Implementation Guide

**Target Domain:** https://kaic5504.com
**Architecture:** Single-server, self-hosted Next.js application with local PostgreSQL database

This document provides step-by-step instructions for AI developers to implement the base IdeaForge platform. Each step includes validation tests to confirm correct implementation.

---

## Phase 1: Project Initialization

### Step 1.1: Create Next.js Project

**Instructions:**
1. Initialize a new Next.js project with TypeScript, App Router, Tailwind CSS, and ESLint
2. Use the App Router (not Pages Router)
3. Configure the project to use the `src/` directory structure
4. Set up TypeScript with strict mode enabled

**Test:**
- Run the development server and verify it starts without errors
- Access `http://localhost:3000` and confirm the default Next.js welcome page displays
- Verify `tsconfig.json` exists with `"strict": true`
- Confirm `src/app/page.tsx` exists

---

### Step 1.2: Configure Next.js for Standalone Build

**Instructions:**
1. Open `next.config.js` (or create `next.config.ts`)
2. Add configuration option `output: 'standalone'`
3. This setting creates a self-contained build for single-server deployment

**Test:**
- Run `npm run build`
- Verify the `.next/standalone` directory is created
- Verify `server.js` exists in `.next/standalone`
- Confirm build completes without errors

---

### Step 1.3: Install Core Dependencies

**Instructions:**
1. Install Prisma dependencies: `@prisma/client` and `prisma` (dev dependency)
2. Install validation library: `zod`
3. Install visualization libraries: `recharts`, `@xyflow/react`
4. Install drag-and-drop libraries: `@dnd-kit/core` and `@dnd-kit/sortable`
5. Verify all packages are added to `package.json`

**Test:**
- Run `npm install` and verify no errors
- Check `package.json` to confirm all dependencies are listed
- Run `npm list @prisma/client zod recharts @xyflow/react @dnd-kit/core @dnd-kit/sortable`
- Verify no missing peer dependency warnings

---

## Phase 2: Database Setup

### Step 2.1: Initialize Prisma

**Instructions:**
1. Run Prisma initialization command to create the Prisma directory
2. Specify PostgreSQL as the database provider
3. Verify that `prisma/schema.prisma` file is created
4. Verify that a `.env` file is created (or updated if it exists)

**Test:**
- Confirm `prisma/schema.prisma` exists
- Verify the file contains `provider = "postgresql"`
- Confirm `.env` file exists with `DATABASE_URL` placeholder
- Check that `.gitignore` includes `.env`

---

### Step 2.2: Define Database Schema

**Instructions:**
1. Open `prisma/schema.prisma`
2. Define the complete database schema with the following models:
   - **Idea**: `id` (String, cuid, primary key), `originalIdea` (Text), `enhancedIdea` (Text), `createdAt` (DateTime, default now)
   - **Score**: `id` (String, cuid, primary key), `ideaId` (String), `dimension` (String), `score` (Int), `justification` (Text), relation to Idea with cascade delete, index on `ideaId`
   - **Improvement**: `id` (String, cuid, primary key), `ideaId` (String), `dimension` (String), `suggestion` (Text), relation to Idea with cascade delete, index on `ideaId`
   - **Feature**: `id` (String, cuid, primary key), `ideaId` (String), `name` (String), `description` (Text), `priority` (String), relation to Idea with cascade delete, index on `ideaId`
   - **TechStack**: `id` (String, cuid, primary key), `ideaId` (String), `category` (String), `technology` (String), `justification` (Text), relation to Idea with cascade delete, index on `ideaId`
   - **KanbanTicket**: `id` (String, cuid, primary key), `ideaId` (String), `title` (String), `description` (Text), `status` (String, default "backlog"), `effort` (String, nullable), relation to Idea with cascade delete, index on `ideaId`
3. Add a `userFlow` field to the Idea model as `Json` type (nullable)
4. Ensure all foreign key relations use `onDelete: Cascade`

**Test:**
- Run `npx prisma format` and verify no syntax errors
- Run `npx prisma validate` and confirm schema is valid
- Verify all 6 related models are defined (Score, Improvement, Feature, TechStack, KanbanTicket, and userFlow field)
- Confirm cascade delete is configured on all relations

---

### Step 2.3: Configure Database Connection

**Instructions:**
1. Open `.env` file
2. Set `DATABASE_URL` to: `postgresql://ideaforge:your_password@localhost/ideaforge`
3. Replace `your_password` with the actual password that will be used
4. This assumes local PostgreSQL installation with database named `ideaforge` and user `ideaforge`

**Test:**
- Verify `.env` contains `DATABASE_URL` with correct format
- Confirm the connection string includes: username, password, host (localhost), database name
- Check that `.env` is listed in `.gitignore`

---

### Step 2.4: Create Initial Database Migration

**Instructions:**
1. Run Prisma migration command to create the first migration
2. Name the migration "init" or "initial_schema"
3. This creates migration files and applies them to the database
4. Generates Prisma Client code

**Test:**
- Verify `prisma/migrations/` directory exists
- Confirm migration folder contains `migration.sql` file
- Run `npx prisma studio` and verify all tables are visible (Idea, Score, Improvement, Feature, TechStack, KanbanTicket)
- Check that `node_modules/.prisma/client` directory exists

---

### Step 2.5: Create Database Client Utility

**Instructions:**
1. Create file `src/lib/db.ts`
2. Import `PrismaClient` from `@prisma/client`
3. Create a singleton instance of PrismaClient that prevents multiple instances in development
4. Use global variable caching to avoid connection issues during hot reload
5. Export the Prisma client instance as `db`

**Test:**
- Verify `src/lib/db.ts` exists
- Import the db client in a test file and verify no TypeScript errors
- Confirm the file exports a variable named `db`
- Check that TypeScript autocomplete works when typing `db.` (should show models)

---

## Phase 3: API Routes - Core Idea Management

### Step 3.1: Create POST /api/ideas Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/route.ts`
2. Export an async function named `POST`
3. Accept JSON body with fields: `originalIdea` (string), `enhancedIdea` (string)
4. Validate request body using Zod schema
5. Use Prisma client to create new Idea record in database
6. Return JSON response with created idea (include `id` and `createdAt`)
7. Handle errors with appropriate HTTP status codes (400 for validation, 500 for server errors)

**Test:**
- Start development server
- Send POST request to `http://localhost:3000/api/ideas` with JSON body:
  ```json
  {
    "originalIdea": "Test idea",
    "enhancedIdea": "Enhanced test idea"
  }
  ```
- Verify response has status 200 and includes `id` field
- Check database using Prisma Studio to confirm record was created
- Send invalid request (missing fields) and verify 400 error response

---

### Step 3.2: Create GET /api/ideas/[id] Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/[id]/route.ts`
2. Export an async function named `GET`
3. Extract `id` parameter from the request
4. Query database for Idea with matching id
5. Include all related data: scores, improvements, features, techStack, kanbanTickets
6. Return 404 if idea not found
7. Return idea with all nested relations as JSON

**Test:**
- Create an idea using POST endpoint from Step 3.1
- Copy the returned `id` value
- Send GET request to `http://localhost:3000/api/ideas/{id}`
- Verify response contains originalIdea, enhancedIdea, and empty arrays for relations
- Send GET request with non-existent id and verify 404 response
- Check that response includes fields: `scores`, `improvements`, `features`, `techStack`, `kanbanTickets`

---

### Step 3.3: Create GET /api/ideas Endpoint

**Instructions:**
1. Open file `src/app/api/ideas/route.ts` (already created in Step 3.1)
2. Export an async function named `GET`
3. Query database for all ideas, ordered by creation date (most recent first)
4. Optionally include basic metadata (id, originalIdea truncated, enhancedIdea truncated, createdAt)
5. Do NOT include full related data (scores, features, etc.) - just the idea basics for list display
6. Return array of ideas as JSON
7. Return empty array if no ideas exist (not an error)

**Test:**
- Send GET request to `http://localhost:3000/api/ideas`
- Verify response is an array (empty or with ideas)
- Create several ideas via POST endpoint
- Send GET request again and verify all ideas appear
- Confirm ideas are sorted by creation date (newest first)
- Verify response doesn't include full related data (keeps payload small)

---

## Phase 4: API Routes - Related Data

### Step 4.1: Create POST /api/ideas/[id]/scores Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/[id]/scores/route.ts`
2. Export async POST function
3. Accept array of score objects with fields: `dimension` (string), `score` (number 1-10), `justification` (string)
4. Validate that the idea exists before creating scores
5. Use Zod to validate each score object
6. Create all score records linked to the idea (use `createMany` or individual creates)
7. Return created scores as JSON

**Test:**
- Create an idea first
- Send POST to `http://localhost:3000/api/ideas/{id}/scores` with body:
  ```json
  [
    {"dimension": "Uniqueness", "score": 8, "justification": "Test justification"},
    {"dimension": "Stickiness", "score": 6, "justification": "Another test"}
  ]
  ```
- Verify 200 response with created scores
- Use GET /api/ideas/{id} to confirm scores are attached
- Send request with invalid idea id and verify 404
- Send invalid score (score: 15) and verify 400 validation error

---

### Step 4.2: Create POST /api/ideas/[id]/improvements Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/[id]/improvements/route.ts`
2. Export async POST function
3. Accept array of improvement objects with fields: `dimension` (string), `suggestion` (string)
4. Validate that the idea exists before creating improvements
5. Use Zod to validate each improvement object
6. Create all improvement records linked to the idea
7. Return created improvements as JSON

**Test:**
- Create an idea first
- Send POST to `http://localhost:3000/api/ideas/{id}/improvements` with body:
  ```json
  [
    {"dimension": "Uniqueness", "suggestion": "Add a unique gamification feature that competitors don't offer"},
    {"dimension": "Stickiness", "suggestion": "Implement daily challenges and streak tracking"}
  ]
  ```
- Verify 200 response with created improvements
- Use GET /api/ideas/{id} to confirm improvements are attached
- Send request with invalid idea id and verify 404
- Send request with missing fields and verify 400 validation error

---

### Step 4.3: Create POST /api/ideas/[id]/features Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/[id]/features/route.ts`
2. Export async POST function
3. Accept array of feature objects: `name` (string), `description` (string), `priority` (string: "must-have", "should-have", or "nice-to-have")
4. Validate idea exists
5. Validate each feature with Zod (ensure priority is one of the three valid values)
6. Create feature records in database
7. Return created features

**Test:**
- Create an idea
- POST to `http://localhost:3000/api/ideas/{id}/features`:
  ```json
  [
    {"name": "User login", "description": "Authentication system", "priority": "must-have"},
    {"name": "Dashboard", "description": "Main view", "priority": "should-have"}
  ]
  ```
- Verify features are created and returned
- GET the idea and confirm features are included
- Send invalid priority value and verify 400 error

---

### Step 4.4: Create POST /api/ideas/[id]/techstack Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/[id]/techstack/route.ts`
2. Export async POST function
3. Accept array of tech stack items: `category` (string), `technology` (string), `justification` (string)
4. Validate idea exists
5. Use Zod to validate each item
6. Create records in database
7. Return created tech stack items

**Test:**
- Create an idea
- POST to `http://localhost:3000/api/ideas/{id}/techstack`:
  ```json
  [
    {"category": "Frontend", "technology": "Next.js", "justification": "Server-side rendering"},
    {"category": "Database", "technology": "PostgreSQL", "justification": "Relational data"}
  ]
  ```
- Verify items created
- GET idea to confirm tech stack is attached

---

### Step 4.5: Create POST /api/ideas/[id]/kanban Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/[id]/kanban/route.ts`
2. Export async POST function
3. Accept array of tickets: `title` (string), `description` (string), `status` (string, optional, defaults to "backlog"), `effort` (string, optional)
4. Validate idea exists
5. Validate ticket data with Zod
6. Create kanban tickets in database
7. Return created tickets

**Test:**
- Create an idea
- POST to `http://localhost:3000/api/ideas/{id}/kanban`:
  ```json
  [
    {"title": "Setup project", "description": "Initialize repo", "status": "backlog"},
    {"title": "Build auth", "description": "User authentication", "effort": "3 days"}
  ]
  ```
- Verify tickets created with correct default status
- GET idea and confirm kanban tickets included

---

### Step 4.6: Create PATCH /api/ideas/[id]/kanban/[ticketId] Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/[id]/kanban/[ticketId]/route.ts`
2. Export async PATCH function
3. Accept JSON body with `status` field (string: "backlog", "todo", "in-progress", "in-review", "done")
4. Validate both idea and ticket exist
5. Validate new status using Zod enum
6. Update ticket status in database
7. Return updated ticket

**Test:**
- Create idea and kanban ticket
- PATCH to `http://localhost:3000/api/ideas/{ideaId}/kanban/{ticketId}`:
  ```json
  {"status": "in-progress"}
  ```
- Verify response shows updated status
- GET idea and confirm status changed
- Try invalid status value and verify 400 error
- Try non-existent ticket id and verify 404

---

### Step 4.7: Create POST /api/ideas/[id]/userflow Endpoint

**Instructions:**
1. Create file `src/app/api/ideas/[id]/userflow/route.ts`
2. Export async POST function
3. Accept JSON with structure: `{nodes: [], edges: []}`
4. Each node should have: `id` (string), `type` (string), `label` (string), optional `description`
5. Each edge should have: `id` (string), `source` (string), `target` (string), optional `label`, optional `condition`
6. Validate idea exists
7. Store entire JSON structure in the `userFlow` field of the Idea
8. Return the updated idea

**Test:**
- Create an idea
- POST to `http://localhost:3000/api/ideas/{id}/userflow`:
  ```json
  {
    "nodes": [
      {"id": "1", "type": "page", "label": "Home"},
      {"id": "2", "type": "page", "label": "Login"}
    ],
    "edges": [
      {"id": "e1", "source": "1", "target": "2", "label": "Click login"}
    ]
  }
  ```
- Verify 200 response
- GET idea and confirm `userFlow` field contains the data
- Verify data structure is preserved (not stringified)

---

## Phase 5: Frontend - Basic Layout

**IMPORTANT - UI/UX Development Approach:**
Before implementing any UI/UX components in this phase, invoke the **ui-ux-pro-max** skill to get design recommendations, component implementations, and styling guidance. This skill provides access to 50 styles, 21 color palettes, 50 font pairings, and optimized implementations for React/Next.js components.

**To use the skill:** Call the Skill tool with `skill: "ui-ux-pro-max"` and describe what you need to design or build (e.g., "design a modern header for IdeaForge", "create a dashboard layout with card grid").

### Step 5.1: Create Root Layout

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill to get design recommendations for the root layout, header, and footer
2. Open `src/app/layout.tsx`
3. Set up HTML structure with proper metadata
4. Set page title to "IdeaForge - Project Idea Incubator"
5. Include Tailwind CSS base styles
6. Create a simple header with site logo/title (using design from ui-ux-pro-max)
7. Add a footer with minimal information (using design from ui-ux-pro-max)
8. Use semantic HTML (header, main, footer elements)

**Test:**
- Start dev server and visit `http://localhost:3000`
- Verify page title in browser tab shows "IdeaForge - Project Idea Incubator"
- Check that header and footer are visible
- Inspect page and confirm Tailwind styles are applied (check for Tailwind utility classes working)
- Verify no console errors in browser

---

### Step 5.2: Create Dashboard Page (Ideas List)

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill to design the dashboard layout and idea cards with modern styling
2. Open or create `src/app/page.tsx`
3. Create a server component that fetches all ideas from database (use Prisma directly via `db.idea.findMany()` or fetch from GET /api/ideas endpoint)
4. Display ideas in a grid or list layout (implement design from ui-ux-pro-max)
5. Each idea card should show: original idea (truncated), enhanced idea (truncated), creation date
6. Make each card clickable/linkable to the detail page `/ideas/{id}`
7. Show message "No ideas yet" if database is empty
8. Use Tailwind for styling (following ui-ux-pro-max recommendations)

**Test:**
- Visit `http://localhost:3000`
- Verify "No ideas yet" message appears (assuming empty database)
- Create an idea via API POST request
- Refresh page and confirm idea card appears
- Click card and verify navigation to `/ideas/{id}` (will 404 for now)
- Create multiple ideas and verify all appear in list

---

### Step 5.3: Create Idea Detail Page Structure

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill to design the detail page layout with section organization
2. Create file `src/app/ideas/[id]/page.tsx`
3. Create a server component that receives `id` as parameter
4. Fetch the idea with all related data (scores, features, techStack, kanban, userFlow)
5. Handle case where idea doesn't exist (show 404 message or redirect)
6. Display the idea title/header (using design from ui-ux-pro-max)
7. Create placeholder sections for: Original vs Enhanced, Scores, Features, Tech Stack, User Flow, Kanban
8. For now, just show section headers with raw JSON data dumps

**Test:**
- Create an idea with all related data via API
- Visit `http://localhost:3000/ideas/{id}`
- Verify page loads without errors
- Confirm all section headers are visible
- Verify raw data is displayed (JSON or simple list)
- Try non-existent id and confirm 404 handling works

---

## Phase 6: Frontend - Core Visualizations

**IMPORTANT - UI/UX Development Approach:**
All visualization components in this phase should be designed and implemented using the **ui-ux-pro-max** skill. This ensures consistent styling, proper responsive design, accessibility, and modern UI patterns. Invoke the skill for each component before implementation to get optimized code with proper Tailwind styling, color palettes, animations, and layout patterns.

### Step 6.1: Create Idea Comparison Component

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill with a request like: "Design a comparison component showing original vs enhanced idea text side-by-side, responsive layout, with visual distinction for enhanced version"
2. Create file `src/components/IdeaComparison.tsx`
3. Create a client component (use "use client" directive)
4. Accept props: `originalIdea` (string), `enhancedIdea` (string)
5. Implement the design from ui-ux-pro-max: two columns side-by-side (responsive: stack on mobile)
6. Left column: "Original Idea" with the original text
7. Right column: "Enhanced Idea" with enhanced text
8. Use Tailwind styling from ui-ux-pro-max recommendations: borders, padding, background colors, gradients
9. Highlight the enhanced version with a distinct color/style as designed

**Test:**
- Import component in idea detail page
- Pass actual idea data as props
- Verify two-column layout on desktop
- Resize browser to mobile width and confirm columns stack vertically
- Verify both texts are fully readable
- Confirm enhanced idea has visual distinction

---

### Step 6.2: Create Score Display Component

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill: "Design a score display component with 6 dimensions shown as progress bars, each showing X/10 rating, color-coded (red/yellow/green based on score), with expandable justifications"
2. Create file `src/components/ScoreDisplay.tsx`
3. Create a client component
4. Accept props: `scores` (array of score objects)
5. For each dimension, display a horizontal progress bar that fills based on the score (e.g., 7/10 = 70% filled)
6. Color-code the progress bars: red for scores < 5, yellow for 5-7, green for > 7
7. Show the score value as "X/10" next to or above each bar
8. Display the dimension name clearly
9. Make justification text expandable/collapsible or show on hover
10. Use Tailwind for layout and styling as recommended by ui-ux-pro-max

**Test:**
- Import in idea detail page
- Pass scores array as props
- Verify all 6 dimensions display
- Check color coding matches score values
- Confirm justification text is readable
- Test with different score values to verify color logic

---

### Step 6.3: Create Improvements Display Component

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill: "Design a strategic improvements display component showing improvement suggestions grouped by dimension, with clear visual hierarchy and actionable layout"
2. Create file `src/components/ImprovementsDisplay.tsx`
3. Create a client component
4. Accept props: `improvements` (array of improvement objects with `dimension` and `suggestion` fields)
5. Display improvements in a clear, organized layout (cards, list, or grouped by dimension)
6. Show which dimension each improvement addresses
7. Make suggestions stand out as actionable recommendations
8. Use Tailwind styling from ui-ux-pro-max recommendations
9. Consider grouping improvements by dimension or displaying them in priority order

**Test:**
- Import in idea detail page
- Pass improvements array as props
- Verify all improvements display clearly
- Check that dimension labels are visible
- Confirm suggestions are readable and well-formatted
- Test with improvements for different dimensions

---

### Step 6.4: Create Features List Component

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill: "Design a features list component with 3 priority groups (must-have, should-have, nice-to-have), visual hierarchy emphasizing must-haves, modern card or badge layout"
2. Create file `src/components/FeaturesList.tsx`
3. Create a client component
4. Accept props: `features` (array of feature objects)
5. Implement ui-ux-pro-max design: group features by priority (must-have, should-have, nice-to-have)
6. Display each group in separate sections with headers
7. Show feature name and description
8. Use visual hierarchy from design: must-haves most prominent
9. Use Tailwind for styling and layout as recommended

**Test:**
- Import in idea detail page
- Pass features array as props
- Verify features are grouped correctly
- Confirm must-haves appear first and most prominently
- Check that all feature details are visible
- Test with features across all three priority levels

---

### Step 6.5: Create Tech Stack Display Component

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill: "Design a tech stack display component showing technologies grouped by category, with badges or cards, include justifications, modern professional style"
2. Create file `src/components/TechStackDisplay.tsx`
3. Create a client component
4. Accept props: `techStack` (array of tech stack items)
5. Implement ui-ux-pro-max design: group items by category (Frontend, Backend, Database, etc.)
6. Display each technology with its justification
7. Use card or badge layout from the design for visual appeal
8. Style with Tailwind following recommendations

**Test:**
- Import in idea detail page
- Pass tech stack array as props
- Verify items are grouped by category
- Confirm all technologies and justifications display
- Check visual layout is clean and organized
- Test with items from multiple categories

---

### Step 6.6: Create Kanban Board Component (Basic)

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill: "Design a kanban board with 5 columns (Backlog, To Do, In Progress, In Review, Done), ticket cards with title and description, modern clean layout, no drag-drop yet"
2. Create file `src/components/KanbanBoard.tsx`
3. Create a client component
4. Accept props: `tickets` (array), `ideaId` (string)
5. Implement ui-ux-pro-max design: create 5 columns (Backlog, To Do, In Progress, In Review, Done)
6. Filter tickets into appropriate columns by status
7. Display each ticket as a card with title and description using the design
8. For now, make it static (no drag-drop yet)
9. Add styling with Tailwind following the recommendations

**Test:**
- Create kanban tickets with different statuses
- Import component in idea detail page
- Pass tickets and ideaId as props
- Verify 5 columns appear
- Confirm tickets are in correct columns based on status
- Check that ticket details are readable
- Verify empty columns show correctly

---

### Step 6.7: Create User Flow Diagram Component

**Instructions:**
1. **FIRST:** Invoke the ui-ux-pro-max skill: "Design an interactive user flow diagram component using React Flow (@xyflow/react), showing pages/screens as nodes connected by navigation edges, with zoom and drag capabilities"
2. Create file `src/components/UserFlowDiagram.tsx`
3. Create a client component (React Flow requires client-side rendering)
4. Install and import from `@xyflow/react` package
5. Accept props: `userFlow` (object with `nodes` and `edges` arrays)
6. Each node should display: label, type (page/decision), and optional description
7. Each edge should show the connection between nodes with optional label
8. Implement interactive features: pan, zoom, and drag nodes
9. Style nodes and edges using Tailwind and React Flow's styling options
10. Make the diagram responsive and ensure it fits within its container
11. Add controls for zoom in/out and fit view

**Test:**
- Import in idea detail page
- Pass userFlow data as props (nodes and edges from API)
- Verify all nodes appear with correct labels
- Confirm edges connect the right nodes
- Test pan and zoom functionality
- Verify the diagram is readable and well-organized
- Check that the component handles empty or minimal flow data gracefully
- Test with complex flows (many nodes and edges)

---

## Phase 7: Server Configuration Files

### Step 7.1: Create Systemd Service File Template

**Instructions:**
1. Create file `deployment/ideaforge.service`
2. Define a systemd unit file with:
   - Description: "IdeaForge Web Application"
   - After: network.target, postgresql.service
   - Type: simple
   - User: www-data
   - WorkingDirectory: /var/www/ideaforge
   - Environment variables: NODE_ENV=production, DATABASE_URL (placeholder)
   - ExecStart: node .next/standalone/server.js
   - Restart: on-failure
3. Add documentation comments explaining each section

**Test:**
- Verify file exists at `deployment/ideaforge.service`
- Check that all required systemd sections are present: [Unit], [Service], [Install]
- Confirm ExecStart points to correct path
- Verify DATABASE_URL is included as environment variable
- Validate syntax by running `systemd-analyze verify deployment/ideaforge.service` (if systemd available)

---

### Step 7.2: Create Caddyfile Template

**Instructions:**
1. Create file `deployment/Caddyfile`
2. Configure reverse proxy for domain kaic5504.com
3. Set up proxy to localhost:3000
4. Include comments explaining automatic HTTPS
5. Keep configuration minimal and production-ready

**Test:**
- Verify file exists at `deployment/Caddyfile`
- Confirm domain is set to kaic5504.com
- Check reverse_proxy directive points to localhost:3000
- Validate Caddy syntax (if Caddy is installed locally, run `caddy validate --config deployment/Caddyfile`)

---

### Step 7.3: Create Deployment Script

**Instructions:**
1. Create file `deployment/deploy.sh`
2. Add bash shebang (#!/bin/bash)
3. Include commands for:
   - cd to project directory
   - git pull
   - npm install
   - npx prisma migrate deploy
   - npm run build
   - systemctl restart ideaforge
4. Add error handling (exit on error)
5. Make file executable

**Test:**
- Verify file exists at `deployment/deploy.sh`
- Check that file has execute permissions (or add them)
- Verify commands are in correct order
- Confirm Prisma migrate uses `deploy` not `dev`
- Validate bash syntax by running `bash -n deployment/deploy.sh`

---

### Step 7.4: Create Environment Variables Template

**Instructions:**
1. Create file `.env.example`
2. List all required environment variables with placeholder values:
   - DATABASE_URL with example PostgreSQL connection string
   - NODE_ENV set to production
   - Any other config needed
3. Add comments explaining each variable
4. Do NOT include actual secrets

**Test:**
- Verify `.env.example` exists
- Confirm it includes DATABASE_URL with format: postgresql://user:password@host/database
- Check that file is tracked in git
- Verify `.env` is in `.gitignore`
- Confirm no actual passwords or secrets are in the example file

---

## Phase 8: Database Setup Documentation

### Step 8.1: Create Database Initialization Script

**Instructions:**
1. Create file `deployment/init-database.sh`
2. Add bash commands to:
   - Create PostgreSQL database named `ideaforge`
   - Create PostgreSQL user named `ideaforge` with password (from env variable)
   - Grant all privileges on database to user
   - Configure PostgreSQL to allow local connections
3. Add comments explaining each step
4. Include safety checks (e.g., check if database already exists)

**Test:**
- Verify file exists at `deployment/init-database.sh`
- Check all PostgreSQL commands are correct (createdb, createuser, GRANT)
- Confirm script uses variables for password (not hardcoded)
- Validate bash syntax with `bash -n deployment/init-database.sh`

---

### Step 8.2: Document Prisma Migration Process

**Instructions:**
1. Create or update `README.md` file
2. Add section titled "Database Setup"
3. Document commands for:
   - Initial Prisma setup
   - Creating migrations
   - Running migrations in development
   - Deploying migrations to production
   - Viewing database with Prisma Studio
4. Include warnings about using `db push` vs `migrate` in production

**Test:**
- Verify README.md has "Database Setup" section
- Confirm all Prisma commands are documented
- Check that production vs development processes are clearly distinguished
- Verify commands are copy-pasteable (proper formatting)

---

## Phase 9: Basic End-to-End Validation

### Step 9.1: Create Test Idea via API

**Instructions:**
1. Start the development server
2. Use a tool like curl, Postman, or a script to POST a test idea
3. Verify the response includes an ID
4. Store the ID for subsequent tests

**Test:**
- POST to `http://localhost:3000/api/ideas` with test data
- Verify 200 status code
- Confirm response includes `id`, `originalIdea`, `enhancedIdea`, `createdAt`
- Check that timestamps are valid ISO 8601 format

---

### Step 9.2: Add Complete Related Data

**Instructions:**
1. Using the idea ID from previous step, POST scores (all 6 dimensions)
2. POST features (at least 3 with different priorities)
3. POST tech stack items (at least 4 across different categories)
4. POST kanban tickets (at least 5 with different statuses)
5. POST user flow data (nodes and edges)

**Test:**
- Send all 5 POST requests to respective endpoints
- Verify each returns 200 status
- Check that all data is accepted without validation errors
- Confirm each response includes created records

---

### Step 9.3: Verify Complete Idea Retrieval

**Instructions:**
1. GET the idea using the ID
2. Verify all nested relations are included in response
3. Check data integrity

**Test:**
- GET `http://localhost:3000/api/ideas/{id}`
- Confirm response includes all fields: scores, features, techStack, kanbanTickets, userFlow
- Verify arrays contain the correct number of items
- Check that userFlow is valid JSON object (not stringified)
- Validate that all text fields display correctly (no encoding issues)

---

### Step 9.4: Verify Dashboard Display

**Instructions:**
1. Open browser to `http://localhost:3000`
2. Check that the test idea appears in the list
3. Click the idea card

**Test:**
- Verify idea card shows on dashboard
- Confirm truncated text is readable
- Click card and verify navigation to `/ideas/{id}`
- Check that no errors appear in browser console
- Verify page loads in under 2 seconds

---

### Step 9.5: Verify Detail Page Display

**Instructions:**
1. On the idea detail page, verify all sections render
2. Check that all data is visible
3. Verify components display correctly

**Test:**
- Confirm Idea Comparison shows both original and enhanced ideas
- Verify all 6 score dimensions appear with correct color coding
- Check features are grouped by priority correctly
- Confirm tech stack items are categorized
- Verify kanban board shows all 5 columns with tickets in correct positions
- Check that no data is missing or displaying as "undefined"
- Verify mobile responsiveness (resize browser)

---

## Phase 10: Production Readiness

### Step 10.1: Add Error Logging

**Instructions:**
1. Add console.error logging to all API route error handlers
2. Include context information: endpoint, error message, stack trace
3. Ensure errors don't expose sensitive information to clients

**Test:**
- Trigger an API error (invalid request)
- Check server console logs include error details
- Verify client receives generic error message (no stack traces)
- Confirm no environment variables or secrets are logged

---

### Step 10.2: Add Request Validation to All Endpoints

**Instructions:**
1. Review all API routes
2. Ensure every endpoint validates input with Zod
3. Return 400 errors with clear validation messages
4. Check that required fields are enforced

**Test:**
- Send requests with missing required fields to each endpoint
- Verify all return 400 status codes
- Confirm error messages clearly state what's wrong
- Try invalid data types and verify validation catches them

---

### Step 10.3: Configure Production Environment Variables

**Instructions:**
1. Update `.env.example` with all production variables
2. Document which variables must be changed for production
3. Add validation that required env vars are present at startup

**Test:**
- Try starting app without DATABASE_URL and verify it fails gracefully
- Verify .env.example has comments for production setup
- Confirm no default secrets are used in production

---

### Step 10.4: Build Production Bundle

**Instructions:**
1. Run `npm run build` with NODE_ENV=production
2. Verify standalone build is created
3. Check that all dependencies are bundled
4. Verify static assets are optimized

**Test:**
- Run `npm run build`
- Verify `.next/standalone` directory exists
- Check that `server.js` is present
- Run `node .next/standalone/server.js` and verify app starts
- Visit app and confirm it works identically to dev mode
- Check that page load times are faster than dev mode

---

### Step 10.5: Test Production Database Migration

**Instructions:**
1. Create a separate test database
2. Run `npx prisma migrate deploy` against test database
3. Verify all tables are created
4. Test that migrations are idempotent (can run multiple times safely)

**Test:**
- Run migrate deploy twice on same database
- Verify second run doesn't fail or duplicate tables
- Check that all 6 tables exist (Idea + 5 related tables)
- Verify indexes are created on foreign key columns
- Confirm cascade deletes are configured

---

## Phase 11: Documentation

### Step 11.1: Create API Documentation

**Instructions:**
1. Create file `API.md`
2. Document all API endpoints with:
   - HTTP method and path
   - Request body schema (JSON)
   - Response format
   - Example requests and responses
   - Error codes and meanings
3. Include the domain: https://kaic5504.com

**Test:**
- Verify API.md exists and is complete
- Check that all 8+ endpoints are documented
- Confirm examples are valid JSON
- Verify domain is correctly listed as https://kaic5504.com

---

### Step 11.2: Create Deployment Guide

**Instructions:**
1. Create file `DEPLOYMENT.md`
2. Document step-by-step server setup:
   - Installing dependencies (Node.js, PostgreSQL, Caddy)
   - Database initialization
   - Application setup
   - Systemd service configuration
   - Caddy configuration
   - First deployment
   - Subsequent deployments
3. Include troubleshooting section

**Test:**
- Verify DEPLOYMENT.md exists
- Check that it references files in `deployment/` directory
- Confirm all shell commands are copy-pasteable
- Verify domain configuration uses kaic5504.com

---

### Step 11.3: Update Main README

**Instructions:**
1. Update README.md with:
   - Project overview
   - Quick start for local development
   - Architecture summary
   - Links to other documentation files
   - Tech stack list
   - Resource requirements
2. Keep it concise and high-level

**Test:**
- Verify README.md has clear structure
- Confirm it links to API.md and DEPLOYMENT.md
- Check that local development steps are accurate
- Verify a new developer could get started using only the README

---

## Phase 12: Final Validation

### Step 12.1: End-to-End Workflow Test

**Instructions:**
1. Start fresh: drop database and recreate
2. Run all migrations
3. Create complete idea with all related data via API
4. View on dashboard
5. View detail page with all components
6. Update a kanban ticket status
7. Verify update is reflected

**Test:**
- Complete entire workflow without errors
- Verify data persists correctly
- Check all visualizations render
- Confirm no console errors in browser or server
- Verify mobile and desktop views work

---

### Step 12.2: Performance Baseline

**Instructions:**
1. Measure page load times for dashboard
2. Measure page load times for detail page
3. Measure API response times for all endpoints
4. Document baseline performance metrics

**Test:**
- Dashboard loads in under 1 second (localhost)
- Detail page loads in under 2 seconds (localhost)
- API endpoints respond in under 500ms
- No memory leaks after creating 10 ideas

---

### Step 12.3: Security Review

**Instructions:**
1. Verify .env is in .gitignore
2. Check no secrets are committed to git
3. Verify API endpoints validate all input
4. Confirm SQL injection is not possible (Prisma handles this)
5. Check that error messages don't expose system details

**Test:**
- Search git history for DATABASE_URL with real credentials (should be none)
- Verify .gitignore includes .env
- Try SQL injection in API requests (should be prevented by Prisma)
- Trigger errors and verify responses are safe

---

### Step 12.4: Code Quality Check

**Instructions:**
1. Run TypeScript compiler in strict mode
2. Fix all type errors
3. Run ESLint and fix linting issues
4. Ensure consistent code formatting

**Test:**
- Run `npm run type-check` or `npx tsc --noEmit` with zero errors
- Run `npm run lint` with zero errors
- Verify all files use consistent indentation
- Check that no `any` types are used

---

## Completion Checklist

Verify all phases complete before considering base website finished:

- [ ] Next.js project initialized with standalone build
- [ ] All dependencies installed
- [ ] Database schema defined and migrated
- [ ] All 10 API endpoints implemented and tested (2 GET, 7 POST, 1 PATCH)
- [ ] Dashboard page shows ideas list
- [ ] Detail page displays all idea components
- [ ] All 7 visualization components created (IdeaComparison, ScoreDisplay, ImprovementsDisplay, FeaturesList, TechStackDisplay, UserFlowDiagram, KanbanBoard)
- [ ] Deployment files created (systemd, Caddy, scripts)
- [ ] Documentation complete (README, API, DEPLOYMENT)
- [ ] End-to-end workflow tested successfully
- [ ] Production build tested
- [ ] Security review passed
- [ ] Code quality standards met

---

## Next Steps (After Base Website)

Once base website is complete and all tests pass:

1. Implement advanced Kanban drag-and-drop functionality using @dnd-kit
2. Add automatic layout for user flow diagrams (auto-positioning nodes)
3. Build Claude Code integration script for automated idea submission
4. Create MCP server capabilities for bidirectional communication
5. Add export functionality (PDF, PNG, JSON)
6. Implement search and filtering for ideas dashboard
7. Add analytics and insights (e.g., average scores, completion rates)
8. Implement idea versioning and history tracking

These features build on the solid foundation established in this implementation guide.

---

**Last Updated:** 2026-01-01
**Target Deployment:** https://kaic5504.com
