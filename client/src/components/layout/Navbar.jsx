import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../../stores/uiStore";
import { useSessionStore } from "../../stores/sessionStore";
import { useProfileStore } from "../../stores/profileStore";
import { useMusicStore } from "../../stores/musicStore";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/medications", label: "Medications" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const location = useLocation();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sessionStatus = useSessionStore((s) => s.status);
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const musicPlaying = useMusicStore((s) => s.playing);
  const musicChannel = useMusicStore((s) => s.channel);

  const showFocusMusic =
    isOnboarded && sessionStatus !== "active" && sessionStatus !== "paused";

  const allLinks = showFocusMusic
    ? [...NAV_LINKS, { to: "/focus-music", label: "Focus Music" }]
    : NAV_LINKS;

  return (
    <header className="sticky top-0 z-30 border-b border-surface-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">

        {/* Left — Logo */}
        <Link
          to="/"
          className="shrink-0 text-lg font-bold tracking-tight text-primary-600 transition-colors hover:text-primary-700"
          aria-label="FocusFlow home"
        >
          FocusFlow
        </Link>

        {/* Right — Desktop nav links + actions */}
        <div className="ml-auto flex items-center gap-3">
          <ul className="hidden items-center gap-2 md:flex">
            {allLinks.map(({ to, label }) => {
              const isActive =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-surface-500 hover:bg-surface-100 hover:text-surface-700"
                    }`}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-2.25 h-0.5 rounded-full bg-primary-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* Now Playing pill */}
          {musicPlaying && musicChannel && location.pathname !== "/focus-music" && (
            <Link
              to="/focus-music"
              className="hidden items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 sm:flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
              </span>
              Now Playing
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 md:hidden"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
