import type { Mode, PoemPage, SavedState } from "../types";

const KEY = "virtual-poem-book-v1";

export function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SavedState;
  } catch {
    return {};
  }
}

export function savePages(pages: PoemPage[]) {
  try {
    const prev = loadState();
    localStorage.setItem(KEY, JSON.stringify({ ...prev, pages }));
  } catch {
    // ignore
  }
}

export function saveMode(mode: Mode) {
  try {
    const prev = loadState();
    localStorage.setItem(KEY, JSON.stringify({ ...prev, mode }));
  } catch {
    // ignore
  }
}
