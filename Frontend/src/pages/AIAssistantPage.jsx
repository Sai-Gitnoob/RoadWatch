import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, Zap,
  Search, Shield, MessageSquare, Loader2, Plus, Activity, Database
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';
import FormattedBotResponse from '../components/ui/FormattedBotResponse';
import { complaintService } from '../services/complaintService';

const SUGGESTED_QUERIES = [
  { text: 'Analyze road health in Andheri West', icon: Search },
  { text: 'Predict monsoon waterlogging zones', icon: Zap },
  { text: 'Status of critical pothole repairs', icon: Shield },
  { text: 'Summarize recent citizen feedback', icon: MessageSquare },
];

function ChatBubble({ message, onSend }) {
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

        {isBot ? (
          <FormattedBotResponse content={message.content} onSuggestionClick={onSend} />
        ) : (
          message.content
        )}

        <div className={`flex items-center gap-2 mt-2 opacity-50 text-[10px] ${isBot ? 'text-text-muted' : 'text-white'}`}>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIAssistantPage() {
  const { chatMessages, addChatMessage, currentUser, token, fetchComplaints } = useAppStore();
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
      const currentHistory = useAppStore.getState().chatMessages;
      const historyPayload = currentHistory
        .slice(-7)
        .map(m => ({
          role: m.role === 'bot' || m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

      let contextPayload = query;
      try {
        const currentComplaints = useAppStore.getState().complaints;
        const matchedLocal = currentComplaints.find(c => query.toLowerCase().includes(c.id.toLowerCase()));

        if (matchedLocal) {
          const freshData = await complaintService.getComplaints(token);
          useAppStore.getState().setComplaints(freshData.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          const freshComplaint = freshData.data.find(c => c.id === matchedLocal.id);

          if (freshComplaint) {
            contextPayload = `${query}\n\n[SYSTEM NOTE: User is inquiring about ticket ${freshComplaint.id}. The live backend status for this ticket is '${freshComplaint.status}'. Provide this exact status to the user.]`;
          }
        }
      } catch (e) {
        console.error("Live status lookup failed:", e);
      }

      const payload = {
        message: contextPayload,
        history: historyPayload,
        user: {
          uid: currentUser?.uid || "Anonymous",
          userId: currentUser?.uid || "Anonymous",
          name: currentUser?.name || "Anonymous",
          username: currentUser?.name || "Anonymous",
          email: currentUser?.email || "No Email"
        },
        location: {
          latitude: locationData.lat,
          longitude: locationData.lng,
          City: 'MUMBAI'
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const webhookUrl = import.meta.env.VITE_AI_WEBHOOK_URL;

      const minimumDelayPromise = new Promise(resolve => setTimeout(resolve, 8000));
      const fetchPromise = fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const [response] = await Promise.all([fetchPromise, minimumDelayPromise]);

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const replyText = await response.text();
      if (!replyText || !replyText.trim()) {
        throw new Error('Empty response from server');
      }

      addChatMessage({ role: 'assistant', content: replyText, timestamp: new Date() });

      // Parse AI complaint details and save to Firebase/backend if filed successfully
      if (replyText.toLowerCase().includes('complaint filed') || replyText.toLowerCase().includes('ticket id')) {
        const lines = replyText.split('\n');
        let ticketId = '';
        let roadName = '';
        let issueType = '';

        for (const line of lines) {
          // Allow optional bullet points or dashes before the key-value pairs
          const match = line.match(/^[-*•]?\s*\**([^:]+):\**\s*(.+)$/);
          if (match) {
            const key = match[1].replace(/\*\*/g, '').trim().toLowerCase();
            const value = match[2].replace(/\*\*/g, '').trim();
            if (key.includes('ticket id') || key === 'ticket_id' || key === 'ticket') {
              ticketId = value;
            } else if (key === 'road' || key === 'road name' || key === 'road_name') {
              roadName = value;
            } else if (key === 'issue' || key === 'issue type' || key === 'issue_type') {
              issueType = value;
            }
          }
        }

        if (ticketId) {
          try {
            await complaintService.createComplaint({
              ticketId: ticketId,
              roadName: roadName || 'Unknown Road',
              description: `AI Assisted Complaint: ${issueType || 'hazard'} reported on ${roadName || 'road'}.`,
              location: roadName ? `${roadName}, Mumbai` : 'Mumbai',
              issueType: issueType || 'Other',
              severity: 'medium',
              status: 'pending',
              source: 'ai',
              lat: locationData.lat,
              lng: locationData.lng,
              city: 'Mumbai'
            }, token);

            // Instantly fetch all updated complaints to reflect on the dashboard
            await fetchComplaints();
          } catch (createErr) {
            console.error("Failed to save AI complaint to database:", createErr);
          }
        }
      }
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
                <Database size={14} className="text-primary" /> Suggested Analyses
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
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 scrollbar-hide pb-55 lg:pb-64">
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
                    <ChatBubble key={i} message={m} onSend={handleSend} />
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
