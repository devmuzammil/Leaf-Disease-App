import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setLanguage, SupportedLanguage } from "../store/preferencesSlice";
import { fallbackLanguage, translations } from "../i18n/translations";
import { persistPreferredLanguage } from "../store/languageStorage";

export const useTranslation = () => {
  const language = useAppSelector((state) => state.preferences.language);
  const dispatch = useAppDispatch();

  const t = useCallback(
    (key: string) =>
      translations[language]?.[key] ??
      translations[fallbackLanguage]?.[key] ??
      key,
    [language]
  );

  const changeLanguage = useCallback(
    (value: SupportedLanguage) => {
      dispatch(setLanguage(value));
      void persistPreferredLanguage(value);
    },
    [dispatch]
  );

  return {
    t,
    language,
    setLanguage: changeLanguage,
  };
};