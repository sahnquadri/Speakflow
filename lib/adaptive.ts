import {
  TASK_BANK,
  type Difficulty,
  type SpeakingTask,
  type TaskType,
} from "./tasks";

export type Performance = {
  continuity: number;
  organization: number;
  naturalness: number;
  vocabulary: number;
  words: number;
  fillers: number;
  usedVocabulary: number;
};

export type AdaptiveContext = {
  level: number;
  completed: number;
  recentTaskIds: string[];
  recentTypes: TaskType[];
  performance?: Performance;
};

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function getDifficulty(
  level: number,
  performance?: Performance
): Difficulty {
  let difficulty = clamp(
    level,
    1,
    10
  );

  if (!performance) {
    return difficulty as Difficulty;
  }

  const average =
    (
      performance.continuity +
      performance.organization +
      performance.naturalness +
      performance.vocabulary
    ) / 4;

  if (average >= 82) {
    difficulty += 1;
  } else if (average < 55) {
    difficulty -= 1;
  }

  return clamp(
    difficulty,
    1,
    10
  ) as Difficulty;
}

function chooseType(
  context: AdaptiveContext
): TaskType {
  const recent = context.recentTypes;

  if (!recent.length) {
    return "opinion";
  }

  const last = recent[recent.length - 1];

  const rotation: Record<
  TaskType,
  TaskType[]
> = {
  opinion: [
    "story",
    "comparison",
    "debate",
  ],

  story: [
    "description",
    "decision",
    "interview",
  ],

  decision: [
    "problem-solving",
    "situation",
    "opinion",
  ],

  situation: [
    "interview",
    "problem-solving",
    "story",
  ],

  challenge: [
    "debate",
    "explanation",
    "decision",
  ],

  description: [
    "story",
    "comparison",
    "explanation",
  ],

  explanation: [
    "opinion",
    "description",
    "problem-solving",
  ],

  comparison: [
    "decision",
    "opinion",
    "debate",
  ],

  "problem-solving": [
    "situation",
    "decision",
    "explanation",
  ],

  interview: [
    "story",
    "opinion",
    "situation",
  ],

  debate: [
    "challenge",
    "opinion",
    "comparison",
  ],
};

  const choices =
    rotation[last];

  return choices[
    Math.floor(
      Math.random() *
        choices.length
    )
  ];
}

function scoreTask(
  task: SpeakingTask,
  context: AdaptiveContext
) {
  let score = 0;

  if (
    context.recentTaskIds.includes(
      task.id
    )
  ) {
    score -= 100;
  }

  const recentTypeCount =
    context.recentTypes.filter(
      (type) =>
        type === task.type
    ).length;

  score -=
    recentTypeCount * 15;

  if (
    task.difficulty ===
    getDifficulty(
      context.level,
      context.performance
    )
  ) {
    score += 30;
  }

  if (
    task.type ===
    chooseType(context)
  ) {
    score += 20;
  }

  score += Math.random() * 10;

  return score;
}

export function getNextTask(
  context: AdaptiveContext
): SpeakingTask {
  const difficulty =
    getDifficulty(
      context.level,
      context.performance
    );

  const preferredType =
    chooseType(context);

  let candidates =
    TASK_BANK.filter(
      (task) =>
        task.difficulty ===
          difficulty &&
        task.type ===
          preferredType
    );

  if (!candidates.length) {
    candidates =
      TASK_BANK.filter(
        (task) =>
          task.difficulty ===
          difficulty
      );
  }

  if (!candidates.length) {
    candidates =
      TASK_BANK.filter(
        (task) =>
          Math.abs(
            task.difficulty -
              difficulty
          ) <= 1
      );
  }

  candidates = [
    ...candidates,
  ].sort(
    (a, b) =>
      scoreTask(b, context) -
      scoreTask(a, context)
  );

  return candidates[0];
}
