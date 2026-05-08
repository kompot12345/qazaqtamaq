'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A2540] via-[#0D3256] to-[#060D1A] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD700] rounded-full mix-blend-screen blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00AFCA] rounded-full mix-blend-screen blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto slide-up">
        <div className="mb-6">
          <p className="text-[10rem] md:text-[14rem] font-bold leading-none bg-gradient-to-br from-[#C9A227] to-[#FFD700] bg-clip-text text-transparent select-none opacity-80">
            404
          </p>
        </div>

        <div className="text-6xl mb-6">🌾</div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Эта страница исчезла в степях
        </h1>
        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          Похоже, страница, которую вы ищете, укочевала или её никогда не существовало.
          Вернитесь на главную или перейдите в каталог.
        </p>

        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C9A227] to-[#FFD700] text-[#0A2540] font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all transform hover:scale-105"
          >
            <Home size={20} /> На главную
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all transform hover:scale-105"
          >
            <Search size={20} /> Каталог продуктов
          </Link>
        </div>

        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 mt-8 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Вернуться назад
        </button>
      </div>
    </div>
  );
}
