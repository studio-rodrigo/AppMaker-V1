// Types based on the MDC template structure

export interface Journey {
  name: string;           // Journey name
  when: string;           // WHEN it happens
  trigger: string;        // Trigger/entry point
  mustCommunicate: string; // value props, timing, who, why
  ctas: string;           // primary vs secondary CTAs
  tone: string;           // Tone/framing
  supportingElements: string; // links, visuals, etc.
}

export interface PromptData {
  // PRD / Product Brief
  prdContent: string;        // Full PRD content
  prdSummary: string;        // Optional summary

  // Project Context (maps to opening + Problem/Users/Principle/Challenge)
  featureName: string;
  productCompany: string;
  problem: string;           // 2-3 sentences
  targetUsers: string;       // Role + behavioral context
  designPrinciple: string;   // ONE North Star principle
  criticalChallenge: string; // Key tension or edge case
  
  // User Journeys (maps to CORE USER JOURNEYS section)
  journeys: Journey[];
  
  // Supporting Screens
  supportingScreens: string[];
  
  // UI Requirements
  platform: string;          // web/mobile/desktop
  designSystem: string;      // Company design system name
  layoutConstraints: string; // Key constraints
  statesNeeded: string[];    // Default, hover, loading, success, error
}

// Default empty state for the form
export const defaultPromptData: PromptData = {
  prdContent: '',
  prdSummary: '',
  featureName: '',
  productCompany: '',
  problem: '',
  targetUsers: '',
  designPrinciple: '',
  criticalChallenge: '',
  journeys: [
    {
      name: '',
      when: '',
      trigger: '',
      mustCommunicate: '',
      ctas: '',
      tone: '',
      supportingElements: '',
    },
  ],
  supportingScreens: [''],
  platform: 'web',
  designSystem: '',
  layoutConstraints: '',
  statesNeeded: ['Default', 'Hover', 'Loading', 'Success', 'Error'],
};

// Available states for UI requirements
export const availableStates = [
  'Default',
  'Hover',
  'Loading',
  'Success',
  'Error',
  'Disabled',
  'Empty',
  'Focus',
];

// Platform options
export const platformOptions = [
  { value: 'web', label: 'Web Application' },
  { value: 'mobile', label: 'Mobile App' },
  { value: 'desktop', label: 'Desktop Application' },
  { value: 'responsive', label: 'Responsive (Web + Mobile)' },
];

// Accessibility checklist items (from MDC template)
export const accessibilityChecklist = [
  'All text meets WCAG AA contrast requirements (4.5:1 for body text, 3:1 for large text)',
  'Text is legible on all backgrounds',
  'Button labels are descriptive and clear',
  'Focus states are visible and obvious',
  'No text is too small (minimum 14px for body, 16px recommended)',
];
