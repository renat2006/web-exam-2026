export interface TheorySlide {
  type: 'theory';
  title: string;
  definition: string;
  comparison?: {
    title: string;
    headers: string[];
    rows: string[][];
  };
  pitfalls: string[];
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

export type Slide = TheorySlide | ChoiceSlide | TrueFalseSlide | OrderSlide | CodingSlide;

export interface Lesson {
  id: string;
  title: string;
  xpReward: number;
  slides: Slide[];
}

export interface SkillNode {
  id: string;
  title: string;
  category: 'HTTP' | 'HTML/CSS' | 'JavaScript' | 'TypeScript' | 'Tooling' | 'React' | 'Tools';
  description: string;
  iconName: 'Globe' | 'Layout' | 'Code' | 'Shield' | 'Settings' | 'Layers' | 'Zap' | 'RefreshCw' | 'Package' | 'MousePointer';
  lessons: Lesson[];
}
