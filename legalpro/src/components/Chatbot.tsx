import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { chatWithGemini } from '@/services/geminiService';
import firData from '@/data/firRecords.json';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'Show my active cases',
  'What hearings do I have today?',
  'Find a lawyer in Delhi',
  'Analyze my case',
  'Show FIR status',
  'What is BNS Section 305?',
  'Show my pending invoices',
  'Search FIR records',
];

function getBotResponse(input: string): string {
  const q = input.toLowerCase();

  if (q.includes('case') && (q.includes('active') || q.includes('show') || q.includes('list'))) {
    return 'You currently have 6 active cases:\n• CC/2345/2025 — Property Dispute (Delhi HC)\n• CR/789/2025 — Bail Application (District Court)\n• FC/1892/2025 — Divorce Proceedings (Tis Hazari)\n• CP/4567/2025 — Corporate Litigation (NCLT)\n• CC/1234/2025 — Contract Dispute (Delhi HC)\n• IP/901/2025 — Patent Infringement (Delhi HC)\n\n👉 [View All Cases](/cases)\n\nWould you like details on any specific case?';
  }

  if (q.includes('hearing') && (q.includes('today') || q.includes('schedule'))) {
    return 'You have 3 hearings today:\n• 10:30 AM — CC/2345/2025 Property Dispute at Delhi High Court\n• 2:00 PM — CR/789/2025 Bail Application at District Court\n• 3:30 PM — FC/1892/2025 Divorce Petition at Tis Hazari Court\n\n👉 [View Calendar](/calendar)\n\nShall I prepare a brief for any of these?';
  }

  if (q.includes('lawyer') || q.includes('advocate') || q.includes('find')) {
    return 'I can help you find lawyers! We have 1000+ advocates in our directory. You can filter by:\n• Location (Delhi, Chennai, Mumbai, etc.)\n• Practice Area (Civil, Criminal, Family, Corporate, IPR, Tax)\n• Court Level\n• Experience\n\n👉 [Go to Lawyers Near You](/profiling)\n\nOr tell me your specific requirements.';
  }

  if (q.includes('analyze') || q.includes('analyser') || q.includes('analysis')) {
    return 'I can help analyze your case! The AI Analyser provides:\n• Case type & jurisdiction\n• Applicable legal sections\n• Similar historical cases\n• Outcome prediction (win/loss %)\n• Recommended legal strategy\n\n👉 [Open AI Analyser](/analyser)\n\nEnter your case details and click "Analyze Case" to get started.';
  }

  if (q.includes('section 420') || q.includes('ipc')) {
    return 'Section 420 IPC — Cheating and dishonestly inducing delivery of property:\n\nWhoever cheats and thereby dishonestly induces the person deceived to deliver any property, shall be punished with imprisonment up to 7 years and fine.\n\nKey elements:\n• Deception of the victim\n• Dishonest inducement\n• Delivery of property\n\nThis section is commonly applied in fraud, financial scam, and property dispute cases.';
  }

  if (q.includes('invoice') || q.includes('billing') || q.includes('payment')) {
    return 'Your billing summary:\n• Outstanding Invoices: ₹2.4L (8 pending)\n• Fees Collected (Feb): ₹3,85,000\n• Overdue: INV-2026-038 (TechCorp Ltd, ₹25,000)\n\n👉 [Go to Billing](/billing)\n\nWould you like to create a new invoice or view details?';
  }

  if (q.includes('deadline') || q.includes('limitation')) {
    return 'Your upcoming critical deadlines:\n• Appeal Window Closing — CC/890/2025 (6 days left)\n• Written Statement Filing — CC/2345/2025 (11 days left)\n• Vakalatname Renewal — Supreme Court (14 days left)\n\n⚠️ The appeal window is urgent — please take action soon!\n\n👉 [View Calendar](/calendar)';
  }

  if (q.includes('client') && (q.includes('list') || q.includes('show') || q.includes('active'))) {
    return 'You have 12 clients in your directory:\n• 8 with active cases\n• 4 with pending payments (₹2,45,000 total)\n• 1 unread message from Rajesh Kumar\n\n👉 [View All Clients](/clients)\n\nWould you like to add a new client or view details?';
  }

  // ── Crime-type specific FIR queries ──
  const crimeKeywords: { keywords: string[]; sections: string[]; label: string }[] = [
    { keywords: ['cheat', 'cheating', 'fraud', 'scam', 'defraud'], sections: ['305', '310'], label: 'Cheating/Fraud' },
    { keywords: ['theft', 'steal', 'stolen', 'stole'], sections: ['115'], label: 'Theft' },
    { keywords: ['robbery', 'rob', 'snatch', 'loot', 'dacoity'], sections: ['392', '394'], label: 'Robbery/Dacoity' },
    { keywords: ['assault', 'hurt', 'attack', 'beat', 'violence'], sections: ['301', '303'], label: 'Assault/Hurt' },
    { keywords: ['harassment', 'intimidat', 'threaten', 'stalk', 'abuse'], sections: ['109', '113'], label: 'Harassment/Intimidation' },
    { keywords: ['breach of trust', 'misappropriat', 'embezzle'], sections: ['318', '320', '322'], label: 'Criminal Breach of Trust' },
    { keywords: ['cyber', 'online', 'digital', 'hacking', 'otp'], sections: ['305', '310', '318', '320'], label: 'Cyber Crime' },
  ];

  for (const crime of crimeKeywords) {
    if (crime.keywords.some((kw) => q.includes(kw))) {
      const matchingFIRs = (firData as { id: string; caseNumber: string; city: string; policeStation: string; status: string; sections: string; complainant: string; accused: string; complaint: string }[])
        .filter((fir) => crime.sections.some((sec) => fir.sections.includes(sec)));
      const total = matchingFIRs.length;
      const registered = matchingFIRs.filter((f) => f.status === 'Registered').length;
      const pending = matchingFIRs.filter((f) => f.status === 'Pending').length;
      const closed = matchingFIRs.filter((f) => f.status === 'Closed').length;
      const sample = matchingFIRs.slice(0, 5);

      let response = `Found ${total} ${crime.label} cases in the FIR Intelligence Hub:\n\n📊 Status Breakdown:\n• Registered: ${registered}\n• Pending: ${pending}\n• Closed: ${closed}\n\n📋 Recent Records:\n`;
      response += sample.map((f) => `• Case ${f.caseNumber} — ${f.city} (${f.policeStation}) [${f.status}]\n  Sections: ${f.sections} | Accused: ${f.accused}`).join('\n');
      response += `\n\n👉 [View All in FIR Intelligence Hub](/fir)`;
      return response;
    }
  }

  if (q.includes('fir') && (q.includes('status') || q.includes('check') || q.includes('track'))) {
    return 'Here\'s a summary of FIR statuses in the Intelligence Hub:\n• Registered: 340 FIRs\n• Pending: 330 FIRs\n• Closed: 330 FIRs\n\nYou can search by case number, police station, city, or area.\n\n👉 [Open FIR Intelligence Hub](/fir)\n\nWould you like me to help you find a specific FIR?';
  }

  if (q.includes('fir') && (q.includes('search') || q.includes('find') || q.includes('lookup') || q.includes('number'))) {
    return 'To search for a specific FIR in the Intelligence Hub:\n1. Use the search bar to find by case number, complainant name, or police station\n2. Filter by City, Area, or Status\n\nYou can view full FIR details including:\n• Complainant information\n• Accused details\n• Investigating officer\n• Sections applied\n• Action taken\n\n👉 [Search FIR Records](/fir)\n\nWhat FIR details are you looking for?';
  }

  if (q.includes('fir') && (q.includes('register') || q.includes('file') || q.includes('lodge') || q.includes('new'))) {
    return 'To file/register a new FIR:\n1. Visit the nearest police station with jurisdiction\n2. Provide a written complaint with details of the incident\n3. The officer will register the FIR under applicable BNS sections\n\nCommon BNS sections:\n• BNS 115(2) — Theft\n• BNS 305, 310 — Fraud/Cheating\n• BNS 318, 320 — Criminal breach of trust\n• BNS 392, 394 — Robbery/Dacoity\n• BNS 109, 113 — Criminal intimidation\n\n👉 [View FIR Intelligence Hub](/fir)';
  }

  if (q.includes('fir') || q.includes('intelligence hub') || q.includes('police station') || q.includes('police report')) {
    return 'The FIR Intelligence Hub provides:\n• 1000+ FIR records across India\n• Real-time status tracking (Registered/Pending/Closed)\n• Search by case number, police station, city, or area\n• Detailed FIR information including complainant, accused, sections, and action taken\n• Filter by city, area name, and status\n\nCities covered: Mumbai, Delhi, Chennai, Bengaluru, Hyderabad, Kolkata, Jaipur, and 20+ more.\n\n👉 [Open FIR Intelligence Hub](/fir)';
  }

  if (q.includes('bns') || q.includes('bharatiya nyaya') || q.includes('section')) {
    return 'Common BNS (Bharatiya Nyaya Sanhita) sections in FIR records:\n\n• BNS 115(2) — Voluntarily causing hurt / Theft\n• BNS 109, 113 — Criminal intimidation & harassment\n• BNS 301, 303 — Causing hurt by dangerous means\n• BNS 305, 310 — Cheating and fraud\n• BNS 318, 320 — Criminal breach of trust\n• BNS 320, 322 — Dishonest misappropriation\n• BNS 392, 394 — Robbery and dacoity\n\nThe BNS replaced the Indian Penal Code (IPC) from July 2024. Would you like details on any specific section?';
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return 'Hello! 👋 I\'m your Juryfy AI assistant. I can help you with:\n• [Cases](/cases) — Case management & status\n• [Calendar](/calendar) — Hearing schedules\n• [Lawyers Near You](/profiling) — Find lawyers\n• [AI Analyser](/analyser) — Legal analysis\n• [Billing](/billing) — Invoices & payments\n• [Compliance](/compliance) — Deadlines & compliance\n• [FIR Intelligence Hub](/fir) — FIR records\n\nWhat would you like to know?';
  }

  if (q.includes('thank')) {
    return 'You\'re welcome! Let me know if there\'s anything else I can help with. 😊';
  }

  if (q.includes('dashboard') || q.includes('home') || q.includes('overview')) {
    return 'Your dashboard shows a complete overview of your practice:\n• Active cases & upcoming hearings\n• Revenue & billing summary\n• Tasks & deadlines\n• Recent activity\n\n👉 [Go to Dashboard](/dashboard)';
  }

  if (q.includes('compliance') || q.includes('regulation')) {
    return 'The Compliance module helps you track:\n• Regulatory requirements\n• Filing deadlines\n• Document renewals\n• Bar council compliance\n\n👉 [View Compliance](/compliance)';
  }

  if (q.includes('report') || q.includes('analytics')) {
    return 'The Reports page provides analytics on:\n• Case outcomes & win rates\n• Revenue trends\n• Client acquisition\n• Practice area performance\n\n👉 [View Reports](/reports)';
  }

  if (q.includes('court') || q.includes('courtroom')) {
    return 'The Court module provides:\n• Court schedules & listings\n• Bench information\n• Court-specific procedures\n• Filing requirements\n\n👉 [View Court Info](/court)';
  }

  if (q.includes('setting') || q.includes('profile') || q.includes('account')) {
    return 'You can manage your account settings including:\n• Profile information\n• Notification preferences\n• Security settings\n• Display preferences\n\n👉 [Go to Settings](/settings)';
  }

  return 'I can help you with case management, hearing schedules, finding lawyers, legal analysis, billing, FIR Intelligence Hub, and more.\n\nQuick links:\n• [Cases](/cases) • [Calendar](/calendar) • [Billing](/billing)\n• [FIR Hub](/fir) • [Analyser](/analyser) • [Lawyers](/profiling)\n\nTry asking:\n• "Show my active cases"\n• "What hearings do I have today?"\n• "Show FIR status"\n• "Get all cheating cases"';
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Hi! 👋 I\'m your Juryfy AI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Render message text with clickable links: [text](/path)
  const renderMessageText = useCallback((text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | { text: string; path: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push({ text: match[1], path: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.map((part, i) => {
      if (typeof part === 'string') {
        return <span key={i}>{part}</span>;
      }
      return (
        <a
          key={i}
          href={part.path}
          onClick={(e) => {
            e.preventDefault();
            navigate(part.path);
            setIsOpen(false);
          }}
          className="text-accent-primary hover:text-accent-hover underline underline-offset-2 font-medium transition-colors"
        >
          {part.text}
        </a>
      );
    });
  }, [navigate]);

  function handleSend(text?: string) {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Build conversation history for context
    const history = [...messages, userMsg].map((m) => ({
      role: m.role === 'bot' ? 'bot' as const : 'user' as const,
      text: m.text,
    }));

    // Call Gemini AI
    chatWithGemini(messageText, history)
      .then((response) => {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      })
      .catch((error) => {
        console.error('Gemini chat error:', error);
        // Try local fallback first, if no match show AI unavailable message
        const localResponse = getBotResponse(messageText);
        const isGenericFallback = localResponse.includes('I can help you with case management');
        
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: isGenericFallback
            ? `⚠️ AI is temporarily unavailable (high demand). Please try again in a moment.\n\nIn the meantime, I can help with basic queries like:\n• "Show my active cases"\n• "What hearings do I have today?"\n• "What is Section 420 IPC?"\n• "Show FIR status"`
            : localResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-danger hover:bg-danger/80 rotate-0'
            : 'bg-accent-primary hover:bg-accent-hover scale-100 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] glass-card flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
            <div className="w-9 h-9 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Juryfy AI Assistant</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-accent-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-accent-primary text-white rounded-br-md'
                      : 'bg-bg-elevated text-text-primary rounded-bl-md'
                  }`}
                >
                  {msg.role === 'bot' ? renderMessageText(msg.text) : msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-text-secondary" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-accent-primary" />
                </div>
                <div className="bg-bg-elevated px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (show only when few messages) */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 rounded-full bg-bg-elevated text-text-secondary text-xs hover:bg-accent-primary/20 hover:text-accent-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
