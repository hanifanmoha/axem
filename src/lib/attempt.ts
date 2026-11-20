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

export type DurationLabels = { hours: string; minutes: string; seconds: string };

export function formatDuration(
  startIso: string,
  endIso: string,
  labels: DurationLabels = { hours: "h", minutes: "m", seconds: "s" },
) {
  const seconds = Math.max(0, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [
    [h, labels.hours],
    [m, labels.minutes],
    [s, labels.seconds],
  ] as const;
  const first = h > 0 ? 0 : m > 0 ? 1 : 2;
  return parts
    .slice(first)
    .map(([value, label]) => `${value}${label}`)
    .join(" ");
}
