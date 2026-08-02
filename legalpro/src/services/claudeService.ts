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
const MAX_INPUT_CHARS = 8000; // Limit input for faster processing

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
    max_tokens: 6000,
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
  const systemPrompt = `You are an expert Indian legal AI assistant. Analyze cases under Indian law ONLY.

Respond with ONLY a valid JSON object (no markdown, no code fences) matching this structure:

{
  "caseSummary": { "legalIssue": "string", "keyPoints": ["3-5 strings"], "successProbability": number },
  "relevantCaseLaws": [{ "citation": "Indian case (Year) Reporter", "court": "string", "practiceArea": "string", "citedTimes": number, "description": "string", "outcome": "Favorable"|"Neutral"|"Unfavorable" }],
  "statutoryProvisions": [{ "section": "string", "act": "string", "text": "string", "relevance": "Primary"|"Supporting" }],
  "caseTypes": ["e.g. Criminal Case, Cognizable Offence, Warrant Case"],
  "caseTypeDetails": { "CaseTypeName": { "title": "string", "intro": "string", "rows": [{ "label": "string", "content": "string" }] } },
  "jurisdiction": "string",
  "applicableSections": [{ "section": "string", "description": "string", "relevance": "High relevance"|"Medium relevance", "detail": { "sectionTitle": "string", "oldLaw": "string", "newLaw": "string", "typeOfProvision": "string", "caseApplication": "string", "paragraphs": ["strings"], "ingredients": [{ "name": "string", "explanation": "string" }] } }],
  "requiredDocuments": [{ "id": "doc-N", "description": "string", "checked": false }],
  "similarCases": [{ "citation": "string", "outcome": "string", "badge": "WIN"|"LOSS"|"Partial" }],
  "outcomePrediction": { "winningPct": number, "losingPct": number },
  "keyWinningPoints": ["3-4 strings"],
  "riskFactors": ["3-4 strings"],
  "strengths": [{ "title": "string", "description": "string" }],
  "challenges": [{ "title": "string", "description": "string" }],
  "strategy": [{ "step": number, "title": "string", "description": "string" }],
  "expertRecommendation": "string"
}

RULES: Indian law ONLY. Indian courts ONLY. 2-3 case laws, 2-3 statutes, 3 applicable sections with brief detail objects, caseTypeDetails for each caseType (2-3 rows each), 3 similar cases, 3-4 strategy steps. Keep ALL text values SHORT and concise — max 1-2 sentences each. Detail paragraphs max 2-3 sentences. Max 2 ingredients per section. Your ENTIRE response must fit within 5000 tokens — be brief.`;

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
