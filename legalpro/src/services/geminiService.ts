/**
 * Gemini Flash AI Service
 * Connects to Google Gemini 2.5 Flash (free tier)
 * Used for: AI Case Analyser + Chatbot
 * 
 * NOTE: For production, move API key to a backend proxy to avoid exposure.
 * For this prototype, the key is embedded (free tier, restricted to this project).
 */

// Use environment variable if available, fallback to embedded key for prototype
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD3_sJd_rjBvZrTMDReE5tAvOlvOo2Ekqs';

// Primary and fallback models
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite'];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function getGeminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message: string };
}

/** Delay helper */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Gemini API with automatic retry + fallback model
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const requestBody = JSON.stringify(body);

  // Try each model with retries
  for (const model of GEMINI_MODELS) {
    const url = getGeminiUrl(model);
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });

        if (response.status === 503 || response.status === 429) {
          // Server overloaded or rate limited — retry after delay
          console.warn(`Gemini ${model} returned ${response.status}, attempt ${attempt}/${MAX_RETRIES}. Retrying...`);
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY_MS * attempt); // Exponential backoff
            continue;
          }
          // Max retries for this model — try next model
          break;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data: GeminiResponse = await response.json();

        if (data.error) {
          throw new Error(`Gemini error: ${data.error.message}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('No response from Gemini');
        }

        return text;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          console.warn(`Gemini ${model} failed after ${MAX_RETRIES} attempts. Trying next model...`);
          break; // Try next model
        }
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error('All Gemini models unavailable after retries. Please try again in a few minutes.');
}

/**
 * Analyze a legal case using Gemini Flash
 * Returns structured JSON matching the AnalysisResult interface
 */
export async function analyzeCase(caseText: string, recommendations?: string): Promise<string> {
  const systemPrompt = `You are an expert Indian legal AI assistant specializing in case analysis. You analyze legal cases under Indian law (IPC, BNS, CrPC, CPC, and various Acts).

When given case details, you MUST respond with ONLY a valid JSON object (no markdown, no code fences, no explanation outside JSON) matching this exact structure:

{
  "caseSummary": {
    "legalIssue": "string - brief description of the legal issue",
    "keyPoints": ["string array - 3-5 key points"],
    "successProbability": number (0-100)
  },
  "relevantCaseLaws": [
    {
      "citation": "Case Name (Year) Volume Reporter Page",
      "court": "Supreme Court / High Court / District Court",
      "practiceArea": "string",
      "citedTimes": number,
      "description": "string - brief relevance",
      "outcome": "Favorable" | "Neutral" | "Unfavorable"
    }
  ],
  "statutoryProvisions": [
    {
      "section": "Section X",
      "act": "Act Name, Year",
      "text": "string - relevant text of the provision",
      "relevance": "Primary" | "Supporting"
    }
  ],
  "caseTypes": ["string array - e.g. Criminal, Civil, Family"],
  "jurisdiction": "string - e.g. India - BNS/IPC",
  "applicableSections": [
    {
      "section": "Section XXX",
      "description": "string - what this section covers",
      "relevance": "High relevance" | "Medium relevance"
    }
  ],
  "requiredDocuments": [
    {
      "id": "doc-1",
      "description": "string - document needed",
      "checked": false
    }
  ],
  "similarCases": [
    {
      "citation": "Party vs Party (Year)",
      "outcome": "Outcome: Conviction/Acquittal/Settlement",
      "badge": "WIN" | "LOSS" | "Partial"
    }
  ],
  "outcomePrediction": {
    "winningPct": number (0-100),
    "losingPct": number (0-100, must sum to 100 with winningPct)
  },
  "keyWinningPoints": ["string array - 3-5 points"],
  "riskFactors": ["string array - 3-5 risks"],
  "strengths": [
    { "title": "string", "description": "string" }
  ],
  "challenges": [
    { "title": "string", "description": "string" }
  ],
  "strategy": [
    { "step": 1, "title": "string", "description": "string" }
  ],
  "expertRecommendation": "string - 2-3 sentence expert recommendation"
}

Rules:
- Provide 2-3 relevant case laws (real Indian cases if possible)
- Provide 2-3 statutory provisions
- Provide 3-4 applicable sections
- Provide 3-4 required documents
- Provide 3 similar cases
- Provide 3-5 winning points and risk factors
- Provide 3-4 strengths and challenges
- Provide 3-4 strategy steps
- All sections must reference actual Indian law (IPC/BNS/CrPC/CPC/specific Acts)
- Be realistic with success probability based on the facts provided
- CRITICAL: ALL case laws, citations, and similar cases MUST be from INDIAN courts ONLY (Supreme Court of India, High Courts of India, District Courts of India, Tribunals in India). Do NOT cite any foreign cases (no US, UK, South Africa, Europe, Australia cases). Only Indian judgments.
- Similar cases must be real Indian cases with proper Indian citation format (e.g., "AIR 2020 SC 1234" or "(2019) 5 SCC 678" or "2021 SCC OnLine SC 123")
- Jurisdiction must always be India-specific (Indian Constitution, IPC/BNS, CrPC/BNSS, CPC, specific Indian Acts)`;

  const userPrompt = `Analyze the following legal case and provide a comprehensive analysis:

CASE DETAILS:
${caseText}

${recommendations ? `USER RECOMMENDATIONS/CONSIDERATIONS:\n${recommendations}` : ''}

Respond with ONLY the JSON object. No markdown formatting, no code fences.`;

  return callGemini(userPrompt, systemPrompt);
}

/**
 * Chat with Gemini as a legal AI assistant
 */
export async function chatWithGemini(
  userMessage: string,
  conversationHistory?: Array<{ role: 'user' | 'bot'; text: string }>
): Promise<string> {
  const systemPrompt = `You are Juryfy AI Assistant — a helpful, knowledgeable Indian legal AI chatbot for lawyers and advocates. You help with:
- Case management queries
- Legal section explanations (IPC, BNS, CrPC, CPC, IT Act, etc.)
- Finding relevant case laws
- Hearing schedules and calendar
- Billing and invoice queries
- FIR information and status
- Legal strategy suggestions
- Compliance and deadline tracking

Rules:
- Be concise but informative (max 200 words per response)
- Use bullet points for lists
- Reference specific Indian legal sections when relevant
- If the user asks about app features, mention relevant pages: /cases, /calendar, /billing, /analyser, /fir, /profiling, /compliance, /reports, /court
- Format links as [Link Text](/path) for navigation
- Be professional but friendly
- If you don't know something specific to the user's data, suggest they check the relevant page
- For legal questions, provide accurate information about Indian law
- Always mention that this is AI-generated advice and they should consult with a qualified advocate for specific legal matters`;

  let prompt = '';

  // Include recent conversation history for context (last 6 messages)
  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-6);
    prompt += 'Recent conversation:\n';
    for (const msg of recent) {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    }
    prompt += '\n';
  }

  prompt += `User: ${userMessage}\n\nRespond as the Juryfy AI Assistant:`;

  return callGemini(prompt, systemPrompt);
}
