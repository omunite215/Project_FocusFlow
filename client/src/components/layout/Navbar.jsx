import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../../stores/uiStore";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/medications", label: "Medications" },
  { to: "/profile", label: "Profile" },
];

/**
 * Navbar — top navigation bar.
 * Calm design, no overwhelming elements.
 */
export default function Navbar() {
  const location = useLocation();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="border-b border-surface-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-primary-600"
          aria-label="FocusFlow home"
        >
          FocusFlow
        </Link>

        <ul className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-surface-500 hover:bg-surface-100 hover:text-surface-700"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile menu toggle */}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 sm:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </header>
  );
}
