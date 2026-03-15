import { useState, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { medicationService } from "../services/medicationService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";

const QUICK_SEARCHES = [
  "Adderall XR",
  "Concerta",
  "Vyvanse",
  "Ritalin",
  "Strattera",
  "Focalin",
];

export default function Medications() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const pillsRef = useRef(null);
  const resultsRef = useRef(null);

  // Entrance animation
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.4 }
    )
      .fromTo(
        searchRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35 },
        "-=0.2"
      )
      .fromTo(
        pillsRef.current?.children ? Array.from(pillsRef.current.children) : [],
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05 },
        "-=0.15"
      );
  }, []);

  // Animate results when they appear
  const animateResults = useCallback(() => {
    if (!resultsRef.current) return;
    const cards = resultsRef.current.querySelectorAll("[data-animate]");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      }
    );
  }, []);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setError(false);
    setResult(null);
    try {
      const { data } = await medicationService.getInfo(q.trim());
      setResult(data);
      // Animate after state settles
      window.requestAnimationFrame(() => window.requestAnimationFrame(animateResults));
    } catch {
      setError(true);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div ref={headerRef} className="mb-6" style={{ opacity: 0 }}>
        <h1 className="text-2xl font-bold text-surface-800">Medication Info</h1>
        <p className="mt-1 text-sm text-surface-500">
          Evidence-based information about ADHD medications, timing, and
          interactions.
        </p>
      </div>

      {/* Search bar */}
      <div ref={searchRef} className="mb-4 flex gap-2" style={{ opacity: 0 }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a medication..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={() => handleSearch()} loading={loading}>
          Search
        </Button>
      </div>

      {/* Quick search pills */}
      <div ref={pillsRef} className="mb-6 flex flex-wrap gap-2">
        {QUICK_SEARCHES.map((name) => (
          <button
            key={name}
            onClick={() => {
              setQuery(name);
              handleSearch(name);
            }}
            className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-medium text-surface-500 transition-all duration-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm active:scale-95"
            style={{ opacity: 0 }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <Skeleton height={120} className="rounded-xl" />
          <Skeleton height={160} className="rounded-xl" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Card className="text-center">
          <p className="text-sm text-surface-400">
            Something went sideways. Try a different search?
          </p>
        </Card>
      )}

      {/* Results */}
      {!loading && result && (
        <div ref={resultsRef} className="space-y-4">
          {/* Answer card */}
          <Card data-animate>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-500">
              About {query}
            </p>
            <p className="text-sm leading-relaxed text-surface-700">
              {result.answer}
            </p>
          </Card>

          {/* Study tips */}
          {result.study_tips?.length > 0 && (
            <Card data-animate>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent-600">
                Study Tips
              </p>
              <ul className="space-y-2.5">
                {result.study_tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-surface-600"
                  >
                    <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Sources */}
          {result.sources_used?.length > 0 && (
            <p data-animate className="text-xs text-surface-300">
              Sources: {result.sources_used.join(", ")}
            </p>
          )}

          {/* Disclaimer */}
          {result.disclaimer && (
            <p
              data-animate
              className="rounded-lg bg-surface-100 p-3 text-center text-xs text-surface-400"
            >
              {result.disclaimer}
            </p>
          )}
        </div>
      )}

      {/* Static disclaimer */}
      {!result && !loading && !error && (
        <p className="mt-6 rounded-lg bg-surface-100 p-3 text-center text-xs text-surface-400">
          This information is for educational purposes only and is not medical
          advice. Always consult your healthcare provider about medications.
        </p>
      )}
    </div>
  );
}
