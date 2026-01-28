import { NextRequest, NextResponse } from 'next/server';
import { PromptData } from '@/lib/types';

// Types for API suggestions
export interface ApiSuggestion {
  name: string;
  description: string;
  useCase: string;
  pricing: string;
  url: string;
}

export interface ApiCategory {
  category: string;
  reason: string;
  suggestions: ApiSuggestion[];
}

export interface StackPlanResponse {
  categories: ApiCategory[];
  summary: string;
  success: boolean;
}

// Stack planning endpoint - analyzes app concept and suggests APIs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: Partial<PromptData> = body?.data;

    if (!data) {
      return NextResponse.json(
        { error: 'Prompt data is required' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'AI planning is not configured. Please add OPENAI_API_KEY to your environment variables.',
          categories: [],
          success: false
        },
        { status: 501 }
      );
    }

    // Build context from prompt data
    const appContext = buildAppContext(data);

    const systemPrompt = `You are an expert software architect helping developers plan their tech stack.

Analyze the app concept provided and identify what third-party APIs and services the app will likely need.

For EACH category of API needed, provide 2-3 alternative options with:
- name: Service name (e.g., "Stripe")
- description: One-line description of what it does
- useCase: Why this app specifically needs it (be specific to their use case)
- pricing: Brief pricing info (e.g., "Free tier available", "Pay-as-you-go", "Starts at $X/mo")
- url: Official website URL

IMPORTANT:
- Only suggest categories that are actually needed based on the app description
- Be specific about WHY each category is needed based on the app's features
- Include both popular options and newer alternatives
- Focus on third-party APIs, not self-hosted solutions

Respond with valid JSON matching this exact structure:
{
  "categories": [
    {
      "category": "Category Name",
      "reason": "Why this app needs this category of API",
      "suggestions": [
        {
          "name": "Service Name",
          "description": "What it does",
          "useCase": "How this app would use it",
          "pricing": "Pricing info",
          "url": "https://..."
        }
      ]
    }
  ],
  "summary": "A 1-2 sentence overview of the recommended stack"
}`;

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
            content: appContext,
          },
        ],
        temperature: 0.5,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'Failed to plan stack', details: error },
        { status: 500 }
      );
    }

    const responseData = await response.json();
    const content = responseData.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    try {
      const parsed: StackPlanResponse = JSON.parse(content);
      return NextResponse.json({
        ...parsed,
        success: true,
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: content },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error planning stack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Build a readable context string from the prompt data
function buildAppContext(data: Partial<PromptData>): string {
  const lines: string[] = [];

  lines.push('=== APP CONCEPT ===\n');

  if (data.featureName) {
    lines.push(`App Name: ${data.featureName}`);
  }

  if (data.appType) {
    lines.push(`App Type: ${data.appType}`);
  }

  if (data.productCompany) {
    lines.push(`Company/Product: ${data.productCompany}`);
  }

  if (data.appSummary) {
    lines.push(`\nSummary:\n${data.appSummary}`);
  }

  if (data.problem) {
    lines.push(`\nProblem Being Solved:\n${data.problem}`);
  }

  if (data.targetUsers) {
    lines.push(`\nTarget Users:\n${data.targetUsers}`);
  }

  if (data.platform) {
    lines.push(`\nPlatform: ${data.platform}`);
  }

  // Include journeys if they have content
  if (data.journeys && data.journeys.length > 0) {
    const validJourneys = data.journeys.filter(j => j.name?.trim());
    if (validJourneys.length > 0) {
      lines.push('\n=== KEY USER FLOWS ===\n');
      validJourneys.forEach((journey, index) => {
        lines.push(`Flow ${index + 1}: ${journey.name}`);
        if (journey.when) lines.push(`  When: ${journey.when}`);
        if (journey.trigger) lines.push(`  Trigger: ${journey.trigger}`);
        if (journey.mustCommunicate) lines.push(`  Key moment: ${journey.mustCommunicate}`);
      });
    }
  }

  // Include supporting screens
  if (data.supportingScreens && data.supportingScreens.length > 0) {
    const validScreens = data.supportingScreens.filter(s => s?.trim());
    if (validScreens.length > 0) {
      lines.push('\n=== SCREENS/PAGES ===\n');
      validScreens.forEach(screen => lines.push(`- ${screen}`));
    }
  }

  // PRD content if available
  if (data.prdContent || data.prdSummary) {
    lines.push('\n=== ADDITIONAL CONTEXT ===\n');
    if (data.prdSummary) lines.push(data.prdSummary);
    else if (data.prdContent) lines.push(data.prdContent.slice(0, 2000)); // Truncate if too long
  }

  return lines.join('\n');
}
