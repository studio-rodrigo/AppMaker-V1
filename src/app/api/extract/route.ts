import { NextRequest, NextResponse } from 'next/server';

// Extraction endpoint - extracts structured fields from brain dump text
// Returns JSON with fields, confidence scores, evidence, and follow-up questions

const EXTRACTION_SYSTEM_PROMPT = `You are a product requirements extraction assistant. Your job is to extract structured information from a user's brain dump text about their project.

CRITICAL RULES:
1. Only extract information that is EXPLICITLY stated or STRONGLY implied in the brain dump
2. Do NOT invent, assume, or hallucinate any information
3. If information is not present, leave that field empty or null
4. Provide confidence scores based on how clearly the information was stated
5. Quote evidence directly from the brain dump text

Return a JSON object with this exact structure:
{
  "fields": {
    "featureName": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "productCompany": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "problem": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "targetUsers": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "designPrinciple": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "criticalChallenge": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "platform": { "value": "web|mobile|desktop|responsive or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "designSystem": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "layoutConstraints": { "value": "string or empty", "confidence": 0.0-1.0, "evidence": "quoted text or empty" },
    "journeys": [
      {
        "name": { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" },
        "when": { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" },
        "trigger": { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" },
        "mustCommunicate": { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" },
        "ctas": { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" },
        "tone": { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" },
        "supportingElements": { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" }
      }
    ],
    "supportingScreens": [
      { "value": "string", "confidence": 0.0-1.0, "evidence": "quoted text" }
    ]
  },
  "missing": ["list of important fields that could not be extracted"],
  "followUpQuestions": ["1-3 specific questions to fill the most critical gaps"],
  "assistantMessage": "A brief, helpful message summarizing what was extracted"
}

CONFIDENCE SCORING:
- 1.0: Explicitly and clearly stated
- 0.8-0.9: Clearly implied with strong context
- 0.6-0.7: Reasonably implied but needs confirmation
- 0.4-0.5: Weakly implied, user should verify
- Below 0.4: Do not extract, too uncertain

IMPORTANT:
- Keep extracted values concise and structured
- For "problem", synthesize into 2-3 clear sentences
- For "targetUsers", include role, context, frequency, device if mentioned
- For "designPrinciple", identify the core UX north star if mentioned
- For journeys, only create entries for distinct user flows that were described
- Return ONLY valid JSON, no markdown, no explanation outside the JSON`;

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
