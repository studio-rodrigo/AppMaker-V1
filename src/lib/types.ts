// Types based on the MDC template structure

// Workflow mode types
export type WorkflowMode = 'idea' | 'product' | 'team';

// Design system input types
export type DesignSystemType = 'vibe' | 'system' | 'mcp' | 'llm-txt' | 'figma' | 'tokens';

export interface DesignSystemConfig {
  type: DesignSystemType;
  
  // For vibe type (Idea mode) - descriptive aesthetic
  toneDescription?: string;      // "Clean and minimal with subtle animations"
  brandFeel?: string;            // "Like Linear meets Notion"
  
  // For system type (off-the-shelf picker)
  systemName?: string;           // 'shadcn' | 'antd' | 'mui' | 'chakra' | 'tailwind' | 'bootstrap'
  
  // For MCP type (Model Context Protocol server)
  mcpServerUrl?: string;
  mcpConnectionStatus?: 'connected' | 'disconnected' | 'error';
  
  // For llm-txt type (design documentation URL)
  llmTxtUrl?: string;
  
  // For figma type (team design system file)
  figmaFileUrl?: string;
  figmaConnectionStatus?: 'connected' | 'disconnected' | 'error';
  
  // For tokens type (JSON design tokens)
  tokensJson?: string;
}

export const defaultDesignSystemConfig: DesignSystemConfig = {
  type: 'vibe',
  toneDescription: '',
  brandFeel: '',
};

export interface ModeConfig {
  id: WorkflowMode;
  name: string;
  description: string;
  primarySections: string[];
  secondarySections: string[];  // Collapsed but available
  hiddenSections: string[];     // Summonable via "Show more options"
  sectionOrder: string[];
  designSystemStyle: 'vibe' | 'picker' | 'locked';
}

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
  appType: string;           // App category/type
  appSummary: string;        // Digestible summary for vibe coders
  productCompany: string;
  problem: string;           // 2-3 sentences
  targetUsers: string;       // Role + behavioral context
  designPrinciple: string;   // ONE North Star principle
  criticalChallenge: string; // Key tension or edge case
  designVibe: string;        // Aesthetic/feel description
  
  // User Journeys (maps to CORE USER JOURNEYS section)
  journeys: Journey[];
  
  // Supporting Screens
  supportingScreens: string[];
  
  // UI Requirements
  platform: string;          // web/mobile/desktop
  designSystem: string;      // Computed/legacy field for prompt generation
  designSystemConfig?: DesignSystemConfig;  // Structured design system data
  layoutConstraints: string; // Key constraints
  statesNeeded: string[];    // Default, hover, loading, success, error
  
  // Team mode fields
  stakeholders?: string;           // Who needs to approve/review
  existingAppContext?: string;     // Description of existing app
  featureScope?: 'new' | 'enhancement' | 'redesign';
  integrationPoints?: string;      // How this connects to existing screens
}

// Default empty state for the form
export const defaultPromptData: PromptData = {
  prdContent: '',
  prdSummary: '',
  featureName: '',
  appType: '',
  appSummary: '',
  productCompany: '',
  problem: '',
  targetUsers: '',
  designPrinciple: '',
  criticalChallenge: '',
  designVibe: '',
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
  designSystemConfig: defaultDesignSystemConfig,
  layoutConstraints: '',
  statesNeeded: ['Default', 'Hover', 'Loading', 'Success', 'Error'],
  stakeholders: '',
  existingAppContext: '',
  featureScope: undefined,
  integrationPoints: '',
};

// Common design systems for the picker
export const commonDesignSystems = [
  {
    id: 'shadcn',
    name: 'shadcn/ui',
    description: 'Use shadcn/ui components with Radix primitives and Tailwind CSS',
  },
  {
    id: 'antd',
    name: 'Ant Design',
    description: 'Use Ant Design component library with its design tokens',
  },
  {
    id: 'mui',
    name: 'Material UI',
    description: 'Use Material UI (MUI) components following Material Design guidelines',
  },
  {
    id: 'chakra',
    name: 'Chakra UI',
    description: 'Use Chakra UI components with its accessible component library',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    description: 'Use Tailwind CSS utility classes for custom styling',
  },
  {
    id: 'bootstrap',
    name: 'Bootstrap',
    description: 'Use Bootstrap components and utility classes',
  },
];

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
