import { NextRequest, NextResponse } from 'next/server';

// Extraction endpoint - extracts structured fields from brain dump text
// Returns JSON with fields, confidence scores, evidence, and follow-up questions

const EXTRACTION_SYSTEM_PROMPT = `You are a product requirements extraction assistant for the "Explore an Idea" workflow. Your job is to help vibe coders (people building apps with AI assistance) turn rough ideas into structured design briefs.

EXTRACTION PHILOSOPHY:
1. Be GENERATIVE for Idea mode - infer reasonable defaults from context
2. Help the user move forward, not block them with missing fields
3. Always provide something useful for journeys, design vibe, and app summary
4. Only flag truly CRITICAL missing info that would block design work

Return a JSON object with this exact structure:
{
  "fields": {
    "featureName": { "value": "App Name", "confidence": 0.0-1.0, "evidence": "quoted text" },
    "appType": { "value": "App category/type (e.g., 'habit tracking app', 'team scheduling tool')", "confidence": 0.0-1.0, "evidence": "quoted text" },
    "appSummary": { "value": "2-3 sentence digestible summary for vibe coders - what it does, who it's for, what makes it special", "confidence": 0.0-1.0, "evidence": "inferred from brain dump" },
    "productCompany": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "problem": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "targetUsers": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "designPrinciple": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "criticalChallenge": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "platform": { "value": "web|mobile|desktop|responsive", "confidence": 0.0-1.0, "evidence": "quoted text or inferred" },
    "designVibe": { "value": "Aesthetic/feel description - ALWAYS provide something based on problem, users, or app type", "confidence": 0.0-1.0, "evidence": "quoted or inferred" },
    "designSystem": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "layoutConstraints": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "journeys": [
      {
        "name": { "value": "Journey name - ALWAYS generate at least 2-3 core journeys", "confidence": 0.0-1.0, "evidence": "text" },
        "when": { "value": "When this happens", "confidence": 0.0-1.0, "evidence": "text" },
        "trigger": { "value": "What triggers this", "confidence": 0.0-1.0, "evidence": "text" },
        "mustCommunicate": { "value": "Key info to show", "confidence": 0.0-1.0, "evidence": "text" },
        "ctas": { "value": "Primary actions", "confidence": 0.0-1.0, "evidence": "text" },
        "tone": { "value": "Emotional tone", "confidence": 0.0-1.0, "evidence": "text" },
        "supportingElements": { "value": "Supporting UI elements", "confidence": 0.0-1.0, "evidence": "text" }
      }
    ],
    "supportingScreens": [
      { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" }
    ]
  },
  "missing": ["ONLY truly critical missing items - things that would block design work"],
  "followUpQuestions": ["1-3 specific questions to improve the brief"],
  "assistantMessage": "A brief, helpful message summarizing what was extracted"
}

CRITICAL RULES FOR IDEA MODE:

1. JOURNEYS - MANDATORY MINIMUM OF 2:
   - You MUST generate AT LEAST 2 user journeys, even for the simplest app
   - If the brain dump describes flows, extract those at HIGH confidence (0.8+)
   - If not explicitly described, INFER journeys from app type - use MEDIUM confidence (0.6-0.7)
   - Every app has at minimum: (1) First-time/Onboarding and (2) Core Action
   - Common patterns to infer: Onboarding, Core Action, Progress/Review, Settings, Search/Browse
   - Example: A "journaling app" MUST include: First Launch, Writing an Entry (and optionally: Viewing Past Entries, Managing Categories)
   - NEVER return an empty journeys array - always provide at least 2

2. DESIGN VIBE - ALWAYS PROVIDE:
   - Infer from: target users, problem space, app type, any adjectives used
   - If a journaling app for busy people mentions "simple" → "Clean, minimal, distraction-free. Quick-entry focused."
   - If a team tool mentions "professional" → "Modern, polished, enterprise-friendly with clear hierarchy"
   - Default to something sensible based on the app category

3. APP SUMMARY - ALWAYS PROVIDE:
   - Create a 2-3 sentence summary that vibe coders can immediately understand
   - Format: What it is + Who it's for + What makes it work
   - Example: "A minimalist journaling app for busy professionals. Focuses on quick daily entries with smart prompts. Designed to make reflection feel effortless, not like homework."

4. MISSING ITEMS - BE CONSERVATIVE:
   - Only list items that truly block design work
   - If you can reasonably infer something, DON'T list it as missing
   - Critical = Can't design screens without it
   - NOT critical = Nice to have but can work around

5. PLATFORM - ALWAYS INFER:
   - If not specified, infer from context or default to "responsive"

CONFIDENCE SCORING:
- 1.0: Explicitly stated
- 0.8-0.9: Clearly implied
- 0.6-0.7: Reasonably inferred (use for generated journeys/vibe)
- 0.5: Educated guess
- Below 0.5: Don't include

Return ONLY valid JSON, no markdown, no explanation outside the JSON`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brainDump, followUpAnswer, existingData, conversationHistory } = body;

    if (!brainDump && !followUpAnswer) {
      return NextResponse.json(
        { error: 'Brain dump text or follow-up answer is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'AI extraction is not configured. Please add OPENAI_API_KEY to your environment variables.',
        },
        { status: 501 }
      );
    }

    // Build the user message
    let userMessage = '';
    
    if (brainDump) {
      userMessage = `BRAIN DUMP TEXT:\n"""\n${brainDump}\n"""`;
    }
    
    if (followUpAnswer) {
      userMessage += `\n\nFOLLOW-UP ANSWER:\n"""\n${followUpAnswer}\n"""`;
    }
    
    if (existingData) {
      userMessage += `\n\nEXISTING EXTRACTED DATA (for context, update if new info contradicts or adds to this):\n${JSON.stringify(existingData, null, 2)}`;
    }

    // Build messages array
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
    ];

    // Add conversation history if this is a follow-up
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    messages.push({ role: 'user', content: userMessage });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to extract fields', details: error },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let extractionResult;
    try {
      extractionResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse extraction response:', content);
      return NextResponse.json(
        { error: 'Failed to parse extraction result' },
        { status: 500 }
      );
    }

    return NextResponse.json(extractionResult);
  } catch (error) {
    console.error('Error in extraction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
