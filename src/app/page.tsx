import Link from "next/link";
import { db } from "@/lib/db";

// Format date to readable string
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Truncate text to specified length
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export default async function Dashboard() {
  // Fetch all ideas from database (server component)
  const ideas = await db.idea.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      originalIdea: true,
      enhancedIdea: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Ideas Dashboard
        </h1>
        <p className="mt-3 text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
          Your project ideas, validated and ready for development
        </p>
      </div>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)'
            }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: 'var(--text-muted)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>No ideas yet</h2>
          <p className="text-center max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Submit your first project idea via the API to see it here. Use Claude Code to analyze and enhance your ideas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="group block"
            >
              <article className="idea-card relative h-full rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5">
                {/* Original Idea */}
                <div className="mb-5">
                  <h3
                    className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Original Idea
                  </h3>
                  <p
                    className="text-[15px] font-medium leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {truncate(idea.originalIdea, 80)}
                  </p>
                </div>

                {/* Enhanced Idea */}
                <div className="mb-5">
                  <h3
                    className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Enhanced
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {truncate(idea.enhancedIdea, 120)}
                  </p>
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <time
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatDate(idea.createdAt)}
                  </time>
                  <span
                    className="text-xs font-medium flex items-center gap-1.5 transition-all duration-200 group-hover:gap-2"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    View details
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
