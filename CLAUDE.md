# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# IMPORTANT:
# Always read memory-bank/architecture.md before writing any code. Include entire database schema.
# Always read memory-bank/web-design-document.md before writing any code.
# After adding a major feature or completing a milestone, update memory-bank/architecture.md.

## 🔒 Always Rules (Must Be Followed)

The following rules are non-negotiable and must be applied before generating any code or architecture:

- Always assume **single-server deployment**
- Never suggest managed services (e.g. Vercel, Supabase, Clerk, Firebase)
- Never introduce new infrastructure without explicit user approval
- Never collapse the system into a single giant file
- Always split logic into modular files by responsibility
- Always respect the existing database schema and API contract

## Modularity Rules (Always)

- Never implement features as a single large file
- Discourage “god files” that mix API logic, business logic, and data access
- Prefer small, focused modules with explicit imports


## Project Overview

**IdeaForge** is a project idea incubator and development platform. It's designed as a visual web interface that works in direct integration with Claude Code to transform raw project ideas into fully-validated, actionable development plans.

**The Core Loop:**
1. User submits raw project idea to Claude Code via terminal
2. Claude Code analyzes, validates, and enhances the idea
3. Claude Code sends structured data to the web platform's API endpoints
4. Web platform displays everything visually (scores, features, user flows, Kanban board)

This is a **single-user, self-hosted system** with no external dependencies.

## Key Design Documents

- [web-design-document.md](memory-bank/web-design-document.md) - Complete product specification and workflow
- [tech-stack.md](memory-bank/tech-stack.md) - Architecture decisions and deployment guide
- [Implementation.md](memory-bank/Implementation.md) - Step-by-step implementation guide

## Architecture

**Single-Server Stack:**
- Next.js 15 standalone build (frontend + API in one process)
- PostgreSQL 15+ (local database)
- Prisma ORM (type-safe database access)
- Caddy (reverse proxy + automatic HTTPS)
- systemd (process management)

**No external services, no managed platforms, zero monthly cost.**

## Database Schema

The system stores project ideas with related validation data:

**Core Models:**
- `Idea` - Original and enhanced project descriptions
- `Score` - Six-dimension validation scores (Uniqueness, Stickiness, Growth Trend, Pricing Potential, Upsell Potential, Customer Purchasing Power)
- `Improvement` - Strategic recommendations for weak areas
- `Feature` - Core features extracted for MVP
- `TechStack` - Technology recommendations
- `UserFlow` - JSON representation of page flows (nodes + edges)
- `KanbanTicket` - Development tasks with status tracking

All related data cascades on delete to maintain integrity.

## API Endpoint Structure

When implementing API routes, follow this pattern:

```
POST  /api/ideas                     - Create new idea with original + enhanced versions
GET   /api/ideas                     - List all ideas (for dashboard)
GET   /api/ideas/:id                 - Retrieve complete project data with all relations
POST  /api/ideas/:id/scores          - Add validation scores (all 6 dimensions)
POST  /api/ideas/:id/improvements    - Add strategic improvement suggestions
POST  /api/ideas/:id/features        - Add core features with priorities
POST  /api/ideas/:id/techstack       - Add technology recommendations
POST  /api/ideas/:id/userflow        - Add user flow diagram (nodes + edges as JSON)
POST  /api/ideas/:id/kanban          - Add Kanban tickets
PATCH /api/ideas/:id/kanban/:ticketId - Update ticket status
```

All endpoints receive JSON payloads from Claude Code and validate using Zod schemas.

## Claude Code Integration

**When analyzing project ideas, Claude Code must:**

1. **Enhance the original idea** - Add depth, clarity, and concrete details
2. **Score across 6 dimensions** - Each with rating (1-10) and justification
3. **Suggest improvements** - Address weak scoring areas with actionable recommendations
4. **Extract core features** - Must-have, Should-have, Nice-to-have priorities
5. **Recommend tech stack** - With justifications for each technology
6. **Generate user flow** - Pages, connections, decision points as graph data
7. **Create Kanban tickets** - Convert features into actionable development tasks

**Data transmission:**
- Structure all analysis output as JSON
- Make HTTP POST requests to the appropriate API endpoints
- Confirm successful transmission in terminal
- Handle errors gracefully and report to user

## Visualization Components

The web platform renders seven key visualization components:

**IdeaComparison**
- Side-by-side display of original vs enhanced idea
- Visual distinction highlighting improvements
- Responsive layout (stacks on mobile)

**ScoreDisplay**
- Progress bars for all 6 validation dimensions (X/10 rating)
- Color-coded by score strength (red < 5, yellow 5-7, green > 7)
- Expandable justifications for each dimension

**ImprovementsDisplay**
- Strategic recommendations grouped by dimension
- Actionable suggestions for weak areas
- Clear visual hierarchy

**FeaturesList**
- Core features grouped by priority (must-have, should-have, nice-to-have)
- Feature descriptions and details
- Visual emphasis on must-have features

**TechStackDisplay**
- Technology recommendations grouped by category
- Justifications for each technology choice
- Badge or card layout for visual appeal

**UserFlowDiagram** (@xyflow/react)
- Interactive node-based flowchart
- Nodes = pages/screens, Edges = navigation/actions
- Pan, zoom, and drag capabilities

**KanbanBoard**
- Task management with 5 columns (Backlog → To Do → In Progress → In Review → Done)
- Ticket cards with title, description, and status
- Visual progress tracking

## Development Workflow

**Local Development:**
```bash
npm install              # Install dependencies
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run database migrations
npm run dev             # Start Next.js dev server on :3000
```

**Database Operations:**
```bash
npx prisma studio       # Visual database browser
npx prisma migrate dev  # Create new migration
npx prisma db push      # Quick schema sync (dev only)
```

**Production Deployment:**
```bash
./deploy.sh             # Git pull → install → migrate → build → restart
```

## Critical Implementation Notes

**Next.js Configuration:**
- Must use `output: 'standalone'` in next.config.js
- This creates a self-contained build for single-server deployment

**Database Connection:**
- Use `DATABASE_URL` environment variable
- PostgreSQL connection via local socket (no network overhead)
- Connection pooling handled by Prisma

**API Response Format:**
- Always return JSON
- Include `success: boolean` and `error?: string`
- Return created resource IDs for linking related data

**User Flow JSON Structure:**
```typescript
{
  nodes: [
    { id: string, type: 'page' | 'decision', label: string, description?: string }
  ],
  edges: [
    { id: string, source: string, target: string, label?: string, condition?: string }
  ]
}
```

## Future MCP Integration

The system is designed to evolve into an MCP (Model Context Protocol) server where Claude Code can:
- Autonomously read project data
- Update Kanban ticket status as features are built
- Refine plans based on implementation feedback
- Create a closed feedback loop between planning and execution

When implementing MCP:
- Expose database queries as MCP tools
- Allow read/write access to Kanban tickets
- Maintain audit trail of autonomous updates

## Deployment Target

**Server Specifications:**
- 2 vCPU / 4 GB RAM / 80 GB disk
- Single-user workload
- No redundancy or high-availability requirements

**Resource Expectations:**
- ~210 MB RAM idle, ~300 MB under load
- Handles single-user traffic easily
- Database will never exceed capacity for realistic usage

## Project Status

Currently in planning phase. No code has been written yet.

When initializing the project:
1. Run `npx create-next-app@latest` with TypeScript + Tailwind
2. Install dependencies: `@prisma/client`, `recharts`, `reactflow`, `@dnd-kit/core`, `@dnd-kit/sortable`, `zod`
3. Set up Prisma with the schema from [tech-stack.md](tech-stack.md)
4. Create API routes following the structure above
5. Build visualization components
6. Deploy to single server using systemd + Caddy
