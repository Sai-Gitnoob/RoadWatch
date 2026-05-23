import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, Zap, 
  Search, Shield, MessageSquare, Loader2, Plus, Activity, Database
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';

const SUGGESTED_QUERIES = [
  { text: 'Analyze road health in Andheri West', icon: Search },
  { text: 'Predict monsoon waterlogging zones', icon: Zap },
  { text: 'Status of critical pothole repairs', icon: Shield },
  { text: 'Summarize recent citizen feedback', icon: MessageSquare },
];

function ChatBubble({ message }) {
  const isBot = message.role === 'assistant' || message.role === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-standard
        ${isBot ? 'bg-slate-800 text-white' : 'bg-primary text-white'}`}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm transition-standard
        ${isBot ? 'bg-bg-base border border-border-subtle text-text-main rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
        {message.content}
        <div className={`flex items-center gap-2 mt-2 opacity-50 text-[10px] ${isBot ? 'text-text-muted' : 'text-white'}`}>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIAssistantPage() {
  const { chatMessages, addChatMessage, currentUser } = useAppStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState({ lat: 0, lng: 0, city: 'Mumbai' });
  const scrollRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            city: 'Mumbai'
          });
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, loading]);

  const handleSend = async (text = input) => {
    const query = text.trim();
    if (!query || loading) return;

    addChatMessage({ role: 'user', content: query, timestamp: new Date() });
    if (text === input) setInput('');
    setLoading(true);

    try {
      const historyPayload = chatMessages
        .slice(-7)
        .map(m => ({
          role: m.role === 'bot' || m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

      const payload = {
        message: query,
        history: historyPayload,
        user: {
          name: currentUser?.name || "Anonymous",
          email: currentUser?.email || "No Email"
        },
        location: locationData
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("https://psychodiagnostic-isidro-increasingly.ngrok-free.dev/webhook/6983c466-4392-4369-a310-17b8f635bcea", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const replyText = await response.text();
      if (!replyText || !replyText.trim()) {
        throw new Error('Empty response from server');
      }

      addChatMessage({ role: 'assistant', content: replyText, timestamp: new Date() });
    } catch (err) {
      console.error("Chatbot Error:", err);
      addChatMessage({ 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="h-[calc(100vh-6rem)] md:p-6 lg:p-8">
      <div className="flex h-full bg-bg-surface md:rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
        
        {/* Left Sidebar - Workspace Context (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col w-[320px] bg-bg-base border-r border-border-subtle p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-main leading-tight">AI Assistant</h2>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Workspace</p>
            </div>
          </div>

          <div className="space-y-8 flex-1 overflow-y-auto scrollbar-hide">


            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-bold text-text-muted mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Database size={14} className="text-primary"/> Suggested Analyses
              </h3>
              <div className="space-y-2.5">
                {SUGGESTED_QUERIES.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q.text)} 
                    className="w-full text-left p-3.5 rounded-xl bg-bg-surface border border-border-subtle shadow-sm hover:border-primary/40 hover:shadow-md transition-all group flex items-start gap-3">
                    <div className="mt-0.5 text-slate-400 group-hover:text-primary transition-colors">
                      <q.icon size={16} />
                    </div>
                    <span className="text-xs font-semibold text-text-main group-hover:text-primary transition-colors">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative bg-bg-surface">
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 scrollbar-hide pb-40">
            <AnimatePresence mode="wait">
              {chatMessages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
                >
                  <div className="w-16 h-16 rounded-2xl bg-bg-base flex items-center justify-center mb-6 border border-border-subtle shadow-sm">
                    <Sparkles className="text-primary" size={32} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-text-main mb-3 tracking-tight">How can I help you today?</h2>
                  <p className="text-text-muted text-sm font-medium leading-relaxed">
                    I have access to real-time municipal data. I can analyze road conditions, predict infrastructure risks, and summarize citizen reports.
                  </p>
                </motion.div>
              ) : (
                <>
                  {chatMessages.map((m, i) => (
                    <ChatBubble key={i} message={m} />
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-muted animate-pulse pl-14">
                      <Loader2 size={12} className="animate-spin" /> Analyzing Municipal Data...
                    </div>
                  )}
                  <div ref={scrollRef} />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 bg-gradient-to-t from-bg-surface via-bg-surface to-transparent">
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-center bg-bg-surface p-2 rounded-2xl border border-border-subtle shadow-xl shadow-slate-900/10">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-bg-base hover:text-text-main transition-colors">
                  <Plus size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about road conditions, infrastructure, or reports..."
                  className="flex-1 bg-transparent px-4 text-sm font-semibold text-text-main outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[10px] text-text-muted font-medium opacity-70">
                  This app may access your live location while filing complaints for accurate road tracking.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
