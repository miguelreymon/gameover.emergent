'use client';

import { useEffect, useState } from 'react';
import { listImagesAction, uploadImageAction } from './actions';

type Props = {
  value: string;
  onChange: (path: string) => void;
  label?: string;
};

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
      {value && value.startsWith('/') && (
        <img
          src={value}
          alt=""
          className="w-24 h-24 object-cover rounded border"
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />
      )}

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
              <h3 className="font-bold">Elegir / subir imagen</h3>
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
                  {uploading ? 'Subiendo…' : 'Subir nueva imagen'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                  disabled={uploading}
                  data-testid="image-upload-input"
                />
                <span className="text-xs text-slate-500">
                  PNG, JPG, WebP, AVIF, GIF, SVG
                </span>
              </label>
              {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}
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
                    <img src={path} alt={img} className="w-full h-24 object-cover" />
                    <span className="block text-[10px] truncate p-1 bg-white">{img}</span>
                  </button>
                );
              })}
              {images.length === 0 && (
                <p className="col-span-full text-center text-slate-500 py-8">
                  No hay imágenes todavía. Sube la primera con el botón de arriba.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
