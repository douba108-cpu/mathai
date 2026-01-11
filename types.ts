
export enum SegmentType {
  USEFUL = 'useful',
  USELESS = 'useless',
  MISLEADING = 'misleading'
}

export interface TextSegment {
  text: string;
  type: SegmentType;
  explanation?: string;
}

export enum StepType {
  QUESTION = 'question',
  INFERENCE = 'inference'
}

export interface SolvingStep {
  id: number;
  type: StepType;
  instruction: string;
  options?: string[];
  optionExplanations?: string[];
  correctOptionIndex?: number;
  aiConclusion?: string;
  explanation: string;
}

export interface ProblemAnalysis {
  segments: TextSegment[];
  keyVariables: { name: string; value: string }[];
  steps: SolvingStep[];
}
