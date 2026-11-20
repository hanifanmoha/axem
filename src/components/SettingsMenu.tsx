"use client";

import { useEffect, useRef, useState } from "react";
import { LANGS, useI18n } from "@/lib/i18n";

type Mode = "light" | "dark";
type Style = "simple" | "minimal" | "reading" | "brutal";

const MODE_KEY = "axem:theme";
const STYLE_KEY = "axem:style";

const MODES: Mode[] = ["light", "dark"];
const STYLES: Style[] = ["simple", "minimal", "reading", "brutal"];

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

function isMode(value: string | null | undefined): value is Mode {
  return value === "light" || value === "dark";
}

function isStyle(value: string | null | undefined): value is Style {
  return STYLES.some((style) => style === value);
}

function currentMode(): Mode {
  const set = document.documentElement.dataset.theme;
  if (isMode(set)) return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function currentStyle(): Style {
  const set = document.documentElement.dataset.style;
  return isStyle(set) ? set : "simple";
}

// The status bar follows the page background, so it has to be re-read from the
// tokens whenever the theme changes.
function syncThemeColor() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  if (!bg) return;
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute("content", bg);
  }
}

export function SettingsMenu() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("light");
  const [style, setStyle] = useState<Style>("simple");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(currentMode());
    setStyle(currentStyle());
    syncThemeColor();

    // Without an explicit choice the app follows the system, including while
    // the page stays open.
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = (event: MediaQueryListEvent) => {
      if (isMode(read(MODE_KEY))) return;
      const next = event.matches ? "dark" : "light";
      setMode(next);
      document.documentElement.dataset.theme = next;
      syncThemeColor();
    };
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function chooseMode(next: Mode) {
    setMode(next);
    document.documentElement.dataset.theme = next;
    write(MODE_KEY, next);
    syncThemeColor();
  }

  function chooseStyle(next: Style) {
    setStyle(next);
    document.documentElement.dataset.style = next;
    write(STYLE_KEY, next);
    syncThemeColor();
  }

  return (
    <div className="settings" ref={root}>
      <button
        type="button"
        className="icon-button"
        aria-label={t("settings.button")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className="popover" role="dialog" aria-label={t("settings.dialog")}>
          <h2>{t("settings.appearance")}</h2>
          <div className="segmented" role="radiogroup" aria-label={t("settings.modeAria")}>
            {MODES.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={mode === option}
                onClick={() => chooseMode(option)}
              >
                {t(`settings.mode.${option}`)}
              </button>
            ))}
          </div>

          <h2>{t("settings.style")}</h2>
          <div className="select">
            <select
              aria-label={t("settings.style")}
              value={style}
              onChange={(event) => {
                const next = event.target.value;
                if (isStyle(next)) chooseStyle(next);
              }}
            >
              {STYLES.map((option) => (
                <option key={option} value={option}>
                  {t(`settings.styles.${option}`)}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          <h2>{t("settings.language")}</h2>
          <div className="segmented" role="radiogroup" aria-label={t("settings.languageAria")}>
            {LANGS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={lang === option}
                onClick={() => setLang(option)}
              >
                {t(`settings.languages.${option}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
