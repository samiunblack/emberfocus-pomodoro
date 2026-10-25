import React, { useEffect, useRef, useState } from 'react';
import { Upload, RotateCcw, Sparkles } from 'lucide-react';

interface PixelCampfireProps {
  isRunning: boolean;
  progress: number; // 0 to 1
  size?: number; // displayed size in px
  customGifUrl?: string | null;
  onUploadGif?: (dataUrl: string) => void;
  onResetToDefault?: () => void;
  onClick?: () => void;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const PixelCampfire: React.FC<PixelCampfireProps> = ({
  isRunning,
  progress,
  size = 320,
  customGifUrl,
  onUploadGif,
  onResetToDefault,
  onClick,
}) => {
  const sparkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Default sprite provided by user
  const defaultSpriteUrl = '/assets/aistudio/image_23eb3ae0.png';
  const activeImageUrl = customGifUrl || defaultSpriteUrl;

  // Handle file drop or selection
  const handleFile = (file: File) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && onUploadGif) {
          onUploadGif(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Spark and ember particle overlay on canvas
  useEffect(() => {
    const canvas = sparkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 160;
    const H = 160;
    const cx = W / 2;
    const cy = H * 0.65;

    const sparkColors = ['#ffffff', '#fff394', '#ffd024', '#ff7020', '#ff2e6e'];

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, W, H);

      // Spawn sparks
      const sparkRate = isRunning ? (progress > 0.5 ? 0.65 : 0.45) : 0.2;
      if (Math.random() < sparkRate) {
        sparksRef.current.push({
          x: cx + (Math.random() * 24 - 12),
          y: cy - 10 - Math.random() * 15,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -(0.55 + Math.random() * 0.95),
          life: 0,
          maxLife: 40 + Math.random() * 40,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          size: Math.random() < 0.3 ? 2 : 1,
        });
      }

      // Update and draw sparks
      const remaining: Spark[] = [];
      for (let i = 0; i < sparksRef.current.length; i++) {
        const s = sparksRef.current[i];
        s.life += 1;
        s.x += s.vx + Math.sin(s.life * 0.12 + s.y * 0.08) * 0.2;
        s.y += s.vy;

        if (s.life < s.maxLife && s.y > 2 && s.x > 4 && s.x < W - 4) {
          const alpha = 1.0 - s.life / s.maxLife;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color;
          ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
          ctx.restore();
          remaining.push(s);
        }
      }
      sparksRef.current = remaining;

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, progress]);

  // Click burst of sparks!
  const triggerSparkBurst = () => {
    for (let i = 0; i < 14; i++) {
      sparksRef.current.push({
        x: 80 + (Math.random() * 20 - 10),
        y: 85 + (Math.random() * 10),
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(0.9 + Math.random() * 1.6),
        life: 0,
        maxLife: 45 + Math.random() * 35,
        color: ['#ffffff', '#ffeb3b', '#ff7a18', '#ff3366'][Math.floor(Math.random() * 4)],
        size: Math.random() < 0.3 ? 2 : 1,
      });
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="relative flex items-center justify-center select-none group"
      style={{ width: size, height: size }}
    >
      {/* Hidden file input for uploading custom GIF or Sprite */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/gif,image/png,image/webp,image/jpeg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Atmospheric Firelight Reflection on Ground beneath the sprite */}
      <div
        className="absolute bottom-6 w-3/4 h-14 rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at center, rgba(255, 110, 40, ${
            0.2 + progress * 0.25 + (isRunning ? 0.08 : 0)
          }) 0%, rgba(220, 36, 90, ${0.12 + progress * 0.18}) 45%, transparent 75%)`,
          filter: 'blur(10px)',
          transform: isRunning ? 'scale(1.05)' : 'scale(1)',
        }}
      />

      {/* Pixel Campfire Sprite / Animated GIF */}
      <div
        onClick={() => {
          triggerSparkBurst();
          if (onClick) onClick();
        }}
        className={`relative w-full h-full flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          isDragging ? 'scale-105 ring-2 ring-amber-400 ring-dashed rounded-3xl' : 'hover:scale-102 active:scale-98'
        }`}
        title="Click campfire for ember sparks · Drag & drop a GIF here anytime"
      >
        <img
          src={activeImageUrl}
          alt="Pixel Campfire"
          className={`w-full h-full object-contain image-pixelated transition-all duration-300 ${
            isRunning ? 'filter drop-shadow-[0_0_18px_rgba(255,100,40,0.35)]' : ''
          }`}
          style={{
            animation: !customGifUrl && isRunning ? 'flamePulse 2.8s ease-in-out infinite alternate' : 'none',
          }}
        />

        {/* Overlay Canvas for Rising Pixel Sparks and Embers */}
        <canvas
          ref={sparkCanvasRef}
          width={160}
          height={160}
          className="absolute inset-0 w-full h-full pointer-events-none image-pixelated"
        />
      </div>

      {/* Discreet Quick Action Overlay (Upload GIF or Reset to Default) */}
      {isHovered && !isRunning && (
        <div className="absolute -top-3 flex items-center gap-2 bg-[#1b1429]/95 backdrop-blur-md border border-purple-500/30 rounded-xl px-3 py-1.5 shadow-xl text-xs font-mono text-purple-200 animate-in fade-in zoom-in-95 duration-150 z-30">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-sans font-medium transition-colors"
            title="Upload an animated GIF or pixel sprite from your computer"
          >
            <Upload size={13} />
            <span>Upload GIF</span>
          </button>

          {customGifUrl && onResetToDefault && (
            <button
              onClick={onResetToDefault}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 transition-colors"
              title="Reset to default campfire"
            >
              <RotateCcw size={12} />
              <span>Default</span>
            </button>
          )}
        </div>
      )}

      {/* Drag & Drop Hint Backdrop */}
      {isDragging && (
        <div className="absolute inset-0 rounded-3xl bg-amber-500/20 border-2 border-dashed border-amber-400 flex flex-col items-center justify-center p-4 backdrop-blur-xs z-30 pointer-events-none">
          <Upload size={32} className="text-amber-300 animate-bounce mb-2" />
          <span className="text-xs font-bold text-amber-200 font-sans">Drop your animated GIF here</span>
        </div>
      )}
    </div>
  );
};
