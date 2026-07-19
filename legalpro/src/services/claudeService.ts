/**
 * Claude AI Service
 * Connects to Anthropic Claude API
 * Used for: AI Case Analyser + Chatbot
 * 
 * NOTE: For production, move API key to a backend proxy to avoid exposure.
 * API key is stored in environment variable VITE_CLAUDE_API_KEY.
 */

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-6';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;
const MAX_INPUT_CHARS = 12000; // Limit input to ~3000 words for faster processing

interface ClaudeResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { type: string; message: string };
}

/** Delay helper */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Claude API with automatic retry
 */
async function callClaude(prompt: string, systemInstruction?: string): Promise<string> {
  if (!CLAUDE_API_KEY) {
    throw new Error('VITE_CLAUDE_API_KEY is not set. Add it to your .env file.');
  }

  const body: Record<string, unknown> = {
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  };

  if (systemInstruction) {
    body.system = systemInstruction;
  }

  const requestBody = JSON.stringify(body);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: requestBody,
      });

      if (response.status === 529 || response.status === 429 || response.status === 503) {
        // Overloaded or rate limited — retry
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS * attempt);
          continue;
        }
        throw new Error(`Claude API overloaded after ${MAX_RETRIES} retries.`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error (${response.status}): ${errorText}`);
      }

      const data: ClaudeResponse = await response.json();

      if (data.error) {
        throw new Error(`Claude error: ${data.error.message}`);
      }

      const text = data.content?.find(c => c.type === 'text')?.text;
      if (!text) {
        throw new Error('No response from Claude');
      }

      return text;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      await delay(RETRY_DELAY_MS * attempt);
    }
  }

  throw new Error('Claude API unavailable after retries. Please try again.');
}

/**
 * Analyze a legal case using Claude
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
- CRITICAL: ALL case laws, citations, and similar cases MUST be from INDIAN courts ONLY. Do NOT cite any foreign cases.
- Similar cases must be real Indian cases with proper Indian citation format
- Jurisdiction must always be India-specific

HARD CONSTRAINTS — YOU MUST NEVER VIOLATE THESE:
1. INDIAN LAW ONLY: You operate exclusively within the Indian legal system. Never reference, cite, or apply laws from any other country (USA, UK, Australia, Canada, South Africa, or any other jurisdiction). If the user presents a case from another country, still analyze it under Indian law equivalents.
2. INDIAN COURTS ONLY: All case citations must be from Indian courts — Supreme Court of India, High Courts of India (Bombay, Delhi, Madras, Calcutta, etc.), District Courts, Tribunals (NCLT, NCLAT, ITAT, NGT, SAT, etc.). Citation formats: "(2020) 5 SCC 123", "AIR 2019 SC 456", "2021 SCC OnLine Bom 789".
3. INDIAN STATUTES ONLY: Reference only Indian legislation — IPC/BNS, CrPC/BNSS, CPC, Indian Evidence Act/BSA, Constitution of India, Specific Relief Act, Transfer of Property Act, Indian Contract Act, Companies Act 2013, IT Act 2000, POCSO Act, Negotiable Instruments Act, etc.
4. NO HALLUCINATION: If you are unsure about a case citation, mark it clearly. Do not invent fake case names. Prefer well-known landmark Indian cases.
5. DETERMINISTIC OUTPUT: Always produce consistent, structured, factual analysis. Avoid speculation. Base success probability on the strength of evidence and applicable precedents described in the case facts.
6. REJECT NON-LEGAL QUERIES: If the input is not a legal case or legal matter, respond with a JSON where caseSummary.legalIssue says "The provided text does not appear to contain a legal case. Please provide details of a legal dispute, case, or matter for analysis." and set successProbability to 0.`;

  // Truncate long inputs for faster processing
  const truncatedText = caseText.length > MAX_INPUT_CHARS
    ? caseText.substring(0, MAX_INPUT_CHARS) + '\n\n[Document truncated for analysis — first ~3000 words used]'
    : caseText;

  const userPrompt = `Analyze the following legal case STRICTLY under Indian law. Provide a comprehensive analysis with ONLY Indian case laws, Indian statutes, and Indian court references:

CASE DETAILS:
${truncatedText}

${recommendations ? `USER RECOMMENDATIONS/CONSIDERATIONS:\n${recommendations}` : ''}

Respond with ONLY the JSON object. No markdown formatting, no code fences. All citations must be Indian courts only.`;

  return callClaude(userPrompt, systemPrompt);
}

/**
 * Chat with Claude as a legal AI assistant
 */
export async function chatWithClaude(
  userMessage: string,
  conversationHistory?: Array<{ role: 'user' | 'bot'; text: string }>
): Promise<string> {
  const systemPrompt = `You are Juryfy AI Assistant — an expert Indian legal AI chatbot EXCLUSIVELY for Indian law. You assist lawyers, advocates, and legal professionals in India.

HARD CONSTRAINT: You ONLY provide information about INDIAN LAW. You must NEVER reference or apply laws from USA, UK, or any other country. All your responses must be grounded in:
- Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita (BNS)
- Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS)
- Code of Civil Procedure (CPC)
- Indian Evidence Act / Bharatiya Sakshya Adhiniyam (BSA)
- Constitution of India
- Other Indian Acts (IT Act, Companies Act, POCSO, NI Act, etc.)
- Indian court judgments only (Supreme Court, High Courts, Tribunals)

You help with:
- Case management queries
- Legal section explanations (IPC, BNS, CrPC, CPC, IT Act, etc.)
- Finding relevant Indian case laws
- Hearing schedules and calendar
- Billing and invoice queries
- FIR information and status
- Legal strategy suggestions under Indian law
- Compliance and deadline tracking

Rules:
- Be concise but informative (max 200 words per response)
- Use bullet points for lists
- Reference specific Indian legal sections when relevant
- For navigation links, use ONLY these exact valid paths:
  /app/dashboard — Dashboard
  /app/cases — Cases
  /app/clients — Clients
  /app/calendar — Calendar
  /app/analyser — AI Analyser
  /app/billing — Billing
  /app/compliance — Compliance
  /app/reports — Reports
  /app/fir — AI FIR Hub
  /app/profiling — AI Profiling
  /app/court — Court
  /app/settings — Settings
  /app/home — Find Lawyers Near You
- Format links as [Link Text](/app/path) — NEVER use any other paths
- Do NOT generate links like /cases, /calendar, /billing without the /app/ prefix
- Be professional but friendly
- If you don't know something specific to the user's data, suggest they check the relevant page
- For legal questions, provide accurate information about INDIAN LAW ONLY
- Always mention that this is AI-generated advice and they should consult with a qualified Indian advocate
- If asked about foreign law, politely state that you only cover Indian law and suggest they consult a specialist`;

  let prompt = '';

  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-6);
    prompt += 'Recent conversation:\n';
    for (const msg of recent) {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    }
    prompt += '\n';
  }

  prompt += `User: ${userMessage}\n\nRespond as the Juryfy AI Assistant:`;

  return callClaude(prompt, systemPrompt);
}
