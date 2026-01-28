export type PlatformType = 'v0' | 'figma-make' | 'lovable' | 'cursor' | 'windsurf';

export interface PlatformConfig {
  name: string;
  description: string;
  systemPrompt: string;
}

export interface PromptsConfigFile {
  platforms: Record<PlatformType, PlatformConfig>;
}

