import { useEffect, useState } from "react";
import { useTranslation as useTranslationOrg } from "react-i18next";
import { LANGUAGE_KEYS } from "../constants/language";
import { STATIC_VALUES } from "../constants/strings";
import { cookieAgent } from "../utility/cookies";

export function useTranslation(ns: string, options = {}) {
  const { t, i18n } = useTranslationOrg(ns, options);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const language =
      typeof globalThis.window !== "undefined"
        ? cookieAgent.get(STATIC_VALUES.COMMON.COOKIE_KEYS.LANGUAGE) ||
          LANGUAGE_KEYS.FRENCH
        : LANGUAGE_KEYS.FRENCH;
    if (i18n.language !== language) {
      i18n.changeLanguage(language).then(() => setIsLoaded(true));
    } else {
      setIsLoaded(true);
    }
  }, [i18n]);

  return { t, i18n, isLoaded };
}
