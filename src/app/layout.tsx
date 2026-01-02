import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "IdeaForge - Project Idea Incubator",
  description: "Transform raw project ideas into fully-validated, actionable development plans",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 w-full" style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="group flex items-center gap-3 cursor-pointer">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, #6d28d9 100%)',
                    boxShadow: '0 0 20px var(--accent-glow)'
                  }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  IdeaForge
                </span>
              </Link>
              <nav className="flex items-center gap-1">
                <Link
                  href="/"
                  className="nav-link px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-100 hover:bg-white/5"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1" style={{ background: 'var(--bg-base)' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          background: 'var(--bg-base)',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                IdeaForge - Project Idea Incubator
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                Powered by Claude Code
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
