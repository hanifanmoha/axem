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

export type Result = {
  correct: number;
  total: number;
  start_time: string;
  end_time: string;
};

type StoredResult = Result & { exam_id: string };

const RESULTS_KEY = "axem:results";
const MAX_RESULTS = 500;

// Newest submission first. An array (not an object) keeps the order reliable for any id.
function readResults(): StoredResult[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RESULTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// One record per quiz id: a retake replaces the previous record and moves it to the front.
export function saveResult(examId: string, result: Result) {
  const rest = readResults().filter((entry) => entry.exam_id !== examId);
  try {
    localStorage.setItem(
      RESULTS_KEY,
      JSON.stringify([{ exam_id: examId, ...result }, ...rest].slice(0, MAX_RESULTS)),
    );
  } catch {
    // Persistence is optional.
  }
}

export function loadResult(examId: string): Result | null {
  const entry = readResults().find((item) => item.exam_id === examId);
  if (!entry) return null;
  const { correct, total, start_time, end_time } = entry;
  return { correct, total, start_time, end_time };
}

export function formatDuration(startIso: string, endIso: string) {
  const seconds = Math.max(0, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}
