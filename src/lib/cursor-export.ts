import { PromptData } from './types';

/**
 * Generates a Cursor-optimized prompt for the Plan agent to create an implementation plan.
 * This format is designed to work well with Cursor's planning capabilities.
 */
export function generateCursorPrompt(data: PromptData): string {
  const lines: string[] = [];

  // Header instruction for Cursor
  lines.push('# App Implementation Request');
  lines.push('');
  lines.push('I want to build an app based on the following design specification. Please create a detailed implementation plan.');
  lines.push('');

  // Project Overview
  lines.push('## Project Overview');
  lines.push('');
  lines.push(`**App Name:** ${data.featureName || '[Feature Name]'}`);
  lines.push(`**Platform:** ${data.productCompany || '[Product/Company]'}`);
  lines.push('');

  // PRD Context if provided
  const prdText = data.prdSummary?.trim() || data.prdContent?.trim();
  if (prdText) {
    lines.push('## Product Requirements Document');
    lines.push('');
    lines.push(prdText);
    lines.push('');
  }

  // Problem & Context
  lines.push('## Problem Statement');
  lines.push('');
  lines.push(data.problem || '[Problem to solve]');
  lines.push('');

  // Target Users
  lines.push('## Target Users');
  lines.push('');
  lines.push(data.targetUsers || '[Target user description]');
  lines.push('');

  // Design Principles
  if (data.designPrinciple?.trim()) {
    lines.push('## Design Principle');
    lines.push('');
    lines.push(`**North Star:** ${data.designPrinciple}`);
    lines.push('');
  }

  // Critical Challenges
  if (data.criticalChallenge?.trim()) {
    lines.push('## Critical Challenges to Address');
    lines.push('');
    lines.push(data.criticalChallenge);
    lines.push('');
  }

  // User Journeys as Features
  lines.push('## Features to Implement (User Journeys)');
  lines.push('');

  if (data.journeys && data.journeys.length > 0) {
    data.journeys.forEach((journey, index) => {
      if (journey.name?.trim() || journey.when?.trim()) {
        lines.push(`### Feature ${index + 1}: ${journey.name || 'Unnamed Journey'}`);
        lines.push('');
        
        if (journey.when?.trim()) {
          lines.push(`**When:** ${journey.when}`);
        }
        if (journey.trigger?.trim()) {
          lines.push(`**Trigger:** ${journey.trigger}`);
        }
        if (journey.mustCommunicate?.trim()) {
          lines.push(`**Must Communicate:** ${journey.mustCommunicate}`);
        }
        if (journey.ctas?.trim()) {
          lines.push(`**CTAs:** ${journey.ctas}`);
        }
        if (journey.tone?.trim()) {
          lines.push(`**Tone/UX:** ${journey.tone}`);
        }
        if (journey.supportingElements?.trim()) {
          lines.push(`**Supporting Elements:** ${journey.supportingElements}`);
        }
        lines.push('');
      }
    });
  }

  // Supporting Screens
  const screens = data.supportingScreens?.filter(s => s?.trim());
  if (screens && screens.length > 0) {
    lines.push('## Additional Screens/Pages');
    lines.push('');
    screens.forEach(screen => {
      lines.push(`- ${screen}`);
    });
    lines.push('');
  }

  // Technical Requirements
  lines.push('## Technical Requirements');
  lines.push('');
  lines.push(`- **Platform:** ${getPlatformDescription(data.platform)}`);
  if (data.designSystem?.trim()) {
    lines.push(`- **Design System/UI Library:** ${data.designSystem}`);
  }
  if (data.layoutConstraints?.trim()) {
    lines.push(`- **Layout Constraints:** ${data.layoutConstraints}`);
  }
  if (data.statesNeeded && data.statesNeeded.length > 0) {
    lines.push(`- **UI States to Handle:** ${data.statesNeeded.join(', ')}`);
  }
  lines.push('');

  // Accessibility Requirements
  lines.push('## Accessibility Requirements');
  lines.push('');
  lines.push('- All text must meet WCAG AA contrast requirements (4.5:1 for body, 3:1 for large text)');
  lines.push('- Text must be legible on all backgrounds');
  lines.push('- Button labels must be descriptive and clear');
  lines.push('- Focus states must be visible and obvious');
  lines.push('- Minimum text size: 14px for body, 16px recommended');
  lines.push('');

  // Instructions for Cursor
  lines.push('---');
  lines.push('');
  lines.push('## Instructions for Cursor');
  lines.push('');
  lines.push('Please create a comprehensive implementation plan that includes:');
  lines.push('');
  lines.push('1. **Tech Stack Recommendation** - Suggest appropriate technologies based on the requirements');
  lines.push('2. **Project Structure** - Outline the folder structure and key files');
  lines.push('3. **Component Breakdown** - List all UI components needed');
  lines.push('4. **Data Model** - Define the data structures and state management approach');
  lines.push('5. **API/Backend Requirements** - If applicable, outline backend needs');
  lines.push('6. **Implementation Steps** - Break down into actionable tasks');
  lines.push('');
  lines.push('After reviewing the plan, I will confirm and you can begin implementation.');

  return lines.join('\n');
}

/**
 * Get a human-readable platform description
 */
function getPlatformDescription(platform: string): string {
  const descriptions: Record<string, string> = {
    'web': 'Web Application (React/Next.js recommended)',
    'mobile': 'Mobile App (React Native or native)',
    'desktop': 'Desktop Application (Electron recommended)',
    'responsive': 'Responsive Web (Mobile-first, works on all devices)',
  };
  return descriptions[platform] || platform;
}

/**
 * Generate a filename-safe version of the feature name
 */
export function getSafeFilename(data: PromptData): string {
  const name = data.featureName || 'rodrigo-labs-prompt';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}
