'use client';

import { Globe, Truck, Plane, MapPin } from 'lucide-react';

const ROUTES = [
  { from: 'Алматы', to: 'Астана', type: 'truck', km: 1300, eta: '14ч', active: true },
  { from: 'Нур-Султан', to: 'Москва', type: 'plane', km: 3900, eta: '3ч', active: true },
  { from: 'Шымкент', to: 'Ташкент', type: 'truck', km: 450, eta: '5ч', active: false },
  { from: 'Алматы', to: 'Дубай', type: 'plane', km: 4600, eta: '6ч', active: true },
];

export function ExportRoutes() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe size={24} className="text-[#D4AF37]" />
        <h3 className="font-bold text-xl text-[#1A2F23]">Маршруты доставки</h3>
      </div>

      <div className="space-y-4">
        {ROUTES.map((route, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              route.active
                ? 'border-green-200 bg-green-50/50'
                : 'border-gray-100 bg-gray-50/50 opacity-60'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              route.active ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {route.type === 'plane' ? (
                <Plane size={18} className={route.active ? 'text-green-700' : 'text-gray-500'} />
              ) : (
                <Truck size={18} className={route.active ? 'text-green-700' : 'text-gray-500'} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1A2F23] text-sm">{route.from}</span>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-[#1A2F23]/30 to-[#D4AF37]/50 relative rounded-full overflow-hidden">
                  {route.active && (
                    <div className="absolute top-0 left-0 h-full w-8 bg-[#D4AF37] animate-pulse rounded-full" />
                  )}
                </div>
                <span className="font-semibold text-[#1A2F23] text-sm">{route.to}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{route.km.toLocaleString('ru')} км · ETA: {route.eta}</p>
            </div>

            <div className="flex-shrink-0">
              {route.active ? (
                <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                  В пути
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  Нет груза
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
        <MapPin size={14} className="text-[#D4AF37]" />
        <span>Доставка по всему Казахстану и экспорт в 15+ стран</span>
      </div>
    </div>
  );
}
