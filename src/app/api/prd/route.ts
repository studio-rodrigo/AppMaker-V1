import { NextRequest, NextResponse } from 'next/server';

// PRD Generation endpoint - generates a Product Requirements Document from form fields

const PRD_SYSTEM_PROMPT = `You are a senior product manager. Generate a professional Product Requirements Document (PRD) based on the provided project information.

OUTPUT FORMAT:
Generate a well-structured markdown PRD with these sections:

# Product Requirements Document: [Feature Name]

## Overview
Brief 2-3 sentence summary of what this feature/product is.

## Problem Statement
Clear articulation of the problem being solved, using the provided information.

## Goals
### Primary Goals
- Bullet list of main objectives

### Non-Goals (Out of Scope)
- What this project will NOT address

## Target Users
Describe the target users including:
- User role/persona
- Context of use
- Frequency of use
- Device/platform

## User Journeys

For each journey provided:
### Journey: [Name]
**Trigger:** When/how this journey starts
**User Goal:** What the user wants to accomplish
**Steps:**
1. Step-by-step flow
2. ...

**Success Criteria:** How we know the journey succeeded

## Requirements

### Functional Requirements
- FR1: [Requirement based on journeys and context]
- FR2: ...

### Non-Functional Requirements
- Performance: ...
- Accessibility: WCAG AA compliance required
- Platform: [web/mobile/desktop as specified]

## UI/UX Requirements
- Design System: [if specified]
- Layout Constraints: [if specified]
- Required States: [list states]

## Edge Cases & Error Handling
Based on critical challenges mentioned, list edge cases to handle.

## Success Metrics
How will we measure if this feature is successful?
- Metric 1
- Metric 2

## Open Questions
List any ambiguities or decisions that need to be made.

---

RULES:
1. Use the provided information directly - do not invent features or requirements not implied by the input
2. If information is missing, add a placeholder like "[TBD - needs clarification]"
3. Keep the PRD concise but complete
4. Focus on WHAT, not HOW (implementation details)
5. Make it actionable for engineering and design teams`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptData } = body;

    if (!promptData) {
      return NextResponse.json(
        { error: 'Prompt data is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'AI PRD generation is not configured. Please add OPENAI_API_KEY to your environment variables.',
        },
        { status: 501 }
      );
    }

    // Build user message with all available data
    const userMessage = `Generate a PRD based on this project information:

FEATURE NAME: ${promptData.featureName || '[Not specified]'}
PRODUCT/COMPANY: ${promptData.productCompany || '[Not specified]'}

PROBLEM:
${promptData.problem || '[Not specified]'}

TARGET USERS:
${promptData.targetUsers || '[Not specified]'}

DESIGN PRINCIPLE (North Star):
${promptData.designPrinciple || '[Not specified]'}

CRITICAL CHALLENGE:
${promptData.criticalChallenge || '[Not specified]'}

USER JOURNEYS:
${promptData.journeys?.map((j: { name: string; when: string; trigger: string; mustCommunicate: string; ctas: string; tone: string; supportingElements: string }, i: number) => `
Journey ${i + 1}: ${j.name || '[Unnamed]'}
- When: ${j.when || '[Not specified]'}
- Trigger: ${j.trigger || '[Not specified]'}
- Must Communicate: ${j.mustCommunicate || '[Not specified]'}
- CTAs: ${j.ctas || '[Not specified]'}
- Tone: ${j.tone || '[Not specified]'}
- Supporting Elements: ${j.supportingElements || '[Not specified]'}
`).join('\n') || '[No journeys defined]'}

SUPPORTING SCREENS:
${promptData.supportingScreens?.filter((s: string) => s?.trim()).join(', ') || '[None specified]'}

UI REQUIREMENTS:
- Platform: ${promptData.platform || '[Not specified]'}
- Design System: ${promptData.designSystem || '[Not specified]'}
- Layout Constraints: ${promptData.layoutConstraints || '[Not specified]'}
- States Needed: ${promptData.statesNeeded?.join(', ') || '[Not specified]'}

Generate a complete, professional PRD document.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: PRD_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate PRD', details: error },
        { status: 500 }
      );
    }

    const data = await response.json();
    const prdContent = data.choices[0]?.message?.content;

    if (!prdContent) {
      return NextResponse.json(
        { error: 'No PRD generated' },
        { status: 500 }
      );
    }

    // Generate a summary (first paragraph or first 2 sentences)
    const summaryMatch = prdContent.match(/## Overview\n+([^\n]+(?:\n[^\n#]+)?)/);
    const prdSummary = summaryMatch ? summaryMatch[1].trim() : '';

    return NextResponse.json({
      prdContent,
      prdSummary,
      success: true,
    });
  } catch (error) {
    console.error('Error generating PRD:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
