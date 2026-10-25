import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  Maximize2,
  Minimize2,
  Flame,
  Coffee,
  Trophy,
} from 'lucide-react';

interface ControlsProps {
  isRunning: boolean;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  onTogglePlay: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSelectPreset: (preset: 'focus25' | 'deep50' | 'short5' | 'long15') => void;
  brownNoiseActive: boolean;
  onToggleBrownNoise: () => void;
  brownNoiseVolume: number;
  onChangeBrownNoiseVolume: (v: number) => void;
  crackleActive: boolean;
  onToggleCrackle: () => void;
  crackleVolume: number;
  onChangeCrackleVolume: (v: number) => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  mode,
  onTogglePlay,
  onReset,
  onSkip,
  onSelectPreset,
  brownNoiseActive,
  onToggleBrownNoise,
  brownNoiseVolume,
  onChangeBrownNoiseVolume,
  crackleActive,
  onToggleCrackle,
  crackleVolume,
  onChangeCrackleVolume,
  onOpenSettings,
  onOpenStats,
  isFullscreen,
  onToggleFullscreen,
  isZenMode,
  onToggleZenMode,
}) => {
  const [showAudioPopover, setShowAudioPopover] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl px-4 pointer-events-auto">
      {/* Preset Mode Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#1c152c]/80 backdrop-blur-md border border-purple-500/20 rounded-xl shadow-lg">
        <button
          onClick={() => onSelectPreset('focus25')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'focus'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'text-purple-300/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame size={14} className={mode === 'focus' ? 'text-slate-950' : 'text-amber-400'} />
          <span>Focus (25m)</span>
        </button>

        <button
          onClick={() => onSelectPreset('deep50')}
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-300/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <span>Deep (50m)</span>
        </button>

        <button
          onClick={() => onSelectPreset('short5')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'shortBreak'
              ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
              : 'text-purple-300/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <Coffee size={14} className={mode === 'shortBreak' ? 'text-slate-950' : 'text-emerald-400'} />
          <span>Short (5m)</span>
        </button>

        <button
          onClick={() => onSelectPreset('long15')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'longBreak'
              ? 'bg-blue-500 text-slate-950 font-semibold shadow-sm'
              : 'text-purple-300/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Long (15m)</span>
        </button>
      </div>

      {/* Main Interactive Controls Island */}
      <div className="relative flex items-center justify-between gap-3 px-5 py-2.5 bg-[#1a1329]/90 backdrop-blur-xl border border-purple-500/25 rounded-2xl shadow-2xl">
        {/* Reset button */}
        <button
          onClick={onReset}
          className="p-2.5 rounded-xl text-purple-300/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          title="Reset Timer (R)"
        >
          <RotateCcw size={18} />
        </button>

        {/* Primary Play / Pause Button */}
        <button
          onClick={onTogglePlay}
          className={`relative group/play flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isRunning
              ? 'bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-rose-900/40 hover:from-rose-400 hover:to-amber-500'
              : 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-amber-600/30 hover:from-amber-300 hover:to-orange-400'
          }`}
          title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
        >
          {isRunning ? (
            <Pause size={24} className="fill-current" />
          ) : (
            <Play size={24} className="fill-current ml-1" />
          )}

          {/* Glowing pulse ring when running */}
          {isRunning && (
            <span className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-ping -z-10 pointer-events-none" />
          )}
        </button>

        {/* Skip to Next Session */}
        <button
          onClick={onSkip}
          className="p-2.5 rounded-xl text-purple-300/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          title="Skip to next session"
        >
          <SkipForward size={18} />
        </button>

        {/* Vertical divider */}
        <div className="w-px h-6 bg-purple-500/30 mx-1" />

        {/* Brown Noise audio toggle & popover */}
        <div className="relative">
          <button
            onClick={() => {
              onToggleBrownNoise();
              setShowAudioPopover(true);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowAudioPopover(!showAudioPopover);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              brownNoiseActive
                ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm shadow-amber-500/20'
                : 'text-purple-300/70 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Brown Noise (B) — Right-click or click to adjust volume"
          >
            {brownNoiseActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline font-mono">Brown Noise</span>
          </button>

          {/* Quick Audio Volume Slider Popover */}
          {showAudioPopover && (
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-[#1f1731] border border-purple-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md z-40 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-purple-200">Brown Noise Volume</span>
                <span className="font-mono text-amber-400">{Math.round(brownNoiseVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(brownNoiseVolume * 100)}
                onChange={(e) => onChangeBrownNoiseVolume(parseInt(e.target.value, 10) / 100)}
                className="w-full accent-amber-500 bg-[#2d1f46] rounded-lg h-2 cursor-pointer mb-3"
              />

              {/* Campfire crackle quick toggle */}
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs">
                <span className="text-purple-300/80">Campfire Crackle</span>
                <button
                  onClick={onToggleCrackle}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    crackleActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-white/10 text-purple-300 hover:text-white'
                  }`}
                >
                  {crackleActive ? 'ON' : 'OFF'}
                </button>
              </div>

              {crackleActive && (
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(crackleVolume * 100)}
                    onChange={(e) => onChangeCrackleVolume(parseInt(e.target.value, 10) / 100)}
                    className="w-full accent-amber-500 bg-[#2d1f46] rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              )}

              <button
                onClick={() => setShowAudioPopover(false)}
                className="w-full mt-3 py-1 bg-white/5 hover:bg-white/10 text-[11px] text-purple-300 rounded transition-colors text-center"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Stats button */}
        <button
          onClick={onOpenStats}
          className="p-2 rounded-xl text-purple-300/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          title="Daily Stats & Streaks"
        >
          <Trophy size={16} />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-purple-300/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          title="Settings & Time Customization (S)"
        >
          <Sliders size={16} />
        </button>

        {/* Fullscreen toggle button */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl text-purple-300/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          title="Toggle Fullscreen (F)"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-purple-300/50">
        <span>Space: Start/Pause</span>
        <span aria-hidden="true">·</span>
        <span>R: Reset</span>
        <span aria-hidden="true">·</span>
        <span>B: Brown Noise</span>
        <span aria-hidden="true">·</span>
        <span>F: Fullscreen</span>
      </div>
    </div>
  );
};
