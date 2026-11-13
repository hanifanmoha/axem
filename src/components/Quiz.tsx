"use client";

import { useEffect, useState } from "react";
import type { Problem } from "@/lib/bundle";
import { type Attempt, formatDuration, loadAttempt, saveAttempt } from "@/lib/attempt";
import { Markdown } from "./Markdown";

const letter = (index: number) => String.fromCharCode(65 + index);

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return <>{formatDuration(since, new Date(now).toISOString())}</>;
}

export function Quiz({
  title,
  questions,
  baseUrl,
  examId,
}: {
  examId: string;
  title: string;
  questions: Problem[];
  baseUrl: string;
}) {
  const [index, setIndex] = useState(0);
  // undefined while reading localStorage, null when there is no saved attempt.
  const [attempt, setAttempt] = useState<Attempt | null | undefined>(undefined);
  const answers = attempt?.answers ?? questions.map(() => null);
  const submitted = attempt?.status === "finish";

  const total = questions.length;
  // index === total is the submit page, which has no question.
  const isReview = index === total;
  const question: Problem | undefined = questions[index];
  const answeredCount = answers.filter((answer) => answer !== null).length;

  const isCorrect = (questionIndex: number) => {
    const answer = answers[questionIndex];
    return answer !== null && questions[questionIndex].options[answer]?.correct === true;
  };
  const correctCount = submitted ? questions.filter((_, i) => isCorrect(i)).length : 0;
  const skippedCount = answers.filter((answer) => answer === null).length;
  const wrongCount = total - correctCount;

  function start() {
    setAttempt({
      exam_id: examId,
      answers: questions.map(() => null),
      start_time: new Date().toISOString(),
      end_time: null,
      status: "in_progress",
    });
    setIndex(0);
    window.scrollTo({ top: 0 });
  }

  function select(choiceIndex: number) {
    if (!attempt || submitted) return;
    setAttempt({
      ...attempt,
      answers: attempt.answers.map((answer, i) => (i === index ? choiceIndex : answer)),
    });
  }

  function go(target: number) {
    if (target >= 0 && target <= total) setIndex(target);
  }

  function submit() {
    if (attempt) setAttempt({ ...attempt, status: "finish", end_time: new Date().toISOString() });
    window.scrollTo({ top: 0 });
  }

  useEffect(() => {
    const saved = loadAttempt(examId, questions.length);
    setAttempt(saved);
    if (saved?.status === "in_progress") {
      const firstOpen = saved.answers.indexOf(null);
      setIndex(firstOpen === -1 ? questions.length : firstOpen);
    }
  }, [examId, questions.length]);

  useEffect(() => {
    if (attempt) saveAttempt(attempt);
  }, [attempt]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (target.closest("input, textarea")) return;

      if (event.key === "ArrowRight" || (event.key === "Enter" && !target.closest("button, [role=radio]"))) {
        event.preventDefault();
        go(index + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
      } else if (/^[a-z]$/i.test(event.key)) {
        const choiceIndex = event.key.toUpperCase().charCodeAt(0) - 65;
        if (question && choiceIndex < question.options.length) select(choiceIndex);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (total === 0) {
    return <p className="notice">This quiz does not contain any questions yet.</p>;
  }

  if (attempt === undefined) return null;

  if (attempt === null) {
    return (
      <section className="quiz intro">
        <h1>{title}</h1>
        <p className="intro-meta">
          {total} {total === 1 ? "question" : "questions"}
        </p>
        <button className="button primary" type="button" onClick={start}>
          Start
        </button>
      </section>
    );
  }

  const answer = answers[index] ?? null;
  const verdict = answer === null ? "skipped" : isCorrect(index) ? "ok" : "bad";

  return (
    <section className="quiz">
      <div className="quiz-head">
        <h1>{title}</h1>
        {!submitted && (
          <span className="counter">
            <span className="clock" aria-label="Elapsed time">
              <Elapsed since={attempt.start_time} />
            </span>
            {answeredCount} of {total} answered
          </span>
        )}
      </div>

      {submitted ? (
        <div className="summary" role="status">
          <p className="score">
            {correctCount}
            <span>/{total}</span>
          </p>
          <div className="stats">
            <span className="stat ok">
              <CheckIcon /> {correctCount} correct
            </span>
            <span className="stat bad">
              <CrossIcon /> {wrongCount} wrong
              {skippedCount > 0 && <small>{skippedCount} unanswered</small>}
            </span>
          </div>
          {attempt.end_time && (
            <p className="stat time">Time: {formatDuration(attempt.start_time, attempt.end_time)}</p>
          )}
          <button className="button" type="button" onClick={start}>
            Retake quiz
          </button>
        </div>
      ) : (
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answeredCount}
        >
          <div className="progress-fill" style={{ transform: `scaleX(${answeredCount / total})` }} />
        </div>
      )}

      <nav className="navigator" aria-label="Questions">
        {questions.map((_, i) => {
          const status = submitted
            ? isCorrect(i)
              ? "correct"
              : "incorrect"
            : answers[i] !== null
              ? "answered"
              : "";
          const label = submitted
            ? isCorrect(i)
              ? "correct"
              : answers[i] === null
                ? "not answered"
                : "wrong"
            : answers[i] !== null
              ? "answered"
              : "not answered";

          return (
            <button
              key={i}
              type="button"
              className={`nav-item ${status} ${i === index ? "current" : ""}`}
              aria-label={`Question ${i + 1}, ${label}`}
              aria-current={i === index ? "step" : undefined}
              onClick={() => go(i)}
            >
              {i + 1}
            </button>
          );
        })}
        <button
          type="button"
          className={`nav-item ${isReview ? "current" : ""}`}
          aria-label="Submit page"
          aria-current={isReview ? "step" : undefined}
          onClick={() => go(total)}
        >
          <CheckIcon />
        </button>
      </nav>

      {isReview && (
        <div className="step" key="review">
          <h2 className="question-title">Submit your answers</h2>
          <p className="review-text">
            {submitted
              ? "Your answers have been submitted. See your score above."
              : skippedCount > 0
                ? `${skippedCount} ${skippedCount === 1 ? "question is" : "questions are"} still unanswered. Go back to answer ${skippedCount === 1 ? "it" : "them"}, or submit now.`
                : "All questions are answered. Submit when you're ready."}
          </p>
          {!submitted && (
            <button className="button primary" type="button" onClick={submit}>
              Submit answers
            </button>
          )}
        </div>
      )}

      {question && (
      <div className="step" key={index}>
        <h2 className="question-title">
          Question {index + 1} of {total}
        </h2>
        <div className="prompt">
          {question.error ? (
            <div className="notice error" role="alert">
              <strong>This problem is malformed</strong>
              <p>{question.error}</p>
            </div>
          ) : (
            <Markdown value={question.question} baseUrl={baseUrl} />
          )}
        </div>

        <div className="choices" role="radiogroup" aria-label="Answers">
          {question.options.map((choice, choiceIndex) => {
            const isSelected = answer === choiceIndex;
            const state = submitted
              ? choice.correct
                ? "correct"
                : isSelected
                  ? "incorrect"
                  : "dim"
              : isSelected
                ? "selected"
                : "";

            return (
              <div
                key={choiceIndex}
                tabIndex={0}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={submitted}
                className={`choice ${state}`}
                style={{ "--i": choiceIndex } as React.CSSProperties}
                onClick={() => select(choiceIndex)}
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    select(choiceIndex);
                  }
                }}
              >
                <kbd>{letter(choiceIndex)}</kbd>
                <span className="choice-body">
                  <Markdown value={choice.text} baseUrl={baseUrl} />
                </span>
                {submitted && choice.correct && (
                  <span className="mark">
                    <CheckIcon />
                  </span>
                )}
                {submitted && isSelected && !choice.correct && (
                  <span className="mark">
                    <CrossIcon />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {submitted && (
          <div className={`feedback ${verdict}`}>
            <strong>
              {verdict === "ok" ? "Correct" : verdict === "bad" ? "Incorrect" : "Not answered"}
            </strong>
            {question.explanation && <Markdown value={question.explanation} baseUrl={baseUrl} />}
          </div>
        )}
      </div>
      )}

      <div className="actions">
        <button className="button" type="button" disabled={index === 0} onClick={() => go(index - 1)}>
          Previous
        </button>
        <button className="button" type="button" disabled={isReview} onClick={() => go(index + 1)}>
          Next
        </button>
      </div>
      <p className="hint-keys">
        {question && !submitted && (
          <>
            <kbd>A</kbd>–<kbd>{letter(Math.max(question.options.length, 1) - 1)}</kbd> select ·{" "}
          </>
        )}
        <kbd>←</kbd> <kbd>→</kbd> navigate
      </p>
    </section>
  );
}
