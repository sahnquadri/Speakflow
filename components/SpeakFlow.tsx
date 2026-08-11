"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  initialState,
  nextTask,
  type SessionState,
  type VocabularyItem,
} from "@/lib/framework";

type Rec = {
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: any) => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
};

function load(): SessionState {
  if (typeof window === "undefined") return initialState;

  try {
    return (
      JSON.parse(localStorage.getItem("speakflow-state") || "") ||
      initialState
    );
  } catch {
    return initialState;
  }
}

/*
 * Add new speech to the existing transcript without duplicating
 * words that mobile Chrome may send again after a recognition restart.
 */
function appendWithoutDuplicate(existing: string, incoming: string): string {
  const oldText = existing.trim();
  const newText = incoming.trim();

  if (!newText) return oldText;
  if (!oldText) return newText;

  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);

  const normalize = (word: string) =>
    word
      .toLowerCase()
      .replace(/[.,!?;:"'()[\]{}]/g, "")
      .trim();

  const oldNormalized = oldWords.map(normalize);
  const newNormalized = newWords.map(normalize);

  /*
   * If the incoming result is already contained at the end
   * of the existing transcript, ignore it.
   */
  const incomingLower = newNormalized.join(" ");
  const existingLower = oldNormalized.join(" ");

  if (existingLower === incomingLower) {
    return oldText;
  }

  if (
    incomingLower.length > 10 &&
    existingLower.includes(incomingLower)
  ) {
    return oldText;
  }

  /*
   * Find the largest overlap between the end of the old transcript
   * and the beginning of the new transcript.
   */
  const maxOverlap = Math.min(oldWords.length, newWords.length, 30);

  for (let size = maxOverlap; size >= 1; size--) {
    const oldPart = oldNormalized.slice(-size);
    const newPart = newNormalized.slice(0, size);

    if (oldPart.join(" ") === newPart.join(" ")) {
      return `${oldText} ${newWords.slice(size).join(" ")}`.trim();
    }
  }

  return `${oldText} ${newText}`.trim();
}

function analyze(text: string, state: SessionState) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();

  const fillers =
    (lower.match(/\b(like|actually|yeah|you know|so)\b/g) || []).length;

  const self =
    (lower.match(
      /\b(not .{0,18} but|i mean|what i mean|sorry|rather)\b/g
    ) || []).length;

  const used = state.vocabulary.filter((v) =>
    lower.includes(v.phrase.toLowerCase().replace("...", ""))
  );

  return {
    words,
    fillers,
    self,
    used,
    continuity: Math.min(
      95,
      Math.round(55 + Math.min(words.length, 100) * 0.3 - fillers * 2)
    ),
    organization: Math.min(
      95,
      Math.round(
        55 +
          (/\b(because|but|however|although|that's why|on the other hand)\b/i.test(
            text
          )
            ? 14
            : 0)
      )
    ),
    naturalness: Math.min(95, Math.round(62 - fillers * 3 + self * 4)),
  };
}

export default function SpeakFlow() {
  const [state, setState] = useState<SessionState>(load);
  const [task, setTask] = useState(() => nextTask(load().level));
  const [target, setTarget] = useState<VocabularyItem[]>([]);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [tab, setTab] = useState<
    "session" | "progress" | "vocab"
  >("session");

  const rec = useRef<Rec | null>(null);

  const finalTranscript = useRef("");
  const interimTranscript = useRef("");

  const stopping = useRef(false);
  const sessionStartedAt = useRef(0);

  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  /*
   * Every recognition instance gets its own ID.
   * This prevents an old recognition instance from modifying
   * the transcript after a new instance has started.
   */
  const recognitionId = useRef(0);

  /*
   * Remember final phrases already accepted during the current
   * speaking session.
   */
  const acceptedResults = useRef<string[]>([]);

  useEffect(() => {
    localStorage.setItem("speakflow-state", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    return () => {
      stopping.current = true;

      if (restartTimer.current) {
        clearTimeout(restartTimer.current);
      }

      if (timer.current) {
        clearInterval(timer.current);
      }

      rec.current?.stop();
    };
  }, []);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window);

  const speak = (text: string) => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.lang = "en-US";

    window.speechSynthesis.speak(u);
  };

  const renderTranscript = () => {
    const combined =
      `${finalTranscript.current} ${interimTranscript.current}`.trim();

    setTranscript(combined);
  };

  const startRecognition = () => {
    if (!supported || stopping.current) return;

    const C =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!C) return;

    const currentId = ++recognitionId.current;

    const r: Rec = new C();

    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (e: any) => {
      /*
       * Ignore results from an old recognition instance.
       */
      if (currentId !== recognitionId.current) {
        return;
      }

      let interim = "";

      for (
        let i = e.resultIndex;
        i < e.results.length;
        i++
      ) {
        const result = e.results[i];

        const text =
          result?.[0]?.transcript?.trim() || "";

        if (!text) continue;

        if (result.isFinal) {
          const normalized = text
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

          /*
           * Ignore exact duplicate final results.
           */
          if (
            normalized &&
            acceptedResults.current.includes(normalized)
          ) {
            continue;
          }

          acceptedResults.current.push(normalized);

          /*
           * Prevent overlap between the old transcript and
           * the newly returned speech.
           */
          finalTranscript.current =
            appendWithoutDuplicate(
              finalTranscript.current,
              text
            );

          /*
           * Keep memory from growing unnecessarily.
           */
          if (acceptedResults.current.length > 100) {
            acceptedResults.current =
              acceptedResults.current.slice(-60);
          }
        } else {
          interim += text;
        }
      }

      interimTranscript.current = interim;

      renderTranscript();
    };

    r.onend = () => {
      /*
       * Ignore an old recognition instance ending after
       * a newer instance has already started.
       */
      if (currentId !== recognitionId.current) {
        return;
      }

      if (stopping.current) {
        setReconnecting(false);
        setListening(false);
        return;
      }

      const elapsed =
        Date.now() - sessionStartedAt.current;

      if (elapsed >= 90000) {
        stopping.current = true;

        setReconnecting(false);
        setListening(false);
        setSeconds(90);

        interimTranscript.current = "";

        renderTranscript();

        return;
      }

      /*
       * Mobile Chrome often ends recognition after a pause.
       * Restart it automatically so the user can continue speaking.
       */
      setReconnecting(true);

      if (restartTimer.current) {
        clearTimeout(restartTimer.current);
      }

      restartTimer.current = setTimeout(() => {
        if (!stopping.current) {
          setReconnecting(false);
          startRecognition();
        }
      }, 400);
    };

    r.onerror = (e: any) => {
      /*
       * Ignore errors from old recognition instances.
       */
      if (currentId !== recognitionId.current) {
        return;
      }

      const fatal =
        e?.error === "not-allowed" ||
        e?.error === "service-not-allowed";

      if (fatal) {
        stopping.current = true;

        setListening(false);
        setReconnecting(false);
      }
    };

    rec.current = r;

    try {
      r.start();
      setListening(true);
    } catch {
      /*
       * Browser may reject a rapid restart.
       * onend will normally start the next cycle.
       */
    }
  };

  const start = () => {
    if (!supported || listening) return;

    stopping.current = false;

    finalTranscript.current = "";
    interimTranscript.current = "";

    acceptedResults.current = [];

    setTranscript("");
    setSeconds(0);

    sessionStartedAt.current = Date.now();

    if (timer.current) {
      clearInterval(timer.current);
    }

    timer.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - sessionStartedAt.current) / 1000
      );

      setSeconds(Math.min(elapsed, 90));

      if (elapsed >= 90) {
        stop();
      }
    }, 500);

    startRecognition();
  };

  const stop = () => {
    stopping.current = true;

    recognitionId.current += 1;

    if (restartTimer.current) {
      clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }

    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }

    try {
      rec.current?.stop();
    } catch {
      // Ignore browser stop errors.
    }

    interimTranscript.current = "";

    renderTranscript();

    setListening(false);
    setReconnecting(false);
  };

  const begin = () => {
    setFeedback([]);

    setTranscript("");

    finalTranscript.current = "";
    interimTranscript.current = "";

    acceptedResults.current = [];

    setTarget(
      [
        ...state.vocabulary.filter(
          (v) => v.status !== "mastered"
        ),
      ]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
    );

    speak(
      `Here is your speaking task. ${task.prompt}`
    );
  };

  const submit = () => {
    if (listening) {
      stop();
    }

    const answer =
      `${finalTranscript.current} ${interimTranscript.current}`.trim() ||
      transcript.trim();

    if (!answer) return;

    const a = analyze(answer, state);

    const vocab = state.vocabulary.map((v) => {
      const hit = a.used.some(
        (u) =>
          u.phrase
            .toLowerCase()
            .replace("...", "") ===
          v.phrase
            .toLowerCase()
            .replace("...", "")
      );

      if (!hit) return v;

      const uses = v.uses + 1;

      return {
        ...v,
        uses,
        status:
          uses >= 3 ? "mastered" : "used",
      } as VocabularyItem;
    });

    const xp =
      state.xp +
      Math.max(
        8,
        Math.min(
          25,
          Math.round(a.words.length / 3)
        )
      );

    const level =
      xp >= state.level * 40
        ? Math.min(10, state.level + 1)
        : state.level;

    const ns = {
      ...state,

      level,
      xp,

      completed: state.completed + 1,

      skills: {
        ...state.skills,

        continuity: Math.round(
          (state.skills.continuity +
            a.continuity) /
            2
        ),

        organization: Math.round(
          (state.skills.organization +
            a.organization) /
            2
        ),

        naturalness: Math.round(
          (state.skills.naturalness +
            a.naturalness) /
            2
        ),

        vocabulary: Math.min(
          95,
          state.skills.vocabulary +
            a.used.length * 3
        ),
      },

      vocabulary: vocab,
    };

    setState(ns);

    const fb: string[] = [];

    fb.push(
      a.words.length < 35
        ? "Develop the idea a little further before finishing."
        : "Good continuity - you kept the thought moving."
    );

    fb.push(
      a.fillers >= 4
        ? "Replace some repeated fillers with a short silent pause."
        : "Filler use was manageable."
    );

    if (a.self > 0) {
      fb.push(
        "Good self-repair - you kept communicating instead of freezing."
      );
    }

    fb.push(
      a.used.length
        ? `You activated ${a.used.length} target expression${
            a.used.length > 1 ? "s" : ""
          }.`
        : "Try to activate one target expression next time."
    );

    setFeedback(fb);

    setTask(nextTask(level));
    setTarget([]);

    setTranscript(answer);

    finalTranscript.current = answer;
    interimTranscript.current = "";
  };

  const progress = useMemo(
    () =>
      Math.min(
        100,
        Math.round(
          ((state.xp % 40) / 40) * 100
        )
      ),
    [state.xp]
  );

  return (
    <main className="shell">
      <header className="top">
        <div>
          <div className="logo">
            Speak<span>Flow</span>
          </div>

          <small>
            Adaptive spoken English trainer
          </small>
        </div>

        <b className="badge">
          LEVEL {state.level}
        </b>
      </header>

      <nav>
        {(
          [
            ["session", "Session"],
            ["progress", "Progress"],
            ["vocab", "Vocabulary"],
          ] as const
        ).map(([id, label]) => (
          <button
            className={
              tab === id ? "active" : ""
            }
            onClick={() =>
              setTab(id)
            }
            key={id}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "session" && (
        <section className="content">
          <div className="hero">
            <small>
              LEVEL {state.level} -{" "}
              {task.mode.toUpperCase()}
            </small>

            <h1>{task.title}</h1>

            <p>{task.prompt}</p>

            <button
              className="hear"
              onClick={() =>
                speak(task.prompt)
              }
            >
              Hear prompt
            </button>
          </div>

          <div className="card">
            <b>Active vocabulary</b>

            <span className="muted">
              Use 1-2 naturally
            </span>

            <div className="chips">
              {(
                target.length
                  ? target
                  : state.vocabulary
                      .filter(
                        (v) =>
                          v.status !==
                          "mastered"
                      )
                      .slice(0, 3)
              ).map((v) => (
                <button
                  className="chip"
                  key={v.phrase}
                  onClick={() =>
                    speak(
                      `${v.phrase}. ${v.meaning}. Example: ${v.example}`
                    )
                  }
                >
                  {v.phrase}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="microw">
              <button
                className={
                  "mic " +
                  (listening ? "rec" : "")
                }
                onClick={
                  listening ? stop : start
                }
              >
                {listening ? "STOP" : "MIC"}
              </button>

              <div>
                <b>
                  {listening
                    ? reconnecting
                      ? "Reconnecting..."
                      : "Listening..."
                    : "Tap and speak"}
                </b>

                <span>
                  {supported
                    ? listening
                      ? `Natural pauses are okay - ${seconds}s / 90s`
                      : "Speak naturally. Pause to think. You have up to 90 seconds."
                    : "Use Chrome or Edge for voice recognition."}
                </span>
              </div>
            </div>

            <div className="transcript">
              {transcript ||
                "Your spoken words will appear here..."}
            </div>

            <div className="actions">
              <button
                onClick={begin}
                className="secondary"
              >
                Start / hear task
              </button>

              <button
                onClick={submit}
                disabled={
                  !transcript.trim() &&
                  !finalTranscript.current.trim()
                }
                className="primary"
              >
                Finish answer
              </button>
            </div>
          </div>

          {feedback.length > 0 && (
            <div className="feedback">
              <small>
                TARGETED FEEDBACK
              </small>

              {feedback.map((x, i) => (
                <p key={i}>
                  - {x}
                </p>
              ))}

              <button
                onClick={begin}
                className="primary full"
              >
                Next speaking task
              </button>
            </div>
          )}

          <div className="card rule">
            <b>How it works</b>

            <span>
              Expose - Speak - Diagnose - Retry -
              Vary - Retrieve - Progress
            </span>
          </div>
        </section>
      )}

      {tab === "progress" && (
        <section className="content">
          <div className="hero">
            <small>
              YOUR TRAINING MAP
            </small>

            <h1>Progress</h1>

            <p>
              The goal is not perfect English.
              The goal is automatic, confident
              communication.
            </p>
          </div>

          <div className="stats">
            <div>
              <b>{state.completed}</b>
              <small>Sessions</small>
            </div>

            <div>
              <b>{state.level}</b>
              <small>Level</small>
            </div>

            <div>
              <b>
                {
                  state.vocabulary.filter(
                    (v) =>
                      v.status ===
                      "mastered"
                  ).length
                }
              </b>

              <small>Mastered</small>
            </div>
          </div>

          <div className="card">
            {Object.entries(
              state.skills
            ).map(([k, v]) => (
              <div
                className="metric"
                key={k}
              >
                <div>
                  <b>
                    {k.replace(
                      /([A-Z])/g,
                      " $1"
                    )}
                  </b>

                  <span>{v}%</span>
                </div>

                <div className="bar">
                  <i
                    style={{
                      width: `${v}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="metric">
              <div>
                <b>
                  Level progress
                </b>

                <span>
                  {progress}%
                </span>
              </div>

              <div className="bar">
  <i style={{ width: `${progress}%` }} />
</div>
</div>
</div>
</section>}

{tab === "vocab" && (
  <section className="content">
    <div className="hero">
      <small>ACTIVE VOCABULARY</small>
      <h1>Words you can actually use</h1>
      <p>
        Exposure alone isn’t mastery. Retrieve expressions later and use them
        in new situations.
      </p>
    </div>

    <div className="card list">
      {state.vocabulary.map((v) => (
        <div className="vrow" key={v.phrase}>
          <div>
            <b>{v.phrase}</b>
            <p>{v.meaning}</p>
            <small>{v.example}</small>
          </div>
          <em>
            {v.status} · {v.uses}
          </em>
        </div>
      ))}
    </div>
  </section>
)}

<footer>
  SpeakFlow v1.1 · Natural pause capture · Progress saved on this device
</footer>
</main>
  );
}
