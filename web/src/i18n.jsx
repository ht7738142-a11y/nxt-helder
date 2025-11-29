import React, { createContext, useContext, useState, useMemo } from 'react';

const dict = {
  fr: { welcome: 'Bienvenue', login: 'Se connecter' },
  en: { welcome: 'Welcome', login: 'Login' }
};

const I18nCtx = createContext();
export function I18nProvider({ children }) {
  const [lang, setLang] = useState('fr');
  const t = useMemo(() => (k) => (dict[lang]?.[k] ?? k), [lang]);
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}
export function useI18n() { return useContext(I18nCtx); }
