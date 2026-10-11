"use client";

import { useEffect, useState } from "react";
import { type LearnerState, readLearnerState } from "./learner-state";

export function useLearnerState(): LearnerState {
  const [state, setState] = useState<LearnerState>({
    passedTopics: [],
    quizAttempts: [],
    mastery: {},
    practiceCashPaise: 0,
  });
  useEffect(() => {
    const sync = () => setState(readLearnerState());
    sync();
    window.addEventListener("gullak-state-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gullak-state-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}
