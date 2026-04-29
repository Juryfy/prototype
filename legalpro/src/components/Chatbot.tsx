import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

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
  'What is Section 420 IPC?',
  'Show my pending invoices',
];

function getBotResponse(input: string): string {
  const q = input.toLowerCase();

  if (q.includes('case') && (q.includes('active') || q.includes('show') || q.includes('list'))) {
    return 'You currently have 6 active cases:\n• CC/2345/2025 — Property Dispute (Delhi HC)\n• CR/789/2025 — Bail Application (District Court)\n• FC/1892/2025 — Divorce Proceedings (Tis Hazari)\n• CP/4567/2025 — Corporate Litigation (NCLT)\n• CC/1234/2025 — Contract Dispute (Delhi HC)\n• IP/901/2025 — Patent Infringement (Delhi HC)\n\nWould you like details on any specific case?';
  }

  if (q.includes('hearing') && (q.includes('today') || q.includes('schedule'))) {
    return 'You have 3 hearings today:\n• 10:30 AM — CC/2345/2025 Property Dispute at Delhi High Court\n• 2:00 PM — CR/789/2025 Bail Application at District Court\n• 3:30 PM — FC/1892/2025 Divorce Petition at Tis Hazari Court\n\nShall I prepare a brief for any of these?';
  }

  if (q.includes('lawyer') || q.includes('advocate') || q.includes('find')) {
    return 'I can help you find lawyers! We have 1000+ advocates in our directory. You can filter by:\n• Location (Delhi, Chennai, Mumbai, etc.)\n• Practice Area (Civil, Criminal, Family, Corporate, IPR, Tax)\n• Court Level\n• Experience\n\nVisit the "Lawyers Near You" page or tell me your specific requirements.';
  }

  if (q.includes('analyze') || q.includes('analyser') || q.includes('analysis')) {
    return 'I can help analyze your case! Go to the Analyser page and:\n1. Enter your case details in the text area\n2. Add any recommendations\n3. Click "Analyze Case"\n\nThe AI will provide:\n• Case type & jurisdiction\n• Applicable legal sections\n• Similar historical cases\n• Outcome prediction (win/loss %)\n• Recommended legal strategy\n\nWould you like me to navigate you there?';
  }

  if (q.includes('section 420') || q.includes('ipc')) {
    return 'Section 420 IPC — Cheating and dishonestly inducing delivery of property:\n\nWhoever cheats and thereby dishonestly induces the person deceived to deliver any property, shall be punished with imprisonment up to 7 years and fine.\n\nKey elements:\n• Deception of the victim\n• Dishonest inducement\n• Delivery of property\n\nThis section is commonly applied in fraud, financial scam, and property dispute cases.';
  }

  if (q.includes('invoice') || q.includes('billing') || q.includes('payment')) {
    return 'Your billing summary:\n• Outstanding Invoices: ₹2.4L (8 pending)\n• Fees Collected (Feb): ₹3,85,000\n• Overdue: INV-2026-038 (TechCorp Ltd, ₹25,000)\n\nWould you like to create a new invoice or view details?';
  }

  if (q.includes('deadline') || q.includes('limitation')) {
    return 'Your upcoming critical deadlines:\n• Appeal Window Closing — CC/890/2025 (6 days left)\n• Written Statement Filing — CC/2345/2025 (11 days left)\n• Vakalatname Renewal — Supreme Court (14 days left)\n\n⚠️ The appeal window is urgent — please take action soon!';
  }

  if (q.includes('client') && (q.includes('list') || q.includes('show') || q.includes('active'))) {
    return 'You have 12 clients in your directory:\n• 8 with active cases\n• 4 with pending payments (₹2,45,000 total)\n• 1 unread message from Rajesh Kumar\n\nWould you like to add a new client or view details?';
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return 'Hello! 👋 I\'m your Juryfy AI assistant. I can help you with:\n• Case management & status\n• Hearing schedules\n• Finding lawyers\n• Legal analysis\n• Billing & invoices\n• Deadlines & compliance\n\nWhat would you like to know?';
  }

  if (q.includes('thank')) {
    return 'You\'re welcome! Let me know if there\'s anything else I can help with. 😊';
  }

  return 'I can help you with case management, hearing schedules, finding lawyers, legal analysis, billing, and more. Could you please be more specific about what you need?\n\nTry asking:\n• "Show my active cases"\n• "What hearings do I have today?"\n• "What is Section 420 IPC?"';
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = getBotResponse(messageText);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
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
                  {msg.text}
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
