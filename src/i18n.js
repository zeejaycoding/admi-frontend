import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enMinistryForms from './locales/en/ministryForms.json';
import frMinistryForms from './locales/fr/ministryForms.json';
import enUi from './locales/en/ui.json';
import frUi from './locales/fr/ui.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { ministryForms: enMinistryForms, ui: enUi },
      fr: { ministryForms: frMinistryForms, ui: frUi },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    lng: 'en',
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'pc-language',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
