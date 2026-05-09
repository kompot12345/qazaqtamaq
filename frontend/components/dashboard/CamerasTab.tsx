'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Edit3, Video, VideoOff, X, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { camerasAPI } from '@/lib/api';

type Camera = {
  id: string;
  name: string;
  streamUrl: string;
  location: string | null;
  isActive: boolean;
};

type StreamType = 'hls' | 'youtube' | 'iframe';

function detectType(url: string): StreamType {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.endsWith('.m3u8') || url.includes('.m3u8?')) return 'hls';
  return 'iframe';
}

function youtubeEmbedUrl(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  const videoId = match?.[1] ?? '';
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
}

function HlsPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          return () => hls.destroy();
        }
      });
    }
  }, [url]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      autoPlay
      muted
      playsInline
      controls
    />
  );
}

function CameraPlayer({ camera }: { camera: Camera }) {
  const type = detectType(camera.streamUrl);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      {type === 'youtube' && (
        <iframe
          src={youtubeEmbedUrl(camera.streamUrl)}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}
      {type === 'hls' && <HlsPlayer url={camera.streamUrl} />}
      {type === 'iframe' && (
        <iframe src={camera.streamUrl} className="w-full h-full" allowFullScreen />
      )}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 rounded-lg px-2 py-1">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs text-white font-medium">LIVE</span>
      </div>
    </div>
  );
}

type FormState = { name: string; streamUrl: string; location: string };
const EMPTY: FormState = { name: '', streamUrl: '', location: '' };

export default function CamerasTab() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Camera | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<Camera | null>(null);

  const load = () => {
    camerasAPI.getAll()
      .then((r) => setCameras(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (cam: Camera) => {
    setEditing(cam);
    setForm({ name: cam.name, streamUrl: cam.streamUrl, location: cam.location ?? '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.streamUrl.trim()) {
      toast.error('Заполните название и URL потока');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await camerasAPI.update(editing.id, form);
        toast.success('Камера обновлена');
      } else {
        await camerasAPI.create(form);
        toast.success('Камера добавлена');
      }
      setShowForm(false);
      load();
    } catch {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить камеру?')) return;
    await camerasAPI.delete(id);
    toast.success('Камера удалена');
    load();
  };

  const toggleActive = async (cam: Camera) => {
    await camerasAPI.update(cam.id, { isActive: !cam.isActive });
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">CCTV Мониторинг</h2>
          <p className="text-xs text-gray-500 mt-0.5">Подключите HLS-поток, YouTube Live или IP-камеру</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-[#0A2540] transition-all hover:scale-[1.02] active:scale-95"
          style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
        >
          <Plus size={16} /> Добавить камеру
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-2xl border border-[#00AFCA]/30 bg-gradient-to-b from-[#00AFCA]/5 to-white/[0.02] p-6">
          <h3 className="text-sm font-bold text-white mb-4">{editing ? 'Редактировать камеру' : 'Новая камера'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Название *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Коровник A, Ферма — вход"
                className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Расположение</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Северная ферма, блок 2"
                className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 transition-all"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">URL потока *</label>
            <input
              value={form.streamUrl}
              onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
              placeholder="https://... (HLS .m3u8, YouTube Live, или iframe-совместимый URL)"
              className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 transition-all"
            />
            <p className="text-xs text-gray-600 mt-1.5">
              Поддерживается: HLS (*.m3u8) · YouTube Live · IP-камеры с HTTP-потоком
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#0A2540] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
            >
              <Check size={16} /> {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 border border-white/10 hover:border-white/20"
            >
              <X size={16} /> Отмена
            </button>
          </div>
        </div>
      )}

      {/* Camera viewer modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewing(null)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-bold">{viewing.name}</h3>
                {viewing.location && <p className="text-xs text-gray-400">{viewing.location}</p>}
              </div>
              <button onClick={() => setViewing(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <X size={18} className="text-white" />
              </button>
            </div>
            <CameraPlayer camera={viewing} />
          </div>
        </div>
      )}

      {/* Camera grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#00AFCA]/30 border-t-[#00AFCA] rounded-full animate-spin" />
        </div>
      ) : cameras.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-16 text-center">
          <Video size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Камеры не подключены</p>
          <p className="text-gray-600 text-sm mt-1">Добавьте HLS-поток или YouTube Live вашей фермы</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cameras.map((cam) => (
            <div key={cam.id} className={`rounded-2xl border ${cam.isActive ? 'border-white/8' : 'border-white/4 opacity-60'} bg-gradient-to-b from-white/[0.05] to-white/[0.01] overflow-hidden`}>
              {/* Preview */}
              {cam.isActive ? (
                <CameraPlayer camera={cam} />
              ) : (
                <div className="aspect-video bg-[#060D1A] flex flex-col items-center justify-center gap-2">
                  <VideoOff size={32} className="text-gray-600" />
                  <span className="text-gray-600 text-sm">Камера отключена</span>
                </div>
              )}

              {/* Info + actions */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-bold text-sm">{cam.name}</h4>
                    {cam.location && (
                      <p className="text-xs text-gray-500 mt-0.5">📍 {cam.location}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cam.isActive && (
                      <button
                        onClick={() => setViewing(cam)}
                        className="p-2 rounded-lg bg-[#00AFCA]/10 hover:bg-[#00AFCA]/20 text-[#00AFCA] transition-colors"
                        title="Открыть на весь экран"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => toggleActive(cam)}
                      className={`p-2 rounded-lg transition-colors ${cam.isActive ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-gray-500'}`}
                      title={cam.isActive ? 'Отключить' : 'Включить'}
                    >
                      {cam.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={() => openEdit(cam)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cam.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
