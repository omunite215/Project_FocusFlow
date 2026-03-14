import { useState } from "react";
import { medicationService } from "../services/medicationService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";

const QUICK_SEARCHES = ["Adderall XR", "Concerta", "Vyvanse"];

export default function Medications() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const { data } = await medicationService.getInfo(q.trim());
      setResults(data);
    } catch {
      setResults([]);
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

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          <Skeleton height={200} className="rounded-xl" />
        </div>
      )}

      {!loading && results !== null && results.length === 0 && (
        <Card className="text-center">
          <p className="text-sm text-surface-400">
            No results found. Try a different search.
          </p>
        </Card>
      )}

      {!loading &&
        results?.map((med, i) => (
          <Card key={i} className="mb-4">
            <h3 className="text-lg font-semibold text-surface-800">
              {med.name}
            </h3>
            <p className="mt-0.5 text-xs text-surface-400">{med.type}</p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-surface-50 p-2 text-center">
                <p className="text-xs text-surface-400">Onset</p>
                <p className="text-sm font-medium text-surface-700">
                  {med.onset}
                </p>
              </div>
              <div className="rounded-lg bg-surface-50 p-2 text-center">
                <p className="text-xs text-surface-400">Peak</p>
                <p className="text-sm font-medium text-surface-700">
                  {med.peak}
                </p>
              </div>
              <div className="rounded-lg bg-surface-50 p-2 text-center">
                <p className="text-xs text-surface-400">Duration</p>
                <p className="text-sm font-medium text-surface-700">
                  {med.duration}
                </p>
              </div>
            </div>

            {med.study_tips?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-400">
                  Study Tips
                </p>
                <ul className="space-y-1.5">
                  {med.study_tips.map((tip, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-surface-600"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {med.interactions?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warning-500">
                  Interactions
                </p>
                <ul className="space-y-1.5">
                  {med.interactions.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-surface-600"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {med.source && (
              <p className="mt-3 text-xs text-surface-300">
                Source: {med.source}
              </p>
            )}
          </Card>
        ))}

      <p className="mt-6 rounded-lg bg-surface-100 p-3 text-center text-xs text-surface-400">
        This information is for educational purposes only and is not medical
        advice. Always consult your healthcare provider about medications.
      </p>
    </div>
  );
}
