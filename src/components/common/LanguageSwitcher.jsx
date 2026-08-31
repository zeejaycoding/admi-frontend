import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
];

// Routes that support a /:lang URL segment — switching here updates the URL
const LANG_ROUTES = [
  '/discipleship',
  '/become-coordinator',
  '/power-bible-school',
  '/mentoring-academy',
];

/**
 * variant="default"  — light bg (used on forms/pages)
 * variant="header"   — adapts to the sticky header; pass isScrolled prop
 *
 * On supported form routes, switching language navigates to /route/fr (or back
 * to /route for English) so the language survives a page refresh.
 * On all other routes it simply calls i18n.changeLanguage().
 */
const LanguageSwitcher = ({ className = '', variant = 'default', isScrolled = false }) => {
  const { i18n } = useTranslation();
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const current = i18n.language?.slice(0, 2) || 'en';

  const handleChange = (code) => {
    // Always update i18next + localStorage first so useUrlLanguage sees
    // the new language when it fires on the incoming route — this prevents
    // the redirect loop where switching to EN navigates to /discipleship
    // but the hook reads 'fr' from localStorage and bounces back to /discipleship/fr.
    i18n.changeLanguage(code);

    const base = LANG_ROUTES.find(
      (r) => pathname === r || pathname.startsWith(r + '/'),
    );

    if (base) {
      navigate(code === 'en' ? base : `${base}/${code}`);
    }
  };

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-0.5 ${className}`}>
        {LANGUAGES.map(({ code, label }) => {
          const isActive = current === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => handleChange(code)}
              className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                isActive
                  ? isScrolled
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white/20 text-white'
                  : isScrolled
                    ? 'text-gray-500 hover:text-gray-800'
                    : 'text-white/60 hover:text-white'
              }`}
              aria-label={`Switch to ${label}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  // default variant — for use on forms and pages
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 rounded-lg ${className}`}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => handleChange(code)}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
            current === code
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-label={`Switch to ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
