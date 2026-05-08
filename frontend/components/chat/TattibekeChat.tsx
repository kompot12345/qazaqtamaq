'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { tattibekeAPI } from '@/lib/api';

const FarmerCanvas = dynamic(() => import('@/components/three/FarmerCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#060D1A]" />,
});

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
  suggestions?: string[];
}

const WELCOME: Message = {
  id: 'welcome',
  from: 'bot',
  text: 'Сәлем! Мен Таттібек 🌾\nQazaqTamaq-тың AI-көмекшісімін.\n\nӨнімдер, тапсырыстар немесе жеңілдіктер туралы сұраңыз!',
  suggestions: ['Өнімдер қандай?', 'Жеңілдіктер бар ма?', 'Асық ату ойыны?'],
};

// Tiny face-only avatar (reused in message list and typing indicator)
function BotAvatar({ waving = false }: { waving?: boolean }) {
  return (
    <div className="w-8 h-8 rounded-full border-2 border-[#FFD700]/70 overflow-hidden flex-shrink-0 shadow-md"
      style={{ background: '#060D1A' }}>
      <FarmerCanvas gender="female" waving={waving} cameraY={1.55} cameraZ={1.9} />
    </div>
  );
}

export default function TattibekeChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await tattibekeAPI.chat(text.trim());
      const { reply, suggestions } = res.data;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), from: 'bot', text: reply, suggestions },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), from: 'bot', text: 'Байланыс қатесі. Кейінірек қайталаңыз 🙏' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating launcher ── */}
      <div className="fixed bottom-3 right-4 z-50 flex flex-col items-center gap-1">
        {/* Character standing above button */}
        {!open && (
          <div className="relative">
            {/* Speech bubble */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                            bg-white border border-[#FFD700]/60 rounded-2xl rounded-bl-none
                            px-2.5 py-1 shadow-lg z-10 pointer-events-none">
              <p className="text-[#0A2540] text-[10px] font-bold">Сұрақ бар ма? 💬</p>
            </div>
            <div className="w-[80px] h-[140px] pointer-events-none">
              <FarmerCanvas gender="female" waving cameraY={1.05} cameraZ={3.2} />
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Таттібек AI"
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center
                     transition-all hover:scale-110 active:scale-95 border-2 border-[#FFD700]"
          style={{ background: 'linear-gradient(135deg, #0A2540, #0089A7)' }}
        >
          {open
            ? <span className="text-white text-xl font-bold leading-none">✕</span>
            : <span className="text-2xl leading-none select-none">💬</span>}
        </button>
      </div>

      {/* ── Chat panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 w-[340px] sm:w-[390px] flex flex-col
                     bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ maxHeight: 'min(580px, calc(100vh - 110px))' }}
        >

          {/* ── Header ── */}
          <div className="flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0089A7 100%)' }}>
            {/* Character banner row */}
            <div className="flex items-end gap-0 px-4 pt-3 pb-0">
              {/* 3D character — full figure, tall crop */}
              <div className="w-[72px] h-[110px] flex-shrink-0 -mb-1">
                <FarmerCanvas gender="female" waving cameraY={1.0} cameraZ={3.1} />
              </div>

              {/* Name + status */}
              <div className="flex-1 pb-3 pl-2">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-base tracking-wide">Таттібек</p>
                  <span className="text-[10px] bg-[#FFD700]/20 border border-[#FFD700]/40 text-[#FFD700] px-2 py-0.5 rounded-full font-semibold">AI</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                  <p className="text-[#00AFCA] text-xs">QazaqTamaq · Онлайн</p>
                </div>
                <p className="text-white/50 text-[10px] mt-1 italic">Ауыл шаруашылығы AI</p>
              </div>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white text-lg transition-colors mb-3 ml-1"
              >✕</button>
            </div>

            {/* Gold divider line */}
            <div className="h-px mx-4" style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-gradient-to-b from-gray-50/80 to-white">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex items-end gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'bot' && <BotAvatar />}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                      msg.from === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-md'
                    }`}
                    style={msg.from === 'user'
                      ? { background: 'linear-gradient(135deg, #0A2540, #0089A7)' }
                      : {}}
                  >
                    {msg.text}
                  </div>
                </div>

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-10">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 font-medium"
                        style={{ background: 'rgba(0,175,202,0.07)', borderColor: '#00AFCA', color: '#0089A7' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <BotAvatar waving />
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <span className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: '#00AFCA', animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input ── */}
          <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Хабарлама жазыңыз..."
                className="flex-1 text-sm px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none transition-colors"
                onFocus={(e) => (e.target.style.borderColor = '#00AFCA')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center
                           disabled:opacity-40 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
              >
                <span className="text-[#0A2540] font-bold text-base">➤</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
