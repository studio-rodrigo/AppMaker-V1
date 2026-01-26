// Types for brain dump extraction

export interface FieldExtraction {
  value: string;
  confidence: number; // 0-1
  evidence: string;   // quoted snippet from brain dump
}

export interface JourneyExtraction {
  name: FieldExtraction;
  when: FieldExtraction;
  trigger: FieldExtraction;
  mustCommunicate: FieldExtraction;
  ctas: FieldExtraction;
  tone: FieldExtraction;
  supportingElements: FieldExtraction;
}

export interface ExtractedFields {
  featureName?: FieldExtraction;
  productCompany?: FieldExtraction;
  problem?: FieldExtraction;
  targetUsers?: FieldExtraction;
  designPrinciple?: FieldExtraction;
  criticalChallenge?: FieldExtraction;
  journeys?: JourneyExtraction[];
  supportingScreens?: FieldExtraction[];
  platform?: FieldExtraction;
  designSystem?: FieldExtraction;
  layoutConstraints?: FieldExtraction;
}

export interface ExtractionResult {
  fields: ExtractedFields;
  missing: string[];           // List of fields that couldn't be extracted
  followUpQuestions: string[]; // 1-3 targeted questions to fill gaps
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Confidence thresholds
export const CONFIDENCE_THRESHOLD = {
  HIGH: 0.75,
  MEDIUM: 0.5,
  LOW: 0.25,
};

export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= CONFIDENCE_THRESHOLD.HIGH) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLD.MEDIUM) return 'medium';
  return 'low';
}

export function getConfidenceColor(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  switch (level) {
    case 'high': return '#52c41a';   // green
    case 'medium': return '#faad14'; // orange
    case 'low': return '#ff4d4f';    // red
  }
}
