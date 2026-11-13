"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/bundle";
import { InlineMarkdown, Markdown } from "./Markdown";

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

export function Quiz({ title, questions }: { title: string; questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const total = questions.length;
  const question = questions[index];
  const answeredCount = answers.filter((answer) => answer !== null).length;

  const isCorrect = (questionIndex: number) => {
    const answer = answers[questionIndex];
    return answer !== null && questions[questionIndex].choices[answer]?.correct === true;
  };
  const correctCount = submitted ? questions.filter((_, i) => isCorrect(i)).length : 0;
  const skippedCount = answers.filter((answer) => answer === null).length;
  const wrongCount = total - correctCount;

  function select(choiceIndex: number) {
    if (submitted) return;
    setAnswers((current) => current.map((answer, i) => (i === index ? choiceIndex : answer)));
  }

  function go(target: number) {
    if (target >= 0 && target < total) setIndex(target);
  }

  function submit() {
    setSubmitted(true);
    window.scrollTo({ top: 0 });
  }

  function retake() {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
    setIndex(0);
    window.scrollTo({ top: 0 });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.metaKey || event.ctrlKey || event.altKey || !question) return;
      if (target.closest("input, textarea")) return;

      if (event.key === "ArrowRight" || (event.key === "Enter" && !target.closest("button"))) {
        event.preventDefault();
        go(index + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
      } else if (/^[a-z]$/i.test(event.key)) {
        const choiceIndex = event.key.toUpperCase().charCodeAt(0) - 65;
        if (choiceIndex < question.choices.length) select(choiceIndex);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (total === 0) {
    return <p className="notice">This quiz does not contain any questions yet.</p>;
  }

  const answer = answers[index];
  const verdict = answer === null ? "skipped" : isCorrect(index) ? "ok" : "bad";

  return (
    <section className="quiz">
      <div className="quiz-head">
        <h1>{title}</h1>
        {!submitted && (
          <span className="counter">
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
          <button className="button" type="button" onClick={retake}>
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
      </nav>

      <div className="step" key={index}>
        <h2 className="question-title">
          Question {index + 1} of {total}
        </h2>
        <div className="prompt">
          <Markdown value={question.prompt} />
        </div>

        <div className="choices" role="radiogroup" aria-label="Answers">
          {question.choices.map((choice, choiceIndex) => {
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
              <button
                key={choiceIndex}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={submitted}
                className={`choice ${state}`}
                style={{ "--i": choiceIndex } as React.CSSProperties}
                onClick={() => select(choiceIndex)}
              >
                <kbd>{letter(choiceIndex)}</kbd>
                <span className="choice-body">
                  <InlineMarkdown value={choice.text} />
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
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className={`feedback ${verdict}`}>
            <strong>
              {verdict === "ok" ? "Correct" : verdict === "bad" ? "Incorrect" : "Not answered"}
            </strong>
            {question.explanation && <Markdown value={question.explanation} />}
          </div>
        )}
      </div>

      <div className="actions">
        <button className="button" type="button" disabled={index === 0} onClick={() => go(index - 1)}>
          Previous
        </button>
        <button className="button" type="button" disabled={index === total - 1} onClick={() => go(index + 1)}>
          Next
        </button>
        {!submitted && (
          <button className="button primary submit" type="button" onClick={submit}>
            Submit answers
            {skippedCount > 0 && <small>{skippedCount} unanswered</small>}
          </button>
        )}
      </div>
      <p className="hint-keys">
        {!submitted && (
          <>
            <kbd>A</kbd>–<kbd>{letter(Math.max(question.choices.length, 1) - 1)}</kbd> select ·{" "}
          </>
        )}
        <kbd>←</kbd> <kbd>→</kbd> navigate
      </p>
    </section>
  );
}
