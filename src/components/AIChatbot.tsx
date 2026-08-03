import { useState, useRef, useEffect } from 'react';
import { Bot, User, X, Send, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionLinks?: { label: string; url: string; isExternal?: boolean }[];
  isError?: boolean;
}

// Environment API Key with fallback to provided token
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AQ.Ab8RN6JyJXfK-UnIWV4k3G-DD1uVAiQv-WKNA_lXM8L_zzLu9A';

// System prompt & Knowledge Base for Hamza Rehman's Portfolio Assistant
const SYSTEM_INSTRUCTION = `You are Hamza Rehman's official AI Portfolio Assistant on his portfolio website.
Your primary mission is to answer questions about Hamza Rehman, his portfolio, skills, projects, experience, character, education, and contact details in a warm, enthusiastic, friendly, and professional voice.

### CRITICAL SCOPE GUARDRAIL & RULE:
- If the user asks ANY question that is NOT related to Hamza Rehman or his portfolio (such as general knowledge, math calculations, cooking recipes, news, sports, geography, unrelated coding help, jokes, or general trivia), DO NOT answer the question.
- Instead, respond politely and lightheartedly to remind them to stick to the portfolio! Say something friendly like:
  "Hey buddy, you're going a bit off-topic there! 😅 I'm Hamza's AI portfolio assistant, so let's stick to questions about Hamza's work, skills, projects, or how to get in touch with him! What would you like to know about Hamza?"
  (You can vary the phrasing naturally, e.g., "Buddy, you're going out of line! 🚀 Let's stay focused on Hamza's portfolio!")

### PORTFOLIO KNOWLEDGE BASE:
- **Name**: Hamza Rehman
- **Current Role & Bio**: Computer Science Student at Pak-Austria Fachhochschule - Institute of Applied Sciences and Technology (IAST) (2024 - Present). Passionate Full-Stack & 3D Web Developer, AI tools developer, and event manager.
- **University**: Pak-Austria Fachhochschule - Institute of Applied Sciences and Technology (IAST), Haripur, Pakistan.
- **Key Qualities**:
  1. Passionate & Self-Motivated Learner: Constantly exploring cutting-edge tech (AI, 3D graphics, React).
  2. Reliable & Client-Focused: Delivered real client applications like Royale Muscle Gym & Geythere.mv.
  3. Leadership: Event Management Lead at Computer Science Society (PAF-IAST) organizing tech symposiums & code sprints.
  4. Versatile Technical Range: Skilled in Frontend, Backend, AI Automation, Unity Game Dev, and Graphic Design.
- **Skills**:
  - Frontend: React, Next.js, TypeScript, JavaScript, Tailwind CSS, HTML5/CSS3, Shadcn UI
  - 3D & Animations: Three.js, React Three Fiber (R3F), GSAP Animations, Lenis Smooth Scroll
  - Backend & Databases: Node.js, Express, Firebase, RESTful APIs, Database Architecture
  - AI & Automation: AI Portrait & Suit Fitting, Virtual Garment Try-On, AI Presentation Tools
  - Game Development: Unity 2D & 3D, C# Game Physics, Gameplay Systems, Android APK Packaging
  - Design & Tools: Canva Graphic Design, Git & GitHub, Vite, PostCSS
- **Experience**:
  - Event Management Lead @ Computer Science Society, PAF-IAST (2026 - Present): Directing event logistics, tech symposiums, workshops.
  - Freelance Web Developer @ Royale Muscle Factory (Feb 2026): Built full gym management app for owner Taimoor Khan.
  - Front End Dev Intern @ DevelopersHub Corporation (Jul 2025 - Sep 2025): Top performer in virtual front-end development internship.
  - Game Dev Intern @ Teknefy (powered by Robotics-World) (Jul 2025 - Sep 2025): Unity game development (ID: T-GDev-001).
- **Featured Projects**:
  1. **Idea – 3D Interactive World** (Live: https://my-idea-1.netlify.app/): Interactive 3D scroll-driven architectural journey with light trails & rocket launch.
  2. **Geythere.mv** (Live: https://demo-geythere.netlify.app/): Interactive 3D virtual room showcase for a Maldivian home goods brand.
  3. **Royale Muscle Gym App** (Live: https://royale-muscle.netlify.app/): Full-stack gym management web app with member records, payment logs, QR access, & admin dashboard.
  4. **Daan Sports Catalog** (Live: https://daan-sports.vercel.app/): B2B sports apparel catalog website showcasing teamwear.
  5. **The Pillar Marketing** (Live: https://the-pillar-marketing.vercel.app/): Corporate landing page for marketing agency.
  6. **AI Passport & ID Photo Automator**: AI tool that fits portraits into formal suits, swaps backgrounds, and generates print-ready PDFs.
  7. **AI Virtual Brand Try-On**: E-commerce visualization system allowing online customers to try on garments virtually.
- **Contact & Availability**:
  - Location: Haripur, Pakistan
  - Open for: Freelance Projects, Full-Stack & 3D Web Development, AI Tools & Collaborations.
  - Contact Form: Scroll down to #contact on the portfolio page.

Keep answers concise, engaging, and friendly. Use clean markdown styling. Always encourage exploring projects or getting in touch!`;

// Call Gemini REST API with model fallback
async function callGeminiAPI(messages: Message[]): Promise<{ text: string; actionLinks?: { label: string; url: string; isExternal?: boolean }[] }> {
  // Format history for Gemini API
  const historyContents = messages
    .filter((m) => !m.isError)
    .slice(-8)
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: historyContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600
    }
  };

  const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.0-flash-lite'];

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          return processResponseText(responseText);
        }
      }
    } catch (e) {
      console.warn(`Gemini API model ${model} call failed, trying fallback...`, e);
    }
  }

  // Local fallback if API network call fails
  const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text || '';
  return generateLocalFallbackResponse(lastUserMsg);
}

// Extract links or generate smart action chips based on response text
function processResponseText(text: string): { text: string; actionLinks?: { label: string; url: string; isExternal?: boolean }[] } {
  const actionLinks: { label: string; url: string; isExternal?: boolean }[] = [];

  const lower = text.toLowerCase();

  // Detect off-topic responses
  if (lower.includes('off topic') || lower.includes('off-topic') || lower.includes('out of line') || lower.includes('stick to')) {
    actionLinks.push(
      { label: '💡 Who is Hamza?', url: 'who_is_hamza' },
      { label: '⚡ Top Skills', url: 'top_skills' },
      { label: '🚀 View Projects', url: '#works' }
    );
  } else {
    if (lower.includes('project') || lower.includes('built') || lower.includes('idea') || lower.includes('geythere') || lower.includes('royale')) {
      actionLinks.push({ label: '🚀 View Projects Section', url: '#works' });
    }
    if (lower.includes('skill') || lower.includes('tech stack') || lower.includes('react') || lower.includes('3d')) {
      actionLinks.push({ label: '⚡ View Skills Section', url: '#skills' });
    }
    if (lower.includes('contact') || lower.includes('email') || lower.includes('hire') || lower.includes('reach')) {
      actionLinks.push({ label: '📬 Contact Hamza', url: '#contact' });
    }
    if (lower.includes('experience') || lower.includes('education') || lower.includes('intern') || lower.includes('paf-iast')) {
      actionLinks.push({ label: '🎓 View Experience', url: '#experience' });
    }
  }

  return { text, actionLinks: actionLinks.length > 0 ? actionLinks : undefined };
}

// Fallback intelligent response matcher if offline
function generateLocalFallbackResponse(userQuery: string): { text: string; actionLinks?: { label: string; url: string; isExternal?: boolean }[] } {
  const query = userQuery.toLowerCase().trim();

  // Check off-topic query locally if offline
  const portfolioKeywords = ['hamza', 'project', 'skill', 'work', 'experience', 'education', 'contact', 'hire', 'about', 'who', 'built', 'cv', 'background', 'good', 'reliable'];
  const isPortfolioRelated = portfolioKeywords.some((kw) => query.includes(kw)) || query === 'hi' || query === 'hello' || query === 'hey';

  if (!isPortfolioRelated) {
    return {
      text: `Hey buddy, you're going a bit off-topic there! 😅 I'm Hamza's AI portfolio assistant, so let's stick to questions about Hamza's work, skills, projects, or how to get in touch with him! What would you like to know about Hamza?`,
      actionLinks: [
        { label: '💡 Who is Hamza?', url: 'who_is_hamza' },
        { label: '⚡ Top Skills', url: 'top_skills' },
        { label: '🚀 Show Projects', url: '#works' }
      ]
    };
  }

  return {
    text: `👋 **Hamza Rehman** is a Computer Science student at Pak-Austria Fachhochschule - IAST and a Full-Stack & 3D Web Developer.\n\nHe specializes in React, Three.js, Node.js, and AI automation tools. Check out his projects or contact him directly below!`,
    actionLinks: [
      { label: '🚀 View Projects', url: '#works' },
      { label: '📬 Contact Hamza', url: '#contact' }
    ]
  };
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hi! 👋 I'm **Hamza's AI Assistant**, powered by Gemini AI.\n\nAsk me anything about Hamza's skills, projects, experience, or qualities!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionLinks: [
        { label: '💡 Who is Hamza?', url: 'who_is_hamza' },
        { label: '⚡ What are his skills?', url: 'top_skills' },
        { label: '🚀 Show Projects', url: '#works' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setCursorState } = useCursor();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (overrideQuery?: string) => {
    const textToSend = overrideQuery || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!overrideQuery) setInput('');
    setIsTyping(true);

    try {
      let botResponseData: { text: string; actionLinks?: { label: string; url: string; isExternal?: boolean }[] };

      if (overrideQuery === 'who_is_hamza') {
        const queryMsg = { ...userMessage, text: 'Who is Hamza Rehman and what is his background?' };
        botResponseData = await callGeminiAPI([...messages, queryMsg]);
      } else if (overrideQuery === 'top_skills') {
        const queryMsg = { ...userMessage, text: 'What are Hamza Rehman\'s top technical skills and tech stack?' };
        botResponseData = await callGeminiAPI([...messages, queryMsg]);
      } else {
        botResponseData = await callGeminiAPI(updatedMessages);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLinks: botResponseData.actionLinks
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Hey buddy! I had a quick hiccup connecting to my AI server, but I'm right here! Feel free to ask me anything about Hamza's portfolio! 🚀`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLinks: [
          { label: '🚀 View Projects', url: '#works' },
          { label: '📬 Contact Hamza', url: '#contact' }
        ]
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLinkClick = (url: string, isExternal?: boolean) => {
    if (url.startsWith('#')) {
      const target = document.querySelector(url);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (url === 'who_is_hamza' || url === 'top_skills') {
      handleSend(url);
    } else if (isExternal) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setCursorState('interactive')}
          onMouseLeave={() => setCursorState('default')}
          className="group relative flex items-center gap-3 px-5 py-3.5 bg-[#141414]/90 backdrop-blur-xl border border-accent/40 rounded-full shadow-[0_0_25px_rgba(0,212,255,0.25)] hover:shadow-[0_0_35px_rgba(0,212,255,0.45)] hover:border-accent hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-accent animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#141414]" />
          </div>
          <span className="text-caption font-body font-bold text-text-primary group-hover:text-accent transition-colors">
            Ask AI Assistant
          </span>
          <Sparkles className="w-3.5 h-3.5 text-accent/70 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className="w-[92vw] sm:w-[380px] h-[520px] max-h-[82vh] bg-[#141414]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeInScale"
          style={{ animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-black/40 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-accent/10 border border-accent/20">
                <Bot className="w-4 h-4 text-accent" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-black" />
              </div>
              <div>
                <h4 className="text-body font-body font-bold text-text-primary leading-tight flex items-center gap-1.5">
                  Hamza's AI Assistant
                  <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                </h4>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Gemini AI Powered
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'bot',
                      text: `Hi! 👋 I'm **Hamza's AI Assistant**, powered by Gemini AI.\n\nAsk me anything about Hamza's skills, projects, experience, or qualities!`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      actionLinks: [
                        { label: '💡 Who is Hamza?', url: 'who_is_hamza' },
                        { label: '⚡ What are his skills?', url: 'top_skills' },
                        { label: '🚀 Show Projects', url: '#works' }
                      ]
                    }
                  ]);
                }}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                title="Reset Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-body font-body scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className={`w-7 h-7 rounded-lg ${msg.isError ? 'bg-rose-500/10 border-rose-500/30' : 'bg-accent/10 border-accent/20'} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {msg.isError ? <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> : <Bot className="w-3.5 h-3.5 text-accent" />}
                  </div>
                )}

                <div className="flex flex-col max-w-[82%]">
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-accent text-bg-primary font-medium rounded-tr-none'
                        : 'bg-white/[0.04] text-text-primary border border-white/[0.06] rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Action Link Chips */}
                  {msg.actionLinks && msg.actionLinks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.actionLinks.map((link, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLinkClick(link.url, link.isExternal)}
                          onMouseEnter={() => setCursorState('interactive')}
                          onMouseLeave={() => setCursorState('default')}
                          className="px-2.5 py-1 text-[10px] font-semibold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-pill transition-all cursor-pointer flex items-center gap-1"
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`text-[9px] text-text-tertiary mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-text-primary" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-black/30 border-t border-white/[0.04] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              'Who is Hamza?',
              'What are his skills?',
              'Show projects',
              'Is he good to work with?'
            ].map((prompt, i) => (
              <button
                key={i}
                disabled={isTyping}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] text-text-secondary hover:text-text-primary bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-pill transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-black/60 border-t border-white/[0.08] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Hamza's skills, projects..."
              className="flex-1 bg-white/[0.05] text-text-primary text-xs px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-accent/60 placeholder:text-text-tertiary"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              onMouseEnter={() => setCursorState('interactive')}
              onMouseLeave={() => setCursorState('default')}
              className="p-2.5 bg-accent text-bg-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#33DDFF] transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.2)]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
