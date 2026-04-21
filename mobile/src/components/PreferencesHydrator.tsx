import React, { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { setLanguage } from "../store/preferencesSlice";
import { loadPreferredLanguage } from "../store/languageStorage";

/** Restores Urdu/Pushto choice after app restart (Redux alone resets to English). */
export const PreferencesHydrator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadPreferredLanguage().then((lang) => {
      if (lang) dispatch(setLanguage(lang));
    });
  }, [dispatch]);

  return <>{children}</>;
};
