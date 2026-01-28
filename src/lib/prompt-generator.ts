import { PromptData, WorkflowMode, accessibilityChecklist } from './types';

/**
 * Generates a prompt based on the workflow mode.
 * Each mode has a format tailored to the fields it collects.
 */
export function generatePrompt(data: PromptData, mode: WorkflowMode = 'product'): string {
  switch (mode) {
    case 'idea':
      return generateIdeaPrompt(data);
    case 'team':
      return generateTeamPrompt(data);
    case 'product':
    default:
      return generateProductPrompt(data);
  }
}

/**
 * Generates a simplified prompt for Idea mode.
 * Focuses on: appType, appSummary, simplified journeys, design vibe.
 */
function generateIdeaPrompt(data: PromptData): string {
  const lines: string[] = [];

  // Opening line with app type
  const appName = data.featureName || '[App Name]';
  const appType = data.appType ? ` - ${data.appType}` : '';
  lines.push(`I'm building **${appName}**${appType}.`);
  lines.push('');

  // What it is (appSummary)
  if (data.appSummary?.trim()) {
    lines.push('**What it is:**');
    lines.push(data.appSummary);
    lines.push('');
  }

  // Who it's for
  if (data.targetUsers?.trim()) {
    lines.push('**Who it\'s for:**');
    lines.push(data.targetUsers);
    lines.push('');
  }

  // Key constraint/goal
  if (data.designPrinciple?.trim()) {
    lines.push('**Key constraint:**');
    lines.push(data.designPrinciple);
    lines.push('');
  }

  // Divider
  lines.push('---');
  lines.push('');

  // Simplified User Flows
  lines.push('**KEY USER FLOWS:**');
  lines.push('');

  if (data.journeys && data.journeys.length > 0 && data.journeys.some(j => j.name?.trim())) {
    data.journeys.forEach((journey, index) => {
      if (journey.name?.trim()) {
        const flowNum = index + 1;
        lines.push(`**Flow ${flowNum}: ${journey.name}**`);
        if (journey.mustCommunicate?.trim()) {
          lines.push(`- Key moment: ${journey.mustCommunicate}`);
        }
        lines.push('');
      }
    });
  } else {
    lines.push('**Flow 1: [What happens]**');
    lines.push('- Key moment: [What matters most]');
    lines.push('');
  }

  // Divider
  lines.push('---');
  lines.push('');

  // Design Vibe
  const designVibe = data.designSystem || data.designVibe || data.designSystemConfig?.toneDescription;
  if (designVibe?.trim()) {
    lines.push('**Design Vibe:**');
    lines.push(designVibe);
    if (data.designSystemConfig?.brandFeel?.trim()) {
      lines.push(`(${data.designSystemConfig.brandFeel})`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Platform (if specified)
  if (data.platform && data.platform !== 'web') {
    lines.push(`**Platform:** ${data.platform}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

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
 * Generates a full prompt for Product mode.
 * This is the original format with all fields.
 */
function generateProductPrompt(data: PromptData): string {
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
 * Generates a PRD-first prompt for Team mode.
 * Includes: existingAppContext, featureScope, stakeholders, integrationPoints.
 */
function generateTeamPrompt(data: PromptData): string {
  const lines: string[] = [];

  // PRD Context (primary for team mode)
  const prdText = data.prdSummary?.trim() || data.prdContent?.trim();
  if (prdText) {
    lines.push('**PRODUCT CONTEXT (from PRD):**');
    lines.push('');
    lines.push(prdText);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Existing App Context section (Team-specific)
  const hasTeamContext = data.existingAppContext?.trim() || data.featureScope || data.integrationPoints?.trim();
  if (hasTeamContext) {
    lines.push('**EXISTING APP CONTEXT:**');
    if (data.existingAppContext?.trim()) {
      lines.push(data.existingAppContext);
    }
    if (data.featureScope) {
      const scopeLabels: Record<string, string> = {
        'new': 'New Feature',
        'enhancement': 'Enhancement',
        'redesign': 'Redesign',
      };
      lines.push(`- Feature Scope: ${scopeLabels[data.featureScope] || data.featureScope}`);
    }
    if (data.integrationPoints?.trim()) {
      lines.push(`- Integration Points: ${data.integrationPoints}`);
    }
    lines.push('');
  }

  // Stakeholders section (Team-specific)
  if (data.stakeholders?.trim()) {
    lines.push('**STAKEHOLDERS:**');
    lines.push(data.stakeholders);
    lines.push('');
  }

  // Divider if we had team context
  if (hasTeamContext || data.stakeholders?.trim()) {
    lines.push('---');
    lines.push('');
  }

  // Core User Journeys section (full format like Product mode)
  lines.push('**CORE USER JOURNEYS TO DESIGN:**');
  lines.push('');

  if (data.journeys && data.journeys.length > 0 && data.journeys.some(j => j.name?.trim())) {
    data.journeys.forEach((journey, index) => {
      const journeyNum = index + 1;
      const name = journey.name || `[Journey ${journeyNum} Name]`;
      const when = journey.when || '[WHEN it happens]';
      
      lines.push(`**Journey ${journeyNum}: ${name} (${when})**`);
      if (journey.trigger?.trim()) {
        lines.push(`- Trigger: ${journey.trigger}`);
      }
      if (journey.mustCommunicate?.trim()) {
        lines.push(`- Must communicate: ${journey.mustCommunicate}`);
      }
      if (journey.ctas?.trim()) {
        lines.push(`- CTAs: ${journey.ctas}`);
      }
      if (journey.tone?.trim()) {
        lines.push(`- Tone: ${journey.tone}`);
      }
      if (journey.supportingElements?.trim()) {
        lines.push(`- Supporting elements: ${journey.supportingElements}`);
      }
      lines.push('');
    });
  } else {
    lines.push('**Journey 1: [Name] ([WHEN it happens])**');
    lines.push('- [Define the user journey details]');
    lines.push('');
  }

  // Supporting Screens section
  if (data.supportingScreens && data.supportingScreens.filter(s => s.trim()).length > 0) {
    lines.push('**Supporting Screens:**');
    data.supportingScreens.filter(s => s.trim()).forEach(screen => {
      lines.push(`- ${screen}`);
    });
    lines.push('');
  }

  // Divider
  lines.push('---');
  lines.push('');

  // UI Requirements section
  lines.push('**UI Requirements:**');
  lines.push(`- Platform: ${data.platform || '[web/mobile/desktop]'}`);
  if (data.designSystem?.trim()) {
    lines.push(`- Design system: ${data.designSystem}`);
  }
  if (data.layoutConstraints?.trim()) {
    lines.push(`- Layout: ${data.layoutConstraints}`);
  }
  
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
export function isPromptComplete(data: PromptData, mode: WorkflowMode = 'product'): boolean {
  switch (mode) {
    case 'idea':
      return data.featureName.trim() !== '' && data.journeys.some(j => j.name.trim() !== '');
    case 'team':
      return (data.prdContent?.trim() !== '' || data.prdSummary?.trim() !== '') && 
             data.journeys.some(j => j.name.trim() !== '');
    case 'product':
    default:
      const hasBasicInfo = data.featureName.trim() !== '' && data.productCompany.trim() !== '';
      const hasProblem = data.problem.trim() !== '';
      const hasJourneys = data.journeys.some(j => j.name.trim() !== '');
      return hasBasicInfo && hasProblem && hasJourneys;
  }
}

/**
 * Get a completeness score (0-100) for the prompt based on mode.
 * Each mode weighs different fields based on what it collects.
 */
export function getCompletenessScore(data: PromptData, mode: WorkflowMode = 'product'): number {
  switch (mode) {
    case 'idea':
      return getIdeaCompletenessScore(data);
    case 'team':
      return getTeamCompletenessScore(data);
    case 'product':
    default:
      return getProductCompletenessScore(data);
  }
}

/**
 * Completeness score for Idea mode - simplified fields
 */
function getIdeaCompletenessScore(data: PromptData): number {
  let score = 0;
  const weights = {
    featureName: 20,
    appType: 10,
    appSummary: 15,
    targetUsers: 15,
    designPrinciple: 10,
    journeys: 20,
    designSystem: 10,
  };

  if (data.featureName?.trim()) score += weights.featureName;
  if (data.appType?.trim()) score += weights.appType;
  if (data.appSummary?.trim()) score += weights.appSummary;
  if (data.targetUsers?.trim()) score += weights.targetUsers;
  if (data.designPrinciple?.trim()) score += weights.designPrinciple;
  // For idea mode, journeys just need a name
  if (data.journeys?.some(j => j.name?.trim())) score += weights.journeys;
  if (data.designSystem?.trim() || data.designVibe?.trim() || data.designSystemConfig?.toneDescription?.trim()) {
    score += weights.designSystem;
  }

  return score;
}

/**
 * Completeness score for Product mode - full structured fields
 */
function getProductCompletenessScore(data: PromptData): number {
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

  if (data.featureName?.trim()) score += weights.featureName;
  if (data.productCompany?.trim()) score += weights.productCompany;
  if (data.problem?.trim()) score += weights.problem;
  if (data.targetUsers?.trim()) score += weights.targetUsers;
  if (data.designPrinciple?.trim()) score += weights.designPrinciple;
  if (data.criticalChallenge?.trim()) score += weights.criticalChallenge;
  // For product mode, journeys need name and when
  if (data.journeys?.some(j => j.name?.trim() && j.when?.trim())) score += weights.journeys;
  if (data.supportingScreens?.some(s => s?.trim())) score += weights.supportingScreens;
  if (data.designSystem?.trim()) score += weights.designSystem;
  if (data.layoutConstraints?.trim()) score += weights.layoutConstraints;

  return score;
}

/**
 * Completeness score for Team mode - PRD-first with team context
 */
function getTeamCompletenessScore(data: PromptData): number {
  let score = 0;
  const weights = {
    prdContent: 25,
    existingAppContext: 10,
    featureScope: 5,
    stakeholders: 10,
    integrationPoints: 5,
    journeys: 20,
    supportingScreens: 5,
    designSystem: 10,
    layoutConstraints: 5,
    platform: 5,
  };

  if (data.prdContent?.trim() || data.prdSummary?.trim()) score += weights.prdContent;
  if (data.existingAppContext?.trim()) score += weights.existingAppContext;
  if (data.featureScope) score += weights.featureScope;
  if (data.stakeholders?.trim()) score += weights.stakeholders;
  if (data.integrationPoints?.trim()) score += weights.integrationPoints;
  // For team mode, journeys need name and when
  if (data.journeys?.some(j => j.name?.trim() && j.when?.trim())) score += weights.journeys;
  if (data.supportingScreens?.some(s => s?.trim())) score += weights.supportingScreens;
  if (data.designSystem?.trim()) score += weights.designSystem;
  if (data.layoutConstraints?.trim()) score += weights.layoutConstraints;
  if (data.platform?.trim()) score += weights.platform;

  return score;
}
