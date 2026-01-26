import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import type { PlatformConfig, PlatformType, PromptsConfigFile } from './platform-types';

let cachedConfig: PromptsConfigFile | null = null;

export async function loadPromptsConfig(): Promise<PromptsConfigFile> {
  if (cachedConfig) return cachedConfig;

  const filePath = path.join(process.cwd(), 'src', 'config', 'prompts.yml');
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = yaml.load(raw) as PromptsConfigFile;

  if (!parsed?.platforms) {
    throw new Error('Invalid prompts.yml: missing platforms');
  }

  cachedConfig = parsed;
  return parsed;
}

export async function getPlatformConfig(platform: PlatformType): Promise<PlatformConfig> {
  const config = await loadPromptsConfig();
  const platformConfig = config.platforms?.[platform];
  if (!platformConfig) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return platformConfig;
}

