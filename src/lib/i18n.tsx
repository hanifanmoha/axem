"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import { formatDuration as formatDurationWith } from "@/lib/attempt";

export type Lang = "id" | "en";

export const LANG_KEY = "axem:lang";
export const DEFAULT_LANG: Lang = "id";
export const LANGS: Lang[] = ["id", "en"];

const CATALOGS: Record<Lang, unknown> = { en, id };
const LOCALES: Record<Lang, string> = { en: "en-US", id: "id-ID" };

// Every leaf of the English catalogue as a dot path, so a mistyped key fails
// the build instead of rendering the key itself.
type Paths<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: Paths<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

export type Key = Paths<typeof en>;

type StripOne<T> = T extends `${infer Group}.one` ? Group : never;
export type PluralKey = StripOne<Extract<Key, `${string}.one`>>;

type Variables = Record<string, string | number>;

export function isLang(value: string | null | undefined): value is Lang {
  return value === "id" || value === "en";
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The choice still applies for this session.
  }
}

function lookup(catalog: unknown, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined,
      catalog,
    );
  return typeof value === "string" ? value : undefined;
}

type I18n = {
  lang: Lang;
  locale: string;
  setLang: (lang: Lang) => void;
  t: (key: Key, variables?: Variables) => string;
  plural: (key: PluralKey, count: number, variables?: Variables) => string;
  formatDate: (iso: string) => string;
  formatDuration: (startIso: string, endIso: string) => string;
};

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // The server renders the default language and the stored choice is applied
  // after mount, so the first client render always matches the server markup.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = read(LANG_KEY);
    if (isLang(stored)) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    write(LANG_KEY, next);
  }, []);

  return (
    <I18nContext.Provider
      value={useMemo<I18n>(() => {
        const resolve = (key: string, variables?: Variables) => {
          const template = lookup(CATALOGS[lang], key) ?? lookup(CATALOGS.en, key) ?? key;
          return variables
            ? template.replace(/\{(\w+)\}/g, (match, name: string) =>
                name in variables ? String(variables[name]) : match,
              )
            : template;
        };
        const rules = new Intl.PluralRules(LOCALES[lang]);

        return {
          lang,
          locale: LOCALES[lang],
          setLang,
          t: resolve as I18n["t"],
          plural: (key, count, variables) => {
            const category = rules.select(count);
            const scoped = lookup(CATALOGS[lang], `${key}.${category}`)
              ? `${key}.${category}`
              : `${key}.other`;
            return resolve(scoped, { count, ...variables });
          },
          formatDate: (iso) => new Date(iso).toLocaleDateString(LOCALES[lang]),
          formatDuration: (startIso, endIso) =>
            formatDurationWith(startIso, endIso, {
              hours: resolve("quiz.duration.hours"),
              minutes: resolve("quiz.duration.minutes"),
              seconds: resolve("quiz.duration.seconds"),
            }),
        };
      }, [lang, setLang])}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n needs an I18nProvider above it.");
  return context;
}
