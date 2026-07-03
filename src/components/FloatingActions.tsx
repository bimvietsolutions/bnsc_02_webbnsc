import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Facebook, 
  Youtube, 
  MessageSquare, 
  Sparkles, 
  Send, 
  X, 
  Cpu, 
  User, 
  CornerDownLeft,
  Loader2,
  Trash2
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface FloatingActionsProps {
  onStartTechnicalSupport?: () => void;
}

const ZaloIcon = () => (
  <span className="font-extrabold text-[12px] tracking-tight leading-none select-none">Zalo</span>
);

export default function FloatingActions({ onStartTechnicalSupport }: FloatingActionsProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const initialMessage = 'Xin chào quý khách! Tôi là Trợ lý AI của **Bắc Nam Software (BNSC)**. Chúc quý khách một ngày thành công và nhiều niềm vui.\n\nTôi có thể hỗ trợ quý khách về bộ cài phần mềm Dự toán BNSC mới nhất, khóa học đo bóc khối lượng - định giá xây dựng, hoặc các giải giải đáp văn bản thông tư nhà nước. Quý khách đang quan tâm nội dung nào ạ?';

  const suggestChips = [
    "Tải phần mềm Dự toán BNSC dùng thử",
    "Khóa học Dự toán & Lập hồ sơ thầu",
    "Thông tư 08/2025/TT-BXD có gì mới?",
    "Gặp nhân viên kỹ thuật (vChat)"
  ];

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatOpen, history, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    // Detect technical support navigation keywords
    const lowerText = textToSend.toLowerCase();
    if (lowerText.includes('kỹ thuật') || lowerText.includes('gặp nhân viên') || lowerText.includes('vchat') || lowerText.includes('chat với kỹ')) {
      setChatOpen(false);
      onStartTechnicalSupport?.();
      return;
    }

    if (!customText) {
      setInput('');
    }

    const newUserMessage: Message = { role: 'user', text: textToSend };
    const updatedHistory = [...history, newUserMessage];
    setHistory(updatedHistory);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error('Mạng không ổn định. Không thể kết nối với AI BNSC.');
      }

      const data = await response.json();
      setHistory(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (error: any) {
      setHistory(prev => [...prev, { 
        role: 'model', 
        text: '⚠️ **Hệ thống AI bận:** Kết nối mạng bị gián đoạn. Anh/chị vui lòng liên hệ ngay hỗ trợ trực tuyến qua hotline **0981757527** để được cài đặt và chuyển giao phần mềm lập tức!' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Xóa lịch sử cuộc trò chuyện?")) {
      setHistory([]);
    }
  };

  // Helper function to render simple bold formatting and newlines
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Process simple markdown markers: **text** and *text*
      let processed = line;
      
      // Match bold **word**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(processed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processed.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-[#F5A623]">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < processed.length) {
        parts.push(processed.substring(lastIndex));
      }

      // If no gold bolding was found, return default
      const finalParts = parts.length > 0 ? parts : [processed];

      return (
        <p key={lIdx} className="mb-1.5 last:mb-0 text-[13px] leading-relaxed">
          {finalParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. Floating Dock on the Right */}
      <div 
        id="floating-dock-bnsc" 
        className="fixed right-5 bottom-12 z-40 flex flex-col items-center gap-3 select-none"
      >
        {/* Facebook Squircle */}
        <a 
          href="https://www.facebook.com/bacnam.com.vn/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative w-12 h-12 rounded-2xl bg-slate-900/85 hover:bg-[#1877F2]/90 border border-white/[0.08] hover:border-[#1877F2]/35 flex items-center justify-center text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-[#1877F2]/20 cursor-pointer"
          aria-label="BNSC Facebook Fanpage"
        >
          <Facebook className="w-5 h-5" />
          <span className="absolute right-14 scale-0 group-hover:scale-100 origin-right transition-all duration-200 bg-slate-950 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-white/5 shadow-xl whitespace-nowrap">
            Fanpage BNSC FB
          </span>
        </a>

        {/* Youtube Squircle */}
        <a 
          href="https://www.youtube.com/c/DutoanBNSC/videos" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative w-12 h-12 rounded-2xl bg-slate-900/85 hover:bg-[#FF0000]/90 border border-white/[0.08] hover:border-[#FF0000]/30 flex items-center justify-center text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-[#FF0000]/20 cursor-pointer"
          aria-label="BNSC YouTube Channel"
        >
          <Youtube className="w-5 h-5" />
          <span className="absolute right-14 scale-0 group-hover:scale-100 origin-right transition-all duration-200 bg-slate-950 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-white/5 shadow-xl whitespace-nowrap">
            Kênh Video Hướng dẫn
          </span>
        </a>

        {/* Messenger Squircle */}
        <a 
          href="https://m.me/100027194902779" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative w-12 h-12 rounded-2xl bg-slate-900/85 hover:bg-[#00B2FF]/90 border border-white/[0.08] hover:border-[#00B2FF]/30 flex items-center justify-center text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-[#00B2FF]/20 cursor-pointer"
          aria-label="BNSC Messenger Support"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute right-14 scale-0 group-hover:scale-100 origin-right transition-all duration-200 bg-slate-950 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-white/5 shadow-xl whitespace-nowrap">
            Chat qua Messenger
          </span>
        </a>

        {/* Zalo Premium Squircle */}
        <a 
          href="https://zalo.me/0981757527" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative w-12 h-12 rounded-2xl bg-slate-900/85 hover:bg-sky-500 border border-white/[0.08] hover:border-sky-400/30 flex items-center justify-center text-slate-200 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-sky-500/20 cursor-pointer text-center"
          aria-label="Zalo Khắc Tiệp BNSC"
        >
          <ZaloIcon />
          <span className="absolute right-14 scale-0 group-hover:scale-100 origin-right transition-all duration-200 bg-slate-950 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-white/5 shadow-xl whitespace-nowrap">
            Zalo Khắc Tiệp: 0981757527
          </span>
        </a>

        {/* AI Chat Activation Toggle (Sparkles glowing button) */}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl cursor-pointer relative overflow-hidden group ${
            chatOpen 
              ? 'bg-[#E09413] text-[#0B2545] rotate-90 shadow-[#F5A623]/20 border border-[#F5A623]/20' 
              : 'bg-gradient-to-tr from-[#F5A623] to-[#fbbf24] text-[#0B2545] hover:shadow-[#F5A623]/35'
          }`}
          aria-label="Chat with BNSC AI Assistant"
        >
          {chatOpen ? (
            <X className="w-5 h-5 z-10" />
          ) : (
            <div className="relative">
              <Cpu className="w-5 h-5 z-10 relative animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* 2. Responsive Slide-out AI Assistant Window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            id="chat-ai-panel" 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 150 }}
            className="fixed right-5 bottom-28 z-40 w-[92%] sm:w-[410px] h-[550px] max-h-[80vh] rounded-3xl bg-slate-950/98 backdrop-blur-lg border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden text-white"
          >
            {/* Header */}
            <div className="bg-slate-900/60 p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F5A623] to-[#fbbf24] flex items-center justify-center text-[#0B2545] shadow-inner relative overflow-hidden group/header">
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300" />
                  <Cpu className="w-5 h-5 text-[#0B2545] relative z-10 animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[14px] font-bold tracking-wide text-white">TRỢ LÝ THÔNG MINH AI BNSC</span>
                  <span className="text-[10px] text-emerald-400 font-semibold tracking-wider flex items-center gap-1 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Trực tuyến hỗ trợ 24/7
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button 
                    onClick={clearChat}
                    className="p-1 px-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-all cursor-pointer text-xs flex items-center gap-1"
                    title="Xóa cuộc trò chuyện"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Technical Support Hot Banner */}
            <div className="bg-[#0F3A5F]/40 border-b border-[#1B5FA8]/20 p-2.5 px-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-450 bg-amber-400 animate-ping"></span>
                <span className="text-[11px] font-extrabold text-slate-300 tracking-wide">Cần hỗ trợ qua vChat / Kỹ thuật viên?</span>
              </div>
              <button 
                onClick={() => {
                  setChatOpen(false);
                  onStartTechnicalSupport?.();
                }}
                className="px-2.5 py-1.5 bg-gradient-to-r from-[#F5A623] to-[#fbbf24] hover:brightness-110 text-slate-950 font-black text-[10px] tracking-wide uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-md shadow-[#F5A623]/10"
              >
                Gặp kỹ thuật &rarr;
              </button>
            </div>

            {/* Chat Body & Dialogues */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 text-left">
              
              {/* Bot Initial Welcome Greeting always visible at top */}
              <div className="flex gap-2.5 items-start max-w-[85%]">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#F5A623]/25 to-yellow-500/10 border border-[#F5A623]/35 shrink-0 flex items-center justify-center text-[#F5A623]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-white/[0.04] p-3 text-slate-100">
                  {renderMessageContent(initialMessage)}
                </div>
              </div>

              {/* Message Log */}
              {history.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={idx} 
                    className={`flex gap-2.5 items-start max-w-[85%] ${
                      isUser ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    {!isUser ? (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#F5A623]/25 to-yellow-500/10 border border-[#F5A623]/35 shrink-0 flex items-center justify-center text-[#F5A623]">
                        <Cpu className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 shrink-0 flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed border ${
                      isUser 
                        ? 'bg-gradient-to-tr from-[#0F3A5F] to-[#1B5FA8]/50 text-white border-[#1B5FA8]/20 rounded-tr-sm' 
                        : 'bg-slate-900 border-white/[0.04] text-slate-100 rounded-tl-sm'
                    }`}>
                      {renderMessageContent(msg.text)}
                    </div>
                  </div>
                );
              })}

              {/* Thinking/Loading State */}
              {loading && (
                <div className="flex gap-2.5 items-start max-w-[70%]">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#F5A623]/25 to-yellow-500/10 border border-[#F5A623]/35 shrink-0 flex items-center justify-center text-[#F5A623]">
                    <Cpu className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-900-60 border border-white/[0.04] p-3 text-slate-300 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5A623]" />
                    <span>AI BNSC đang suy nghĩ...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick Prompt Suggest Chips */}
            {history.length === 0 && !loading && (
              <div className="p-3 border-t border-white/[0.04] bg-slate-900/20 text-left">
                <p className="text-[10px] text-slate-500 font-semibold mb-2 uppercase tracking-wider pl-1 font-mono">
                  Gợi ý hỏi đáp nhanh:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="text-[11px] text-[#A5C9FF] hover:text-[#F5A623] bg-[#11253C] hover:bg-[#1A3757] border border-[#1A3C63] hover:border-[#F5A623]/40 px-2.5 py-1.5 rounded-full transition-all cursor-pointer text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Input Area */}
            <div className="p-3 border-t border-white/[0.06] bg-slate-900/40">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-slate-950 border border-white/[0.08] hover:border-[#1B5FA8]/40 focus-within:border-[#F5A623]/40 rounded-xl px-3 py-1.5 transition-all text-left"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Gửi câu hỏi tới AI của BNSC..."
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-500 border-none outline-none focus:ring-0 leading-normal"
                />
                
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#F5A623] to-[#fbbf24] hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:scale-100 flex items-center justify-center text-[#0B2545] font-semibold transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-slate-400 font-medium">
                <span className="font-bold text-amber-500 tracking-wider">Hotline: 0966966455</span>
                <span className="flex items-center gap-1 font-mono">
                  <CornerDownLeft className="w-3 h-3 text-slate-500" /> Enter
                </span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
