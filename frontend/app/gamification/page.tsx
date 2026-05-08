'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { toast } from 'sonner';
import { Trophy, Timer, Zap, ArrowLeft, RotateCcw, Star } from 'lucide-react';
import { gamificationAPI } from '@/lib/api';

const FarmerCanvas = dynamic(() => import('@/components/three/FarmerCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

const GameCanvas = dynamic(() => import('@/components/three/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#030810]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#FFD700]/30 border-t-[#FFD700] animate-spin mx-auto mb-4" />
        <p className="text-[#FFD700]/60 text-sm tracking-widest uppercase">Жүктелуде</p>
      </div>
    </div>
  ),
});

const GAME_DURATION = 30;
type GameState = 'idle' | 'playing' | 'finished';

/* Kazakh ornament SVG strip — simple geometric lozenge chain */
function KazakhOrnament({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 12" preserveAspectRatio="xMidYMid meet" fill="none">
      {Array.from({ length: 20 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 20}, 6)`}>
          <polygon points="0,-5 5,0 0,5 -5,0" fill="#C9A227" opacity="0.6" />
          <polygon points="0,-3 3,0 0,3 -3,0" fill="#FFD700" opacity="0.9" />
        </g>
      ))}
    </svg>
  );
}

const TIERS = [
  { min: 80, medal: '🥇', label: '80+', credits: 100, discount: 15, color: '#FFD700' },
  { min: 50, medal: '🥈', label: '50+', credits: 50,  discount: 10, color: '#C0C0C0' },
  { min: 20, medal: '🥉', label: '20+', credits: 20,  discount: 5,  color: '#CD7F32' },
  { min: 0,  medal: '🎯', label: '0+',  credits: 5,   discount: 0,  color: '#6B7280' },
];

export default function GamificationPage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore]         = useState(0);
  const [timeLeft, setTimeLeft]   = useState(GAME_DURATION);
  const [result, setResult]       = useState<any>(null);
  const [claiming, setClaiming]   = useState(false);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const endGame = useCallback(async (finalScore: number) => {
    setGameState('finished');
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    setClaiming(true);
    try {
      const res = await gamificationAPI.claim(finalScore, duration);
      setResult(res.data);
      toast.success(`${res.data.nomadCredits} Номад Кредит жиналды!`);
    } catch {
      setResult({ nomadCredits: 0, discountPercent: 0, discountCode: null, message: 'Жауап жоқ' });
    } finally {
      setClaiming(false);
    }
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setResult(null);
    setGameState('playing');
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setScore((s) => { endGame(s); return s; });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [endGame]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleScore = useCallback((delta: number) => {
    setScore((prev) => prev + delta);
  }, []);

  const timerPct  = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft > 15 ? '#00AFCA' : timeLeft > 7 ? '#FFD700' : '#EF4444';
  const activeTier = TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];

  return (
    <div className="min-h-screen bg-[#030810] flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative border-b border-[#C9A227]/20">
        {/* Top ornament strip */}
        <KazakhOrnament className="absolute top-0 left-0 right-0 w-full h-3" />

        <div className="flex items-center justify-between px-5 py-4 pt-5">
          <Link
            href="/products"
            className="flex items-center gap-2 text-gray-400 hover:text-[#FFD700] transition-colors text-sm font-medium"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Артқа</span>
          </Link>

          {/* Centre title */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              {/* Tiny asyk icon — two lozenges */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <ellipse cx="9" cy="9" rx="4" ry="7" fill="#C9A227" opacity="0.3" transform="rotate(-30 9 9)" />
                <ellipse cx="9" cy="9" rx="4" ry="7" fill="#FFD700" opacity="0.5" transform="rotate(30 9 9)" />
                <circle cx="9" cy="9" r="2" fill="#FFD700" />
              </svg>
              <h1 className="text-white font-extrabold text-xl tracking-wide">
                Асық ату
              </h1>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <ellipse cx="9" cy="9" rx="4" ry="7" fill="#C9A227" opacity="0.3" transform="rotate(30 9 9)" />
                <ellipse cx="9" cy="9" rx="4" ry="7" fill="#FFD700" opacity="0.5" transform="rotate(-30 9 9)" />
                <circle cx="9" cy="9" r="2" fill="#FFD700" />
              </svg>
            </div>
            <p className="text-[#C9A227]/70 text-[10px] tracking-[0.2em] uppercase font-semibold">
              Қазақтың ұлттық ойыны
            </p>
          </div>

          <Link
            href="/gamification/leaderboard"
            className="flex items-center gap-1.5 text-[#FFD700] text-sm font-bold hover:text-white transition-colors"
          >
            <Trophy size={15} />
            <span className="hidden sm:inline">Рейтинг</span>
          </Link>
        </div>

        {/* Bottom ornament strip */}
        <KazakhOrnament className="absolute bottom-0 left-0 right-0 w-full h-3" />
      </header>

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* ── 3-D canvas area ──────────────────────────────────── */}
        <div className="flex-1 min-h-[55vh] lg:min-h-0 relative">
          <GameCanvas onScore={handleScore} active={gameState === 'playing'} />

          {/* ── IDLE overlay ──────────────────────────────────── */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/75 via-black/60 to-black/80 backdrop-blur-[2px]">
              <div className="text-center px-6 max-w-sm w-full">

                {/* Tattibeke character */}
                <div className="relative flex justify-center mb-2">
                  <div className="w-[120px] h-[190px]">
                    <FarmerCanvas gender="female" waving cameraY={1.05} cameraZ={3.5} />
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0A2540]/95 border border-[#FFD700]/40 rounded-2xl rounded-bl-none px-3 py-1.5 shadow-xl">
                    <p className="text-[#FFD700] text-xs font-bold">Ойынды бастайық! 🎯</p>
                  </div>
                </div>

                {/* Title block */}
                <div className="mb-4">
                  <h2 className="text-2xl font-extrabold text-white tracking-wide mb-1">Асық ату ойыны</h2>
                  <p className="text-[#C9A227]/80 text-xs tracking-widest uppercase mb-3">Қазақтың ежелгі дәстүрі</p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Алтын сақаны шеңберге лақтырып, ішіндегі асықтарды шығар — нақты қазақ ойыны. Шеңбер сыртына шыққан әр асық <span className="text-[#4ADE80] font-bold">+10 ұпай!</span>
                  </p>
                </div>

                {/* How-to */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-4 text-left text-sm space-y-1.5">
                  <p className="text-[#00AFCA] font-bold text-xs uppercase tracking-wider mb-2">Қалай ойнайды?</p>
                  <p className="text-gray-300 text-xs">🖱️ <span className="text-white font-medium">Тышқанды жылжыт</span> — бағытты таңда</p>
                  <p className="text-gray-300 text-xs">🖱️ <span className="text-white font-medium">Шертіп лақтыр</span> — алтын сақа атылады</p>
                  <p className="text-gray-300 text-xs">⭕ Шеңбер сыртына шыққан асық — <span className="text-[#4ADE80] font-bold">+10 ұпай</span></p>
                </div>

                {/* Reward tiers */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {TIERS.slice(0, 3).map((tier) => (
                    <div
                      key={tier.min}
                      className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center hover:border-[#C9A227]/40 transition-colors"
                    >
                      <p className="text-xl mb-0.5">{tier.medal}</p>
                      <p className="text-white font-bold text-sm">{tier.label}</p>
                      <p className="text-[#FFD700] text-xs font-semibold">-{tier.discount}%</p>
                      <p className="text-gray-400 text-[10px]">{tier.credits} кредит</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startGame}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9A227] to-[#FFD700] text-[#0A2540] font-extrabold rounded-2xl text-base hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-yellow-900/30 tracking-wide"
                >
                  ▶ Ойынды бастау
                </button>
              </div>
            </div>
          )}

          {/* ── FINISHED overlay ──────────────────────────────── */}
          {gameState === 'finished' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/80 via-black/70 to-black/85 backdrop-blur-[3px]">
              <div className="text-center px-6 max-w-sm w-full">

                {/* Score medal */}
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 rounded-full border-4 border-[#C9A227]/40 flex items-center justify-center text-4xl bg-[#0A2540]/80 shadow-xl shadow-yellow-900/20">
                    {activeTier.medal}
                  </div>
                  {score >= 50 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                      <Star size={12} fill="#0A2540" className="text-[#0A2540]" />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-white mb-1 tracking-wide">Ойын аяқталды!</h2>
                <p className="text-5xl font-black text-[#FFD700] mb-1 tracking-tight">{score}</p>
                <p className="text-gray-400 text-sm mb-4">ұпай жиналды</p>

                {/* Reward block */}
                {claiming ? (
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                    <div className="w-4 h-4 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
                    Марапат берілуде...
                  </div>
                ) : result ? (
                  <div className="bg-white/5 border border-[#C9A227]/30 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap size={16} className="text-[#FFD700]" />
                      <span className="text-[#FFD700] font-extrabold text-lg">{result.nomadCredits} Номад Кредит</span>
                    </div>
                    {result.discountPercent > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-300 text-xs mb-1.5">{result.discountPercent}% жеңілдік промокоды:</p>
                        <div className="bg-[#0A2540] border border-[#FFD700]/40 rounded-xl px-4 py-2 font-mono text-[#FFD700] font-bold tracking-[0.2em] text-sm">
                          {result.discountCode}
                        </div>
                      </div>
                    )}
                    {result.message && (
                      <p className="text-gray-400 text-xs mt-2">{result.message}</p>
                    )}
                  </div>
                ) : null}

                <div className="flex gap-2.5">
                  <button
                    onClick={startGame}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/15 text-white text-sm rounded-xl hover:bg-white/8 hover:border-white/30 transition-all font-semibold"
                  >
                    <RotateCcw size={14} /> Қайта ойна
                  </button>
                  <Link
                    href="/products"
                    className="flex-1 flex items-center justify-center py-3 bg-gradient-to-r from-[#C9A227] to-[#FFD700] text-[#0A2540] font-extrabold text-sm rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Дүкенге өту
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Side HUD ─────────────────────────────────────────── */}
        <aside className="lg:w-52 p-4 flex lg:flex-col gap-3 border-t lg:border-t-0 lg:border-l border-[#C9A227]/15 bg-[#030810]">

          {/* Score widget */}
          <div className="flex-1 lg:flex-none bg-[#0A2540]/60 border border-[#C9A227]/20 rounded-2xl p-4 text-center">
            <p className="text-[#C9A227]/70 text-[10px] tracking-[0.18em] uppercase font-semibold mb-1">Ұпай</p>
            <p className="text-4xl font-black text-[#FFD700] leading-none">{score}</p>
            {gameState === 'playing' && (
              <p className="text-[#C9A227]/50 text-[10px] mt-1 font-medium"
                style={{ color: activeTier.color }}>
                {activeTier.medal} {activeTier.label} дең.
              </p>
            )}
          </div>

          {/* Timer widget */}
          <div className="flex-1 lg:flex-none bg-[#0A2540]/60 border border-[#C9A227]/20 rounded-2xl p-4 text-center">
            <p className="text-[#C9A227]/70 text-[10px] tracking-[0.18em] uppercase font-semibold mb-1 flex items-center justify-center gap-1">
              <Timer size={10} /> Уақыт
            </p>
            <p className="text-4xl font-black leading-none" style={{ color: timerColor }}>{timeLeft}с</p>
            <div className="mt-2.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
              />
            </div>
          </div>

          {/* Playing hint */}
          {gameState === 'playing' && (
            <div className="flex-1 lg:flex-none bg-[#0A2540]/40 border border-[#00AFCA]/15 rounded-2xl p-3.5">
              <p className="text-[#00AFCA]/70 text-[10px] tracking-[0.18em] uppercase font-semibold mb-2">Нұсқаулық</p>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                <span className="text-[#FFD700]">Алтын сақаны</span> шеңбер ішіндегі{' '}
                <span className="text-white">асықтарға</span> лақтырыңыз.{' '}
                <span className="text-[#4ADE80] font-bold">+10 ұпай!</span>
              </p>
            </div>
          )}

          {/* Idle: rewards */}
          {gameState !== 'playing' && (
            <div className="flex-1 lg:flex-none bg-[#0A2540]/40 border border-[#C9A227]/15 rounded-2xl p-3.5">
              <p className="text-[#C9A227]/70 text-[10px] tracking-[0.18em] uppercase font-semibold mb-2.5">Марапат</p>
              <div className="space-y-1.5">
                {TIERS.map((tier) => (
                  <div key={tier.min} className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-300">{tier.medal} {tier.label}</span>
                    <span className="text-[#FFD700] font-semibold">{tier.credits} кр</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural note */}
          <div className="hidden lg:block bg-[#C9A227]/5 border border-[#C9A227]/15 rounded-2xl p-3.5">
            <p className="text-[#C9A227]/60 text-[9px] tracking-[0.15em] uppercase font-semibold mb-1.5">Тарих</p>
            <p className="text-gray-500 text-[10px] leading-relaxed">
              Асық ату — қой немесе сиыр асығымен ойналатын қазақтың ежелгі ұлттық ойыны.
            </p>
          </div>
        </aside>
      </div>

      {/* ── Bottom ornament ─────────────────────────────────────── */}
      <div className="border-t border-[#C9A227]/10 py-2">
        <KazakhOrnament className="w-full h-3 opacity-40" />
      </div>
    </div>
  );
}
