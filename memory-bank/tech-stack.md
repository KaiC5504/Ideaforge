# IdeaForge - Tech Stack (Single-Server Architecture)

## Challenge Responses

### Justification Test
- **Vercel**: Prevents manual deployment → You have a server, removed
- **Supabase/Neon**: Prevents database management → PostgreSQL runs locally, removed
- **Clerk/NextAuth**: Prevents building auth → Single user needs no auth, removed
- **tRPC**: Prevents API boilerplate → Overkill for simple REST API, removed
- **Managed services**: All removed, nothing they provide is needed

### Cost Reality Check
You already pay for: CPU, RAM, storage, network, 24/7 uptime
External services duplicate: All of the above
Justification: None, eliminated

### Subtraction Results
Everything replaced by local processes on your single server

---

## The Complete Stack

**Runtime**
- Node.js 20+ (already has everything needed)

**Web Framework**
- Next.js standalone build (frontend + API in one process)

**Database**
- PostgreSQL 15+ (installed directly on server)

**Process Manager**
- systemd (built into Linux, zero dependencies)

**HTTPS/Reverse Proxy**
- Caddy (automatic Let's Encrypt certificates)

**Visualization Libraries**
- Recharts (charts run in browser, no server cost)
- React Flow (flowcharts run in browser, no server cost)
- @dnd-kit (drag-drop runs in browser, no server cost)

---

## Single-Box Architecture

```
Your Server (2 vCPU / 4 GB RAM / 80 GB disk)
│
├─ Caddy (:443) → HTTPS termination
│   └─ Reverse proxy to Node.js :3000
│
├─ Node.js Process (Next.js standalone)
│   ├─ Serves static frontend files
│   ├─ API routes (/api/*)
│   └─ Managed by systemd
│
└─ PostgreSQL (local socket)
    └─ Database: ideaforge
```

---

## Installation Steps

```bash
# 1. Install dependencies
sudo apt update
sudo apt install postgresql-15 nodejs npm caddy

# 2. Create database
sudo -u postgres createdb ideaforge
sudo -u postgres psql -c "CREATE USER ideaforge WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ideaforge TO ideaforge;"

# 3. Clone and build project
cd /var/www
git clone <your-repo> ideaforge
cd ideaforge
npm install
npm run build

# 4. Create systemd service
sudo nano /etc/systemd/system/ideaforge.service
# (see service file below)

# 5. Configure Caddy
sudo nano /etc/caddy/Caddyfile
# (see Caddy config below)

# 6. Start services
sudo systemctl enable --now ideaforge
sudo systemctl reload caddy
```

---

## Systemd Service File

```ini
[Unit]
Description=IdeaForge Web Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ideaforge
Environment="NODE_ENV=production"
Environment="DATABASE_URL=postgresql://ideaforge:your_password@localhost/ideaforge"
ExecStart=/usr/bin/node /var/www/ideaforge/.next/standalone/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

## Caddy Configuration

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

---

## Project Structure

```
ideaforge/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── ideas/[id]/page.tsx   # Project detail view
│   │   └── api/
│   │       ├── ideas/route.ts    # GET /api/ideas, POST /api/ideas
│   │       └── ideas/[id]/
│   │           ├── route.ts           # GET /api/ideas/[id]
│   │           ├── scores/route.ts    # POST scores
│   │           ├── improvements/route.ts  # POST improvements
│   │           ├── features/route.ts  # POST features
│   │           ├── techstack/route.ts # POST tech stack
│   │           ├── userflow/route.ts  # POST user flow
│   │           └── kanban/
│   │               ├── route.ts       # POST tickets
│   │               └── [ticketId]/route.ts  # PATCH ticket status
│   ├── components/
│   │   ├── IdeaComparison.tsx    # Original vs Enhanced
│   │   ├── ScoreDisplay.tsx      # Score progress bars
│   │   ├── ImprovementsDisplay.tsx  # Strategic improvements
│   │   ├── FeaturesList.tsx      # Core features
│   │   ├── TechStackDisplay.tsx  # Technology stack
│   │   ├── UserFlowDiagram.tsx   # React Flow diagram
│   │   └── KanbanBoard.tsx       # @dnd-kit board
│   └── lib/
│       └── db.ts                 # Prisma client
├── prisma/
│   └── schema.prisma             # Database schema
└── next.config.js
    └── output: 'standalone'      # Creates self-contained build
```

---

## Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Idea {
  id            String         @id @default(cuid())
  originalIdea  String         @db.Text
  enhancedIdea  String         @db.Text
  createdAt     DateTime       @default(now())
  scores        Score[]
  improvements  Improvement[]
  features      Feature[]
  techStack     TechStack[]
  userFlow      Json?
  kanbanTickets KanbanTicket[]
}

model Score {
  id            String  @id @default(cuid())
  ideaId        String
  dimension     String
  score         Int
  justification String  @db.Text
  idea          Idea    @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  @@index([ideaId])
}

model Feature {
  id          String  @id @default(cuid())
  ideaId      String
  name        String
  description String  @db.Text
  priority    String
  idea        Idea    @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  @@index([ideaId])
}

model Improvement {
  id         String  @id @default(cuid())
  ideaId     String
  dimension  String
  suggestion String  @db.Text
  idea       Idea    @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  @@index([ideaId])
}

model TechStack {
  id            String  @id @default(cuid())
  ideaId        String
  category      String
  technology    String
  justification String  @db.Text
  idea          Idea    @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  @@index([ideaId])
}

model KanbanTicket {
  id          String  @id @default(cuid())
  ideaId      String
  title       String
  description String  @db.Text
  status      String  @default("backlog")
  effort      String?
  idea        Idea    @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  @@index([ideaId])
}
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.0.0",
    "recharts": "^2.12.0",
    "@xyflow/react": "^12.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.3.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## Deploy Command

```bash
#!/bin/bash
# deploy.sh

cd /var/www/ideaforge
git pull
npm install
npx prisma migrate deploy
npm run build
sudo systemctl restart ideaforge
```

One command: `./deploy.sh`

---

## Claude Code Integration Script

Save as `send-idea.js` and run from terminal:

```javascript
const idea = {
  original: "Your raw idea here",
  enhanced: "Claude's enhanced version",
  scores: [
    { dimension: "Uniqueness", score: 8, justification: "..." },
    // ... all 6 scores
  ],
  features: [
    { name: "User Auth", description: "...", priority: "must-have" }
  ],
  kanban: [
    { title: "Build login", description: "...", status: "backlog" }
  ]
};

const response = await fetch('https://your-domain.com/api/ideas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(idea)
});

console.log(response.ok ? '✅ Sent to IdeaForge' : '❌ Failed');
```

---

## Resource Usage

**Idle:**
- Node.js: ~150 MB RAM
- PostgreSQL: ~50 MB RAM
- Caddy: ~10 MB RAM
- **Total: ~210 MB / 4 GB available**

**Under Load (you submitting one idea):**
- Node.js: ~200 MB RAM
- PostgreSQL: ~100 MB RAM
- **Total: ~300 MB / 4 GB available**

**Database Storage:**
- One detailed project: ~100 KB
- 80 GB disk = ~800,000 projects
- **You will never fill this**

---

## Failure Threshold

**This architecture breaks at:**

1. **Hardware failure** - Server dies, no redundancy (acceptable for single user)
2. **~500 concurrent users** - 2 vCPU saturates at high concurrency (you have 1 user)
3. **Never** - For single-user workload, this server is 100x oversized

**Does not break from:**
- Number of projects stored (disk too large)
- Database query load (single user generates trivial load)
- API request volume (you'll submit ~10 ideas/day max)

---

## The Complete Stack (One Line Per Component)

- **Node.js 20+** - Runtime for Next.js standalone build
- **Next.js standalone** - One process serves frontend + API
- **PostgreSQL 15+** - Local database on same server
- **Prisma** - Type-safe database queries
- **systemd** - Process manager (already installed)
- **Caddy** - Reverse proxy with auto HTTPS
- **Recharts + React Flow + @dnd-kit** - Client-side visualization (no server resources)
