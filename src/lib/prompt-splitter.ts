import type { PlatformType } from './platform-types';
import { PLATFORM_LIMITS, getPlatformLimit } from './prompt-limits';

export interface PromptPart {
  partNumber: number;
  totalParts: number;
  content: string;
  charCount: number;
}

/**
 * Split a prompt into multiple parts based on platform limits
 */
export function splitPrompt(prompt: string, platform: PlatformType): PromptPart[] {
  const limit = getPlatformLimit(platform);
  const strategy = PLATFORM_LIMITS[platform]?.splitStrategy || 'sections';
  
  // If prompt is within limit, return as single part
  if (prompt.length <= limit) {
    return [{
      partNumber: 1,
      totalParts: 1,
      content: prompt,
      charCount: prompt.length,
    }];
  }

  // Try to split by strategy
  let parts: string[];
  
  switch (strategy) {
    case 'sections':
      parts = splitBySections(prompt);
      break;
    case 'features':
      parts = splitByFeatures(prompt);
      break;
    case 'phases':
      parts = splitByPhases(prompt);
      break;
    default:
      parts = splitByHeadings(prompt);
  }

  // If splitting didn't help or we got too many small parts, re-merge intelligently
  parts = mergeSmallParts(parts, limit);

  // Add part indicators
  const totalParts = parts.length;
  return parts.map((content, index) => {
    const partNumber = index + 1;
    const partContent = addPartIndicator(content, partNumber, totalParts);
    return {
      partNumber,
      totalParts,
      content: partContent,
      charCount: partContent.length,
    };
  });
}

/**
 * Split by major markdown sections (## headings)
 */
function splitBySections(prompt: string): string[] {
  const sections = prompt.split(/(?=^## )/gm).filter(s => s.trim());
  if (sections.length <= 1) {
    return splitByHeadings(prompt);
  }
  return sections;
}

/**
 * Split by feature blocks (### or #### headings)
 */
function splitByFeatures(prompt: string): string[] {
  // First try to split by ## headings
  const majorSections = prompt.split(/(?=^## )/gm).filter(s => s.trim());
  if (majorSections.length > 1) {
    return majorSections;
  }
  
  // Fall back to ### headings
  const sections = prompt.split(/(?=^### )/gm).filter(s => s.trim());
  if (sections.length <= 1) {
    return splitByParagraphs(prompt);
  }
  return sections;
}

/**
 * Split by implementation phases (for Cursor-style prompts)
 */
function splitByPhases(prompt: string): string[] {
  // Look for phase/step indicators
  const phasePattern = /(?=^(?:##\s*)?(?:Phase|Step|Part|Stage)\s*\d)/gmi;
  const parts = prompt.split(phasePattern).filter(s => s.trim());
  
  if (parts.length <= 1) {
    return splitBySections(prompt);
  }
  return parts;
}

/**
 * Split by any markdown headings
 */
function splitByHeadings(prompt: string): string[] {
  const sections = prompt.split(/(?=^#{1,4}\s)/gm).filter(s => s.trim());
  if (sections.length <= 1) {
    return splitByParagraphs(prompt);
  }
  return sections;
}

/**
 * Split by paragraphs as last resort
 */
function splitByParagraphs(prompt: string): string[] {
  const paragraphs = prompt.split(/\n\n+/).filter(p => p.trim());
  return paragraphs;
}

/**
 * Merge small parts together until they approach the limit
 */
function mergeSmallParts(parts: string[], limit: number): string[] {
  // Reserve space for part indicator (~100 chars)
  const effectiveLimit = limit - 150;
  const merged: string[] = [];
  let currentPart = '';

  for (const part of parts) {
    if (!currentPart) {
      currentPart = part;
    } else if (currentPart.length + part.length + 2 <= effectiveLimit) {
      currentPart += '\n\n' + part;
    } else {
      merged.push(currentPart);
      currentPart = part;
    }
  }

  if (currentPart) {
    merged.push(currentPart);
  }

  // If any part is still over limit, we need to force-split
  return merged.flatMap(part => {
    if (part.length <= effectiveLimit) {
      return [part];
    }
    return forceSplit(part, effectiveLimit);
  });
}

/**
 * Force split a large chunk at sentence boundaries
 */
function forceSplit(text: string, limit: number): string[] {
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > limit) {
    // Find a good break point (sentence end or paragraph break)
    let breakPoint = limit;
    
    // Look for sentence end near the limit
    const nearEnd = remaining.substring(0, limit);
    const lastSentence = nearEnd.lastIndexOf('. ');
    const lastParagraph = nearEnd.lastIndexOf('\n\n');
    const lastNewline = nearEnd.lastIndexOf('\n');
    
    if (lastParagraph > limit * 0.6) {
      breakPoint = lastParagraph;
    } else if (lastSentence > limit * 0.6) {
      breakPoint = lastSentence + 1;
    } else if (lastNewline > limit * 0.6) {
      breakPoint = lastNewline;
    }

    parts.push(remaining.substring(0, breakPoint).trim());
    remaining = remaining.substring(breakPoint).trim();
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}

/**
 * Add part indicator to content
 */
function addPartIndicator(content: string, partNumber: number, totalParts: number): string {
  if (totalParts === 1) {
    return content;
  }

  const header = `---\n**PART ${partNumber} OF ${totalParts}**\n---\n\n`;
  
  let footer = '';
  if (partNumber < totalParts) {
    footer = `\n\n---\n*This is part ${partNumber} of ${totalParts}. After completing this prompt, ask for part ${partNumber + 1}.*`;
  } else {
    footer = `\n\n---\n*This is the final part (${partNumber} of ${totalParts}). Implementation is complete.*`;
  }

  return header + content + footer;
}
