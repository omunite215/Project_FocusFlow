import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AnimatedOutlet from "./AnimatedOutlet";
import { useUIStore } from "../../stores/uiStore";
import { ToastContainer } from "../ui/Toast";
import { useSessionGuard } from "../../hooks/useSessionGuard";
import SessionGuardModal from "../session/SessionGuardModal";

export default function PageWrapper() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const blocker = useSessionGuard();

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <Navbar />
      <div className="flex flex-1">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatedOutlet />
        </main>
      </div>
      <ToastContainer />
      <SessionGuardModal blocker={blocker} />
    </div>
  );
}
