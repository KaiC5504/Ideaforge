import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Format date to readable string
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// Get color based on score value
function getScoreColor(score: number): string {
  if (score >= 8) return "bg-green-500";
  if (score >= 5) return "bg-yellow-500";
  return "bg-red-500";
}

// Get priority color
function getPriorityColor(priority: string): string {
  switch (priority) {
    case "must-have":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "should-have":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "nice-to-have":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
}

// Get status color for kanban
function getStatusColor(status: string): string {
  switch (status) {
    case "done":
      return "bg-green-500/20 text-green-400";
    case "in-review":
      return "bg-purple-500/20 text-purple-400";
    case "in-progress":
      return "bg-blue-500/20 text-blue-400";
    case "todo":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch idea with all related data
  const idea = await db.idea.findUnique({
    where: { id },
    include: {
      scores: true,
      improvements: true,
      features: true,
      techStack: true,
      kanbanTickets: true,
    },
  });

  if (!idea) {
    notFound();
  }

  // Group features by priority
  const featuresByPriority = {
    "must-have": idea.features.filter((f) => f.priority === "must-have"),
    "should-have": idea.features.filter((f) => f.priority === "should-have"),
    "nice-to-have": idea.features.filter((f) => f.priority === "nice-to-have"),
  };

  // Group tech stack by category
  const techByCategory = idea.techStack.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof idea.techStack>
  );

  // Group kanban tickets by status
  const ticketsByStatus = {
    backlog: idea.kanbanTickets.filter((t) => t.status === "backlog"),
    todo: idea.kanbanTickets.filter((t) => t.status === "todo"),
    "in-progress": idea.kanbanTickets.filter((t) => t.status === "in-progress"),
    "in-review": idea.kanbanTickets.filter((t) => t.status === "in-review"),
    done: idea.kanbanTickets.filter((t) => t.status === "done"),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-[Poppins] mb-2">
          Idea Details
        </h1>
        <p className="text-sm text-slate-500">
          Created {formatDate(idea.createdAt)}
        </p>
      </div>

      {/* Section 1: Idea Comparison */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Idea Comparison
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Original Idea
            </h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {idea.originalIdea}
            </p>
          </div>
          <div className="bg-slate-800 border border-violet-500/30 rounded-xl p-6">
            <h3 className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-3">
              Enhanced Idea
            </h3>
            <p className="text-white leading-relaxed whitespace-pre-wrap">
              {idea.enhancedIdea}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Validation Scores */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Validation Scores
        </h2>
        {idea.scores.length === 0 ? (
          <p className="text-slate-500 italic">No scores added yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {idea.scores.map((score) => (
              <div key={score.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{score.dimension}</span>
                  <span className="text-lg font-bold text-white">{score.score}/10</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${getScoreColor(score.score)} transition-all duration-500`}
                    style={{ width: `${score.score * 10}%` }}
                  />
                </div>
                <p className="text-sm text-slate-400">{score.justification}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Strategic Improvements */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Strategic Improvements
        </h2>
        {idea.improvements.length === 0 ? (
          <p className="text-slate-500 italic">No improvements suggested yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {idea.improvements.map((improvement) => (
              <div key={improvement.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-violet-500/20 text-violet-400 rounded mb-2">
                  {improvement.dimension}
                </span>
                <p className="text-slate-300">{improvement.suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 4: Core Features */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Core Features
        </h2>
        {idea.features.length === 0 ? (
          <p className="text-slate-500 italic">No features defined yet</p>
        ) : (
          <div className="space-y-6">
            {(["must-have", "should-have", "nice-to-have"] as const).map(
              (priority) =>
                featuresByPriority[priority].length > 0 && (
                  <div key={priority}>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                      {priority.replace("-", " ")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {featuresByPriority[priority].map((feature) => (
                        <div key={feature.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium border rounded ${getPriorityColor(
                                feature.priority
                              )}`}
                            >
                              {feature.priority}
                            </span>
                            <div>
                              <h4 className="font-medium text-white">{feature.name}</h4>
                              <p className="text-sm text-slate-400 mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </section>

      {/* Section 5: Tech Stack */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Tech Stack
        </h2>
        {idea.techStack.length === 0 ? (
          <p className="text-slate-500 italic">No tech stack recommendations yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(techByCategory).map(([category, items]) => (
              <div key={category} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id}>
                      <span className="font-medium text-white">{item.technology}</span>
                      <p className="text-sm text-slate-400 mt-1">
                        {item.justification}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 6: User Flow */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          User Flow
        </h2>
        {!idea.userFlow ? (
          <p className="text-slate-500 italic">No user flow diagram yet</p>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-4">
              User flow diagram data (interactive diagram coming in Phase 6)
            </p>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-slate-300">
              {JSON.stringify(idea.userFlow, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* Section 7: Kanban Board */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Kanban Board
        </h2>
        {idea.kanbanTickets.length === 0 ? (
          <p className="text-slate-500 italic">No kanban tickets yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(["backlog", "todo", "in-progress", "in-review", "done"] as const).map(
              (status) => (
                <div key={status} className="bg-slate-900 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                    {status.replace("-", " ")}
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded">
                      {ticketsByStatus[status].length}
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {ticketsByStatus[status].map((ticket) => (
                      <div key={ticket.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                        <h4 className="font-medium text-white text-sm mb-1">
                          {ticket.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {ticket.description}
                        </p>
                        {ticket.effort && (
                          <span className="inline-block mt-2 text-xs text-slate-500">
                            {ticket.effort}
                          </span>
                        )}
                      </div>
                    ))}
                    {ticketsByStatus[status].length === 0 && (
                      <p className="text-xs text-slate-600 italic text-center py-4">
                        No tickets
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
