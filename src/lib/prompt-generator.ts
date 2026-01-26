import { PromptData, accessibilityChecklist } from './types';

/**
 * Generates a Figma Make prompt following the EXACT format from the MDC template.
 * Reference: Rules/_AI Design Workflow Guide V2.mdc
 */
export function generatePrompt(data: PromptData): string {
  const lines: string[] = [];

  // PRD Context (if provided)
  const prdText = data.prdSummary?.trim() || data.prdContent?.trim();
  if (prdText) {
    lines.push('**PRODUCT CONTEXT (from PRD):**');
    lines.push('');
    lines.push(prdText);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Opening line
  lines.push(`I'm designing ${data.featureName || '[feature name]'} for ${data.productCompany || '[product/company]'}.`);
  lines.push('');

  // Problem section
  lines.push('**Problem:**');
  lines.push(data.problem || '[2-3 sentences: What\'s the gap? What\'s the solution?]');
  lines.push('');

  // Target Users section
  lines.push('**Target Users:**');
  lines.push(data.targetUsers || '[Role + behavioral context: How often? What device? What mindset?]');
  lines.push('');

  // Key Design Principle section
  lines.push('**Key Design Principle:**');
  lines.push(data.designPrinciple || '[ONE North Star principle for tone/framing]');
  lines.push('');

  // Critical Challenge section
  lines.push('**Critical Challenge:**');
  lines.push(data.criticalChallenge || '[One key tension or edge case]');
  lines.push('');

  // Divider
  lines.push('---');
  lines.push('');

  // Core User Journeys section
  lines.push('**CORE USER JOURNEYS TO DESIGN:**');
  lines.push('');

  // Generate journeys
  if (data.journeys && data.journeys.length > 0) {
    data.journeys.forEach((journey, index) => {
      const journeyNum = index + 1;
      const name = journey.name || `[Journey ${journeyNum} Name]`;
      const when = journey.when || '[WHEN it happens]';
      
      lines.push(`**Journey ${journeyNum}: ${name} (${when})**`);
      lines.push(`- ${journey.trigger || '[Trigger/entry point]'}`);
      lines.push(`- Must communicate: ${journey.mustCommunicate || '[value props, timing, who, why]'}`);
      lines.push(`- ${journey.ctas || '[Key CTAs: primary vs secondary]'}`);
      lines.push(`- ${journey.tone || '[Tone/framing]'}`);
      lines.push(`- ${journey.supportingElements || '[Supporting elements: links, visuals, etc.]'}`);
      lines.push('');
    });
  } else {
    // Default placeholder journey
    lines.push('**Journey 1: [Name] ([WHEN it happens])**');
    lines.push('- [Trigger/entry point]');
    lines.push('- Must communicate: [value props, timing, who, why]');
    lines.push('- [Key CTAs: primary vs secondary]');
    lines.push('- [Tone/framing]');
    lines.push('- [Supporting elements: links, visuals, etc.]');
    lines.push('');
  }

  // Supporting Screens section
  lines.push('**Supporting Screens:**');
  if (data.supportingScreens && data.supportingScreens.filter(s => s.trim()).length > 0) {
    data.supportingScreens.filter(s => s.trim()).forEach(screen => {
      lines.push(`- ${screen}`);
    });
  } else {
    lines.push('- [Brief list]');
  }
  lines.push('');

  // Divider
  lines.push('---');
  lines.push('');

  // UI Requirements section
  lines.push('**UI Requirements:**');
  lines.push(`- Platform: ${data.platform || '[web/mobile/desktop]'}`);
  lines.push(`- Design system: ${data.designSystem || '[Your design system]'}`);
  lines.push(`- Layout: ${data.layoutConstraints || '[Key constraints]'}`);
  
  const states = data.statesNeeded && data.statesNeeded.length > 0 
    ? data.statesNeeded.join(', ') 
    : 'Default, Hover, Loading, Success, Error';
  lines.push(`- States needed: ${states}`);
  lines.push('');

  // Divider
  lines.push('---');
  lines.push('');

  // Accessibility Check section
  lines.push('**ACCESSIBILITY CHECK (CRITICAL):**');
  lines.push('After generating designs, verify:');
  accessibilityChecklist.forEach(item => {
    lines.push(`- [ ] ${item}`);
  });
  lines.push('- Use browser dev tools or contrast checker to validate all text/background combinations');

  return lines.join('\n');
}

/**
 * Check if the prompt data has enough content to be useful
 */
export function isPromptComplete(data: PromptData): boolean {
  const hasBasicInfo = data.featureName.trim() !== '' && data.productCompany.trim() !== '';
  const hasProblem = data.problem.trim() !== '';
  const hasJourneys = data.journeys.some(j => j.name.trim() !== '');
  
  return hasBasicInfo && hasProblem && hasJourneys;
}

/**
 * Get a completeness score (0-100) for the prompt
 */
export function getCompletenessScore(data: PromptData): number {
  let score = 0;
  const weights = {
    featureName: 10,
    productCompany: 10,
    problem: 15,
    targetUsers: 10,
    designPrinciple: 10,
    criticalChallenge: 10,
    journeys: 20,
    supportingScreens: 5,
    designSystem: 5,
    layoutConstraints: 5,
  };

  if (data.featureName.trim()) score += weights.featureName;
  if (data.productCompany.trim()) score += weights.productCompany;
  if (data.problem.trim()) score += weights.problem;
  if (data.targetUsers.trim()) score += weights.targetUsers;
  if (data.designPrinciple.trim()) score += weights.designPrinciple;
  if (data.criticalChallenge.trim()) score += weights.criticalChallenge;
  if (data.journeys.some(j => j.name.trim() && j.when.trim())) score += weights.journeys;
  if (data.supportingScreens.some(s => s.trim())) score += weights.supportingScreens;
  if (data.designSystem.trim()) score += weights.designSystem;
  if (data.layoutConstraints.trim()) score += weights.layoutConstraints;

  return score;
}
