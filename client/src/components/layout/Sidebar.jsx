import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../../stores/uiStore";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/medications", label: "Medications" },
  { to: "/profile", label: "Profile" },
];

/**
 * Sidebar — mobile slide-out navigation.
 */
export default function Sidebar() {
  const location = useLocation();
  const closeSidebar = useUIStore((s) => s.closeSidebar);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-surface-900/20 backdrop-blur-sm sm:hidden"
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg sm:hidden">
        <div className="flex h-14 items-center border-b border-surface-200 px-4">
          <span className="text-lg font-semibold text-primary-600">FocusFlow</span>
          <button
            onClick={closeSidebar}
            className="ml-auto rounded-lg p-1.5 text-surface-400 hover:bg-surface-100"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={closeSidebar}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-surface-600 hover:bg-surface-100"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
