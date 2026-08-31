import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import i18next from 'i18next';

const SUPPORTED_LANGS = ['en', 'fr'];
const LS_KEY = 'pc-language';

/**
 * Reads a :lang URL param and keeps the i18n language in sync with the URL.
 *
 * - /discipleship/fr  → switches to French
 * - /discipleship/en  → switches to English
 * - /discipleship     → if user previously chose French, redirects to
 *                       /discipleship/fr so the language persists across
 *                       navigation; otherwise stays on English
 *
 * Uses i18next directly (not via useTranslation) so that changing
 * language via the header switcher never triggers this effect again.
 */
const useUrlLanguage = () => {
  const { lang }      = useParams();
  const navigate      = useNavigate();
  const { pathname }  = useLocation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang.toLowerCase())) {
      i18next.changeLanguage(lang.toLowerCase());
    } else if (!lang) {
      const saved = localStorage.getItem(LS_KEY)?.slice(0, 2);
      if (saved && saved !== 'en' && SUPPORTED_LANGS.includes(saved)) {
        // User has a non-English language saved — redirect to the lang URL
        // so the choice survives refreshes and in-app navigation.
        navigate(`${pathname}/${saved}`, { replace: true });
      } else {
        i18next.changeLanguage('en');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);
};

export default useUrlLanguage;
