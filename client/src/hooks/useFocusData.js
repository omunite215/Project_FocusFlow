import { useMemo } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { FOCUS_DROP_THRESHOLD, CONSECUTIVE_DROPS_TRIGGER } from "../utils/constants";

/**
 * useFocusData — derived focus data for charts and adaptation logic.
 */
export function useFocusData() {
  const checkIns = useSessionStore((s) => s.checkIns);

  const chartData = useMemo(
    () =>
      checkIns.map((c, i) => ({
        index: i + 1,
        focus: c.focusLevel,
        subject: c.subject,
        time: c.timestamp,
      })),
    [checkIns]
  );

  const averageFocus = useMemo(() => {
    if (checkIns.length === 0) return 0;
    const sum = checkIns.reduce((acc, c) => acc + c.focusLevel, 0);
    return Math.round((sum / checkIns.length) * 10) / 10;
  }, [checkIns]);

  const peakFocus = useMemo(
    () => (checkIns.length > 0 ? Math.max(...checkIns.map((c) => c.focusLevel)) : 0),
    [checkIns]
  );

  const isFocusDropping = useMemo(() => {
    if (checkIns.length < CONSECUTIVE_DROPS_TRIGGER) return false;
    const recent = checkIns.slice(-CONSECUTIVE_DROPS_TRIGGER);
    return recent.every((c) => c.focusLevel <= FOCUS_DROP_THRESHOLD);
  }, [checkIns]);

  return {
    chartData,
    averageFocus,
    peakFocus,
    isFocusDropping,
    totalCheckIns: checkIns.length,
  };
}
