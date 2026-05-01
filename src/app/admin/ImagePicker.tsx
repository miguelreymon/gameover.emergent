'use client';

import { useEffect, useState } from 'react';
import { listImagesAction, uploadImageAction } from './actions';

type Props = {
  value: string;
  onChange: (path: string) => void;
  label?: string;
};

const VIDEO_RE = /\.(mp4|webm|mov|m4v)$/i;
function isVideoPath(p: string) {
  return VIDEO_RE.test(p);
}

export default function ImagePicker({ value, onChange, label }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const load = async () => {
    const list = await listImagesAction();
    setImages(list);
  };

  useEffect(() => {
    if (showPicker) load();
  }, [showPicker]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setUploadError('');
    const fd = new FormData();
    fd.append('file', f);
    fd.append('name', f.name);
    const res = await uploadImageAction(fd);
    setUploading(false);
    if (res.success && res.path) {
      await load();
      onChange(res.path);
    } else {
      setUploadError(res.error || 'Error');
    }
    e.target.value = '';
  };

  const renderThumb = (src: string, className: string) => {
    if (isVideoPath(src)) {
      return (
        <video
          src={src}
          className={className}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
        />
      );
    }
    return (
      <img
        src={src}
        alt=""
        className={className}
        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
      />
    );
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="/images/..."
          data-testid="image-picker-input"
        />
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="bg-slate-200 hover:bg-slate-300 px-3 py-2 rounded text-sm"
          data-testid="image-picker-open"
        >
          Elegir
        </button>
      </div>
      {value && value.startsWith('/') && renderThumb(value, 'w-24 h-24 object-cover rounded border')}

      {showPicker && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Elegir / subir imagen o vídeo</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>
            <div className="p-4 border-b bg-slate-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="bg-slate-900 text-white px-4 py-2 rounded text-sm">
                  {uploading ? 'Subiendo…' : 'Subir nuevo archivo'}
                </span>
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
                  onChange={handleFile}
                  className="hidden"
                  disabled={uploading}
                  data-testid="image-upload-input"
                />
                <span className="text-xs text-slate-500">
                  PNG, JPG, WebP, AVIF, GIF, SVG, MP4, WebM, MOV
                </span>
              </label>
              {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}
              <p className="text-[11px] text-amber-700 mt-2 leading-relaxed">
                ⚠️ Los archivos se guardan en <code>/public/images/</code>. Para que lleguen a
                producción, haz <code>git add</code> + <code>push</code> del archivo al repo.
                Vercel no persiste uploads en runtime.
              </p>
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
              {images.map((img) => {
                const path = `/images/${img}`;
                const selected = path === value;
                return (
                  <button
                    key={img}
                    type="button"
                    onClick={() => {
                      onChange(path);
                      setShowPicker(false);
                    }}
                    className={`relative border-2 rounded overflow-hidden text-left ${
                      selected ? 'border-blue-500' : 'border-transparent hover:border-slate-300'
                    }`}
                    data-testid={`image-option-${img}`}
                  >
                    {renderThumb(path, 'w-full h-24 object-cover')}
                    {isVideoPath(path) && (
                      <span className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                        VIDEO
                      </span>
                    )}
                    <span className="block text-[10px] truncate p-1 bg-white">{img}</span>
                  </button>
                );
              })}
              {images.length === 0 && (
                <p className="col-span-full text-center text-slate-500 py-8">
                  No hay archivos todavía. Sube el primero con el botón de arriba.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
