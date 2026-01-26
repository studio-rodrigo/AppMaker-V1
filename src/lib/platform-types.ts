export type PlatformType = 'figma-make' | 'lovable' | 'cursor';

export interface PlatformConfig {
  name: string;
  description: string;
  systemPrompt: string;
}

export interface PromptsConfigFile {
  platforms: Record<PlatformType, PlatformConfig>;
}

