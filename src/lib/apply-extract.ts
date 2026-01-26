import { PromptData, defaultPromptData, Journey } from './types';
import { ExtractedFields, FieldExtraction, JourneyExtraction, CONFIDENCE_THRESHOLD } from './extract-types';

/**
 * Apply extracted fields to PromptData, only if confidence meets threshold.
 * Returns a new PromptData with extracted values merged in.
 */
export function applyExtractedFields(
  current: PromptData,
  extracted: ExtractedFields,
  autoApplyThreshold: number = CONFIDENCE_THRESHOLD.HIGH
): PromptData {
  const result = { ...current };

  // Helper to apply a field if it meets threshold
  const applyField = <K extends keyof PromptData>(
    key: K,
    extraction: FieldExtraction | undefined
  ) => {
    if (extraction && extraction.confidence >= autoApplyThreshold && extraction.value.trim()) {
      (result as Record<string, unknown>)[key] = extraction.value;
    }
  };

  // Apply simple fields
  applyField('featureName', extracted.featureName);
  applyField('productCompany', extracted.productCompany);
  applyField('problem', extracted.problem);
  applyField('targetUsers', extracted.targetUsers);
  applyField('designPrinciple', extracted.designPrinciple);
  applyField('criticalChallenge', extracted.criticalChallenge);
  applyField('platform', extracted.platform);
  applyField('designSystem', extracted.designSystem);
  applyField('layoutConstraints', extracted.layoutConstraints);

  // Apply journeys
  if (extracted.journeys && extracted.journeys.length > 0) {
    const newJourneys: Journey[] = extracted.journeys.map((j: JourneyExtraction) => ({
      name: j.name?.confidence >= autoApplyThreshold ? j.name.value : '',
      when: j.when?.confidence >= autoApplyThreshold ? j.when.value : '',
      trigger: j.trigger?.confidence >= autoApplyThreshold ? j.trigger.value : '',
      mustCommunicate: j.mustCommunicate?.confidence >= autoApplyThreshold ? j.mustCommunicate.value : '',
      ctas: j.ctas?.confidence >= autoApplyThreshold ? j.ctas.value : '',
      tone: j.tone?.confidence >= autoApplyThreshold ? j.tone.value : '',
      supportingElements: j.supportingElements?.confidence >= autoApplyThreshold ? j.supportingElements.value : '',
    }));
    
    // Only replace if we have at least one journey with a name
    if (newJourneys.some(j => j.name.trim())) {
      result.journeys = newJourneys;
    }
  }

  // Apply supporting screens
  if (extracted.supportingScreens && extracted.supportingScreens.length > 0) {
    const newScreens = extracted.supportingScreens
      .filter(s => s.confidence >= autoApplyThreshold && s.value.trim())
      .map(s => s.value);
    if (newScreens.length > 0) {
      result.supportingScreens = newScreens;
    }
  }

  return result;
}

/**
 * Get all fields that were extracted but below threshold (suggestions)
 */
export function getSuggestedFields(
  extracted: ExtractedFields,
  autoApplyThreshold: number = CONFIDENCE_THRESHOLD.HIGH
): ExtractedFields {
  const suggestions: ExtractedFields = {};

  const checkField = (key: keyof ExtractedFields, extraction: FieldExtraction | undefined) => {
    if (extraction && extraction.confidence < autoApplyThreshold && extraction.confidence >= CONFIDENCE_THRESHOLD.LOW && extraction.value.trim()) {
      (suggestions as Record<string, unknown>)[key] = extraction;
    }
  };

  checkField('featureName', extracted.featureName);
  checkField('productCompany', extracted.productCompany);
  checkField('problem', extracted.problem);
  checkField('targetUsers', extracted.targetUsers);
  checkField('designPrinciple', extracted.designPrinciple);
  checkField('criticalChallenge', extracted.criticalChallenge);
  checkField('platform', extracted.platform);
  checkField('designSystem', extracted.designSystem);
  checkField('layoutConstraints', extracted.layoutConstraints);

  return suggestions;
}

/**
 * Reset to default empty state
 */
export function getEmptyPromptData(): PromptData {
  return { ...defaultPromptData };
}
