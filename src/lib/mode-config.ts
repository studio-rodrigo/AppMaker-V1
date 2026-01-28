import { ModeConfig, WorkflowMode } from './types';

export const modeConfigs: Record<WorkflowMode, ModeConfig> = {
  idea: {
    id: 'idea',
    name: 'Explore an Idea',
    description: 'Brain dump first, discover as you go',
    primarySections: ['brain-dump', 'quick-context', 'design-vibe'],
    secondarySections: ['simple-journeys', 'follow-up'],
    hiddenSections: ['full-context', 'ui-requirements'],
    sectionOrder: ['brain-dump', 'follow-up', 'quick-context', 'design-vibe', 'simple-journeys'],
    designSystemStyle: 'vibe',
  },
  product: {
    id: 'product',
    name: 'Build a Product',
    description: 'Structured fields, pick a design system',
    primarySections: ['project-context', 'design-system', 'journeys', 'ui-requirements'],
    secondarySections: ['brain-dump', 'prd-generator'],
    hiddenSections: ['stakeholders'],
    sectionOrder: ['project-context', 'design-system', 'journeys', 'ui-requirements', 'brain-dump', 'prd-generator'],
    designSystemStyle: 'picker',
  },
  team: {
    id: 'team',
    name: 'Team Project',
    description: 'PRD-first, existing product context',
    primarySections: ['prd', 'team-context', 'design-system', 'feature-journey', 'ui-requirements'],
    secondarySections: ['brain-dump'],
    hiddenSections: [],
    sectionOrder: ['prd', 'team-context', 'design-system', 'feature-journey', 'ui-requirements', 'brain-dump'],
    designSystemStyle: 'locked',
  },
};

// Re-export commonDesignSystems from types for backward compatibility
export { commonDesignSystems } from './types';

export const getModeConfig = (mode: WorkflowMode): ModeConfig => {
  return modeConfigs[mode];
};

export const isSectionVisible = (
  mode: WorkflowMode,
  sectionId: string,
  showHidden: boolean = false
): boolean => {
  const config = modeConfigs[mode];
  if (config.primarySections.includes(sectionId)) return true;
  if (config.secondarySections.includes(sectionId)) return true;
  if (showHidden && config.hiddenSections.includes(sectionId)) return true;
  return false;
};

export const isSectionPrimary = (mode: WorkflowMode, sectionId: string): boolean => {
  return modeConfigs[mode].primarySections.includes(sectionId);
};

export const isSectionSecondary = (mode: WorkflowMode, sectionId: string): boolean => {
  return modeConfigs[mode].secondarySections.includes(sectionId);
};
