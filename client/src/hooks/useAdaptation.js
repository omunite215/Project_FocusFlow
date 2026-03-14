import { useState, useEffect } from "react";
import { useFocusData } from "./useFocusData";

/**
 * useAdaptation — monitors focus data and triggers adaptation alerts.
 */
export function useAdaptation() {
  const { isFocusDropping } = useFocusData();
  const [adaptationAlert, setAdaptationAlert] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isFocusDropping && !dismissed) {
      // The actual suggestion comes from the API via useSession.submitCheckIn
      // This hook just manages the alert visibility state
      setAdaptationAlert({ visible: true });
    }
  }, [isFocusDropping, dismissed]);

  const showAdaptation = (suggestion) => {
    setAdaptationAlert({ visible: true, suggestion });
    setDismissed(false);
  };

  const dismissAdaptation = () => {
    setAdaptationAlert(null);
    setDismissed(true);
  };

  const resetAdaptation = () => {
    setAdaptationAlert(null);
    setDismissed(false);
  };

  return {
    adaptationAlert,
    showAdaptation,
    dismissAdaptation,
    resetAdaptation,
  };
}
