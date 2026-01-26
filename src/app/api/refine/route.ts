import { NextRequest, NextResponse } from 'next/server';
import { getPlatformConfig } from '@/lib/platform-config';
import type { PlatformType } from '@/lib/platform-types';

// AI refinement endpoint
// This will enhance prompts using an LLM API

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string | undefined = body?.prompt;
    const platform: PlatformType = (body?.platform ?? 'figma-make') as PlatformType;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let systemPrompt: string;
    try {
      const platformConfig = await getPlatformConfig(platform);
      systemPrompt = platformConfig.systemPrompt;
    } catch {
      return NextResponse.json(
        { error: `Unknown platform: ${platform}` },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'AI enhancement is not configured. Please add OPENAI_API_KEY to your environment variables.',
          enhanced: null 
        },
        { status: 501 }
      );
    }

    // Call OpenAI API to enhance the prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `PLATFORM: ${platform}\n\nRAW PROMPT:\n\n${prompt}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'Failed to enhance prompt', details: error },
        { status: 500 }
      );
    }

    const data = await response.json();
    const enhancedPrompt = data.choices[0]?.message?.content;

    return NextResponse.json({
      original: prompt,
      platform,
      enhanced: enhancedPrompt,
      success: true,
    });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
