export type TaskType =
  | "opinion"
  | "story"
  | "decision"
  | "situation"
  | "challenge"
  | "description"
  | "explanation"
  | "comparison"
  | "problem-solving"
  | "interview"
  | "debate";

export type Difficulty =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;

export type SpeakingTask = {
  id: string;
  type: TaskType;
  difficulty: Difficulty;
  title: string;
  prompt: string;
  followUp?: string;
  vocabulary: string[];
};

export const TASK_BANK: SpeakingTask[] = [
  {
    id: "opinion-001",
    type: "opinion",
    difficulty: 1,
    title: "Money and happiness",
    prompt:
      "Do you think money can make people happy? Explain your opinion and give one reason.",
    followUp:
      "Can you think of a situation where money cannot solve a problem?",
    vocabulary: [
      "in my opinion",
      "the main reason is",
      "for example",
    ],
  },

  {
    id: "opinion-002",
    type: "opinion",
    difficulty: 2,
    title: "Working from home",
    prompt:
      "Do you think working from home is better than working in an office? Explain why.",
    followUp:
      "What could be one disadvantage of working from home?",
    vocabulary: [
      "from my perspective",
      "on the other hand",
      "work-life balance",
    ],
  },

  {
    id: "story-001",
    type: "story",
    difficulty: 1,
    title: "A memorable experience",
    prompt:
      "Tell me about a memorable experience from your life. Explain what happened and why you remember it.",
    vocabulary: [
      "I remember when",
      "at first",
      "in the end",
    ],
  },

  {
    id: "story-002",
    type: "story",
    difficulty: 2,
    title: "A difficult decision",
    prompt:
      "Tell me about a difficult decision you made. What were your options, and what did you finally decide?",
    vocabulary: [
      "I had to decide",
      "after thinking about it",
      "eventually",
    ],
  },

  {
    id: "decision-001",
    type: "decision",
    difficulty: 2,
    title: "Two jobs",
    prompt:
      "You have two job offers. One pays more but requires travelling. The other pays less but lets you work from home. Which would you choose and why?",
    vocabulary: [
      "I would choose",
      "the main advantage",
      "the downside is",
    ],
  },

  {
    id: "decision-002",
    type: "decision",
    difficulty: 3,
    title: "Money or free time",
    prompt:
      "You can choose between a high-paying job with very little free time or a lower-paying job with much more freedom. Which would you choose?",
    followUp:
      "Would your decision change if you had a family depending on you?",
    vocabulary: [
      "financial security",
      "quality of life",
      "it depends on",
    ],
  },

  {
    id: "situation-001",
    type: "situation",
    difficulty: 2,
    title: "Cancelled flight",
    prompt:
      "Your flight has been cancelled and you have an important meeting tomorrow. Speak to the airline employee and explain the situation. Ask for another flight or another solution.",
    vocabulary: [
      "I need to",
      "is there any alternative",
      "as soon as possible",
    ],
  },

  {
    id: "situation-002",
    type: "situation",
    difficulty: 3,
    title: "Asking for help",
    prompt:
      "Imagine your friend is moving to another city. You need their help before they leave. Explain what you need and ask them politely.",
    vocabulary: [
      "I was wondering if",
      "would you mind",
      "I would really appreciate it",
    ],
  },

  {
    id: "challenge-001",
    type: "challenge",
    difficulty: 3,
    title: "Defend the opposite view",
    prompt:
      "You believe working from home is better than travelling to an office. Now defend the opposite opinion. Explain why someone might prefer office work.",
    vocabulary: [
      "on the other hand",
      "from another perspective",
      "one possible reason",
    ],
  },

  {
    id: "challenge-002",
    type: "challenge",
    difficulty: 4,
    title: "Money versus relationships",
    prompt:
      "Some people believe financial success is more important than maintaining relationships. Argue against this idea and explain your position.",
    vocabulary: [
      "although",
      "however",
      "what matters most",
    ],
  },

  {
    id: "opinion-003",
    type: "opinion",
    difficulty: 4,
    title: "Living abroad",
    prompt:
      "Would you prefer to live in another country permanently or spend a few years there and then return home? Explain your reasons.",
    followUp:
      "What would make you change your decision?",
    vocabulary: [
      "long-term",
      "sense of belonging",
      "adapt to a new culture",
    ],
  },

  {
    id: "story-003",
    type: "story",
    difficulty: 4,
    title: "A lesson you learned",
    prompt:
      "Tell me about a situation that taught you an important lesson. Explain what happened, what you learned, and how it changed you.",
    vocabulary: [
      "looking back",
      "I realized that",
      "as a result",
    ],
  },

  {
    id: "decision-003",
    type: "decision",
    difficulty: 5,
    title: "Family or career",
    prompt:
      "Imagine you receive an excellent career opportunity in another country, but your family cannot move with you immediately. What would you do?",
    followUp:
      "How would you balance your career goals with your family responsibilities?",
    vocabulary: [
      "personal priorities",
      "long-term consequences",
      "find a balance",
    ],
  },

  {
    id: "challenge-003",
    type: "challenge",
    difficulty: 5,
    title: "Is wealth dangerous?",
    prompt:
      "Some people believe becoming wealthy can damage a person's spirituality and relationships. Others believe wealth simply gives people more freedom. Discuss both sides and give your conclusion.",
    vocabulary: [
      "there are two sides to this",
      "material possessions",
      "maintain a balance",
    ],
  },

    {
    id: "description-001",
    type: "description",
    difficulty: 1,
    title: "Describe your home",
    prompt:
      "Describe your home or room. What can you see, and what do you like about it?",
    vocabulary: [
      "there is",
      "next to",
      "my favorite part",
    ],
  },

  {
    id: "explanation-001",
    type: "explanation",
    difficulty: 2,
    title: "Explain your daily routine",
    prompt:
      "Explain your usual daily routine from morning to night.",
    vocabulary: [
      "usually",
      "after that",
      "by the time",
    ],
  },

  {
    id: "comparison-001",
    type: "comparison",
    difficulty: 2,
    title: "City or village",
    prompt:
      "Compare living in a city with living in a village. Which would you prefer?",
    vocabulary: [
      "compared with",
      "whereas",
      "I would rather",
    ],
  },

  {
    id: "problem-solving-001",
    type: "problem-solving",
    difficulty: 3,
    title: "Late employee",
    prompt:
      "Your team member is regularly late for work, affecting the whole team. What would you do?",
    vocabulary: [
      "I would suggest",
      "the best approach",
      "deal with the problem",
    ],
  },

  {
    id: "interview-001",
    type: "interview",
    difficulty: 3,
    title: "Tell me about yourself",
    prompt:
      "Imagine you are in a job interview. Introduce yourself and explain your experience, strengths, and career goals.",
    vocabulary: [
      "my background",
      "one of my strengths",
      "in the long term",
    ],
  },

  {
    id: "debate-001",
    type: "debate",
    difficulty: 4,
    title: "Technology and jobs",
    prompt:
      "Some people believe technology will create more jobs than it destroys. Others disagree. Choose a position and defend it.",
    vocabulary: [
      "I strongly believe",
      "on the contrary",
      "as a result",
    ],
  },

  {
    id: "description-002",
    type: "description",
    difficulty: 4,
    title: "Your ideal workplace",
    prompt:
      "Describe your ideal workplace. Talk about the environment, people, working style, and facilities.",
    vocabulary: [
      "ideally",
      "a productive environment",
      "I would prefer",
    ],
  },

  {
    id: "explanation-002",
    type: "explanation",
    difficulty: 5,
    title: "Explain a useful skill",
    prompt:
      "Choose a skill you think everyone should learn. Explain why it is useful and how someone can learn it.",
    vocabulary: [
      "the reason why",
      "step by step",
      "put it into practice",
    ],
  },

  {
    id: "comparison-002",
    type: "comparison",
    difficulty: 5,
    title: "Experience or education",
    prompt:
      "Compare practical experience with formal education. Which is more important for building a career?",
    vocabulary: [
      "in terms of",
      "both have advantages",
      "what matters is",
    ],
  },

  {
    id: "problem-solving-002",
    type: "problem-solving",
    difficulty: 6,
    title: "Team disagreement",
    prompt:
      "Two important members of your team strongly disagree about how to complete a project. How would you resolve the situation?",
    vocabulary: [
      "find common ground",
      "take into consideration",
      "reach an agreement",
    ],
  },

  {
    id: "interview-002",
    type: "interview",
    difficulty: 6,
    title: "Career change",
    prompt:
      "Imagine an interviewer asks why you want to change your career. Explain your reasons and what you hope to achieve.",
    vocabulary: [
      "make a transition",
      "transferable skills",
      "career growth",
    ],
  },

  {
    id: "debate-002",
    type: "debate",
    difficulty: 7,
    title: "Should university be free?",
    prompt:
      "Argue whether university education should be free for everyone. Consider both the benefits and the possible problems.",
    vocabulary: [
      "from a broader perspective",
      "public funding",
      "access to education",
    ],
  },
];

export function getTasksByDifficulty(
  difficulty: Difficulty
): SpeakingTask[] {
  return TASK_BANK.filter(
    (task) => task.difficulty === difficulty
  );
}

export function getTasksByType(
  type: TaskType,
  difficulty?: Difficulty
): SpeakingTask[] {
  return TASK_BANK.filter(
    (task) =>
      task.type === type &&
      (difficulty === undefined ||
        task.difficulty === difficulty)
  );
}
