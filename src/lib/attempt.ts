export type Attempt = {
  exam_id: string;
  answers: (number | null)[];
  start_time: string;
  end_time: string | null;
  status: "in_progress" | "finish";
};

const KEY = "axem:attempt";

export function loadAttempt(examId: string, total: number): Attempt | null {
  try {
    const attempt = JSON.parse(localStorage.getItem(KEY) ?? "null") as Attempt | null;
    if (attempt?.exam_id !== examId || attempt.answers?.length !== total) return null;
    return attempt;
  } catch {
    return null;
  }
}

// A single record is kept, so starting another exam replaces the previous one.
export function saveAttempt(attempt: Attempt) {
  try {
    localStorage.setItem(KEY, JSON.stringify(attempt));
  } catch {
    // Storage may be unavailable or full; the quiz still works without persistence.
  }
}

export function formatDuration(startIso: string, endIso: string) {
  const seconds = Math.max(0, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}
