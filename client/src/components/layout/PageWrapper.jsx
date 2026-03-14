import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useUIStore } from "../../stores/uiStore";

/**
 * PageWrapper — root layout wrapping all routed pages.
 * Provides Navbar, optional Sidebar, and main content area.
 */
export default function PageWrapper() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <Navbar />
      <div className="flex flex-1">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
