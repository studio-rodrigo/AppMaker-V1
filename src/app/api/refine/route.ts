import { NextRequest, NextResponse } from 'next/server';

// AI refinement endpoint
// This will enhance prompts using an LLM API

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
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
            content: `You are an expert UX designer and prompt engineer. Your task is to enhance Figma Make prompts to be more effective and complete.

When enhancing a prompt:
1. Make descriptions more specific and actionable
2. Add missing details that would help Figma Make generate better designs
3. Ensure the tone is consistent throughout
4. Keep the same structure and format
5. Don't add content that contradicts what the user provided
6. Focus on clarity and completeness

Return ONLY the enhanced prompt, maintaining the exact same markdown format.`,
          },
          {
            role: 'user',
            content: `Please enhance this Figma Make prompt to be more specific, complete, and effective:\n\n${prompt}`,
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
