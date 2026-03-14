import { useState } from "react";
import { medicationService } from "../services/medicationService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";

const QUICK_SEARCHES = ["Adderall XR", "Concerta", "Vyvanse"];

export default function Medications() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const { data } = await medicationService.getInfo(q.trim());
      setResult(data);
    } catch {
      setError(true);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-800">Medication Info</h1>
        <p className="mt-1 text-sm text-surface-500">
          Evidence-based information about ADHD medications, timing, and interactions.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
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

      {/* Quick searches */}
      <div className="mb-6 flex flex-wrap gap-2">
        {QUICK_SEARCHES.map((name) => (
          <button
            key={name}
            onClick={() => {
              setQuery(name);
              handleSearch(name);
            }}
            className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-medium text-surface-500 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            {name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <Skeleton height={200} className="rounded-xl" />
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
        <div className="space-y-4">
          {/* Answer card */}
          <Card>
            <p className="text-sm leading-relaxed text-surface-700">
              {result.answer}
            </p>
          </Card>

          {/* Study tips */}
          {result.study_tips?.length > 0 && (
            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-surface-400">
                Study Tips
              </p>
              <ul className="space-y-2">
                {result.study_tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-surface-600"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Sources */}
          {result.sources_used?.length > 0 && (
            <p className="text-xs text-surface-300">
              Sources: {result.sources_used.join(", ")}
            </p>
          )}

          {/* Disclaimer */}
          {result.disclaimer && (
            <p className="rounded-lg bg-surface-100 p-3 text-center text-xs text-surface-400">
              {result.disclaimer}
            </p>
          )}
        </div>
      )}

      {/* Static disclaimer */}
      {!result && !loading && (
        <p className="mt-6 rounded-lg bg-surface-100 p-3 text-center text-xs text-surface-400">
          This information is for educational purposes only and is not medical
          advice. Always consult your healthcare provider about medications.
        </p>
      )}
    </div>
  );
}
