'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

type ContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<ContextType>({
  lang: 'ru',
  setLang: () => {},
  t: (p) => p,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ru');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Language | null;
    if (stored && ['en', 'ru', 'kk'].includes(stored)) {
      setLangState(stored);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const t = (path: string): string => {
    const dot = path.indexOf('.');
    if (dot === -1) return path;
    const section = path.slice(0, dot);
    const key = path.slice(dot + 1);
    const sec = (translations as Record<string, Record<string, Record<Language, string>>>)[section];
    return sec?.[key]?.[lang] ?? sec?.[key]?.ru ?? path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
