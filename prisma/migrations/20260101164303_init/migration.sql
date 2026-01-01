-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "originalIdea" TEXT NOT NULL,
    "enhancedIdea" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userFlow" JSONB,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Improvement" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,

    CONSTRAINT "Improvement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechStack" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "justification" TEXT NOT NULL,

    CONSTRAINT "TechStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanTicket" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'backlog',
    "effort" TEXT,

    CONSTRAINT "KanbanTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Score_ideaId_idx" ON "Score"("ideaId");

-- CreateIndex
CREATE INDEX "Improvement_ideaId_idx" ON "Improvement"("ideaId");

-- CreateIndex
CREATE INDEX "Feature_ideaId_idx" ON "Feature"("ideaId");

-- CreateIndex
CREATE INDEX "TechStack_ideaId_idx" ON "TechStack"("ideaId");

-- CreateIndex
CREATE INDEX "KanbanTicket_ideaId_idx" ON "KanbanTicket"("ideaId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Improvement" ADD CONSTRAINT "Improvement_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechStack" ADD CONSTRAINT "TechStack_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanTicket" ADD CONSTRAINT "KanbanTicket_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
