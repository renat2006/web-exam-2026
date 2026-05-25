export interface TheorySlide {
  type: 'theory';
  title: string;
  definition?: string;
  content?: string;
  comparison?: {
    title: string;
    headers: string[];
    rows: string[][];
  };
  pitfalls?: string[];
  codeSnippet?: string;
  codeExample?: string;
  practiceLink?: string;
  keyTerms?: { term: string; definition: string; iconName?: string }[];
  mnemonic?: string;
  diagram?: {
    type: 'flow' | 'layers' | 'comparison';
    title?: string;
    items: string[];
    secondColumn?: string[];
  };
}

export interface ChoiceSlide {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  codeSnippet?: string;
}

export interface TrueFalseSlide {
  type: 'true-false';
  question: string;
  correctValue: boolean;
  explanation: string;
}

export interface OrderSlide {
  type: 'order';
  question: string;
  items: { id: string; text: string }[];
  correctOrder: string[]; // Order of IDs
  explanation: string;
}

export interface CodingSlide {
  type: 'coding';
  title: string;
  description: string;
  starterCode: string;
  hints: string[];
  testSuite: string; // JavaScript code running tests against window.userSolution
  domSetup?: string;  // HTML string to inject into sandboxed container
  referenceSolution?: string; // Correct implementation code
  explanation?: string;       // Detailed explanation of the logic
}

export interface FindBugSlide {
  type: 'find-the-bug';
  title: string;
  description: string;
  buggyCode: string;
  hints?: string[];
  explanation: string;
  fixedCode: string;        // Reference solution (shown after answering)
  options: string[];        // What is the bug? 4 choices
  correctIndex: number;
}

export type Slide = TheorySlide | ChoiceSlide | TrueFalseSlide | OrderSlide | CodingSlide | FindBugSlide;

export interface Lesson {
  id: string;
  title: string;
  xpReward?: number;
  slides: Slide[];
}

export interface SkillNode {
  id: string;
  week?: number;
  title: string;
  category?: 'HTTP' | 'HTML/CSS' | 'JavaScript' | 'TypeScript' | 'Tooling' | 'React' | 'Tools' | 'Architecture' | 'SPA';
  description: string;
  iconName?: 'Globe' | 'Layout' | 'Code' | 'Shield' | 'Settings' | 'Layers' | 'Zap' | 'RefreshCw' | 'Package' | 'MousePointer';
  lessons: Lesson[];
  topics?: Lesson[];
}
