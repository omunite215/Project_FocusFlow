import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useUIStore } from "../../stores/uiStore";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const MOTIVATIONAL_MESSAGES = [
  "You're doing amazing — keep that momentum going!",
  "Every minute of focus counts. You've got this!",
  "Your future self will thank you for staying on track.",
  "Small steps, big results. Stay with it!",
];

function getRandomMessage() {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

export default function SessionGuardModal({ blocker }) {
  const addToast = useUIStore((s) => s.addToast);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      if (blocker.state !== "blocked" || !contentRef.current) return;
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.08 }
      );
    },
    { dependencies: [blocker.state] }
  );

  if (blocker.state !== "blocked") return null;

  const handleProceed = () => {
    addToast({ type: "info", message: getRandomMessage() });
    blocker.proceed();
  };

  const handleStay = () => {
    blocker.reset();
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleStay}
      title="Switching tabs?"
      size="sm"
    >
      <div ref={contentRef}>
        <p className="mb-2 text-sm text-surface-600">
          Are you navigating away for study purposes?
        </p>
        <p className="mb-5 text-xs text-surface-400">
          It&apos;s okay to look something up — just checking in so you stay on track.
        </p>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={handleStay}>
            Back to Session
          </Button>
          <Button size="sm" onClick={handleProceed}>
            Yes, for Studying
          </Button>
        </div>
      </div>
    </Modal>
  );
}
