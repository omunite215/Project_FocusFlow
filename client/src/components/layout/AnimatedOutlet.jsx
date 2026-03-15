import { useRef } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * AnimatedOutlet — wraps React Router's <Outlet> with GSAP page transitions.
 * Fades + slides content in on every route change.
 * Respects prefers-reduced-motion via CSS (GSAP durations become ~0).
 */
export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    },
    { dependencies: [location.pathname], scope: containerRef }
  );

  return (
    <div ref={containerRef} key={location.pathname}>
      {outlet}
    </div>
  );
}
