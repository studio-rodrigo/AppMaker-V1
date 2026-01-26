import type { PlatformType } from './platform-types';

// Platform limits - client-side constants (no need to load from YAML on client)
export const PLATFORM_LIMITS: Record<PlatformType, {
  name: string;
  maxChars: number;
  splitStrategy: 'sections' | 'features' | 'phases';
}> = {
  'figma-make': {
    name: 'Figma Make',
    maxChars: 8000,
    splitStrategy: 'sections',
  },
  'lovable': {
    name: 'Lovable',
    maxChars: 15000,
    splitStrategy: 'features',
  },
  'cursor': {
    name: 'Cursor',
    maxChars: 25000,
    splitStrategy: 'phases',
  },
};

export function getPlatformLimit(platform: PlatformType): number {
  return PLATFORM_LIMITS[platform]?.maxChars || 10000;
}

export function isOverLimit(prompt: string, platform: PlatformType): boolean {
  const limit = getPlatformLimit(platform);
  return prompt.length > limit;
}

export function getUsagePercent(prompt: string, platform: PlatformType): number {
  const limit = getPlatformLimit(platform);
  return Math.round((prompt.length / limit) * 100);
}

export function formatCharCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
