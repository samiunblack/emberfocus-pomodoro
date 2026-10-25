import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Check, X, RotateCcw } from 'lucide-react';

interface TimerDisplayProps {
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  mode: 'focus' | 'shortBreak' | 'longBreak';
  isRunning: boolean;
  onSetTime: (seconds: number) => void;
  onReset: () => void;
  sessionCount: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeRemaining,
  totalDuration,
  mode,
  isRunning,
  onSetTime,
  onReset,
  sessionCount,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');
  const [editSeconds, setEditSeconds] = useState('');
  const [showQuickAdjust, setShowQuickAdjust] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  useEffect(() => {
    if (isEditing) {
      setEditMinutes(minutes.toString());
      setEditSeconds(seconds.toString().padStart(2, '0'));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing, minutes, seconds]);

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const m = Math.max(0, parseInt(editMinutes, 10) || 0);
    const s = Math.max(0, Math.min(59, parseInt(editSeconds, 10) || 0));
    const newTotal = m * 60 + s;
    if (newTotal > 0) {
      onSetTime(newTotal);
    }
    setIsEditing(false);
  };

  const adjustTime = (deltaSeconds: number) => {
    const updated = Math.max(30, timeRemaining + deltaSeconds);
    onSetTime(updated);
  };

  const modeLabels: Record<string, string> = {
    focus: 'FOCUS SESSION',
    shortBreak: 'SHORT BREAK',
    longBreak: 'LONG BREAK',
  };

  const progressPercent = totalDuration > 0
    ? Math.min(100, Math.max(0, ((totalDuration - timeRemaining) / totalDuration) * 100))
    : 0;

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none group"
      onMouseEnter={() => !isRunning && setShowQuickAdjust(true)}
      onMouseLeave={() => setShowQuickAdjust(false)}
    >
      {/* Mode Tag */}
      <div className="flex items-center gap-2 mb-2 text-xs tracking-widest font-mono text-purple-300/70 uppercase">
        <span>{modeLabels[mode]}</span>
        {sessionCount > 0 && (
          <>
            <span aria-hidden="true" className="text-purple-400/40">·</span>
            <span className="text-amber-400/80 flex items-center gap-1 font-sans font-medium text-[11px]">
              {sessionCount} {sessionCount === 1 ? 'fire completed' : 'fires completed'}
            </span>
          </>
        )}
      </div>

      {/* Main Digital Clock in authentic retro pixel font (matching screenshot) */}
      {!isEditing ? (
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => !isRunning && setIsEditing(true)}
            className="group/timer relative px-4 py-1 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
            title={isRunning ? 'Timer active' : 'Click to set custom time'}
          >
            <span
              className="text-4xl md:text-5xl lg:text-6xl tracking-wider font-silkscreen font-bold text-white transition-all duration-300"
              style={{
                textShadow: isRunning
                  ? '0 0 20px rgba(255, 120, 50, 0.5), 0 0 40px rgba(220, 40, 100, 0.3)'
                  : '0 0 12px rgba(255, 255, 255, 0.25)',
              }}
            >
              {formattedMinutes}:{formattedSeconds}
            </span>

            {/* Subtle edit pencil hint on hover when paused */}
            {!isRunning && (
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover/timer:opacity-100 transition-opacity text-[10px] font-mono tracking-wide text-purple-300/60 whitespace-nowrap">
                Click to edit
              </span>
            )}
          </button>
        </div>
      ) : (
        /* Inline Time Edit Form */
        <form
          onSubmit={handleSaveEdit}
          className="flex items-center gap-2 bg-[#201734] border border-purple-500/30 rounded-xl px-4 py-2 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              min="0"
              max="180"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              className="w-16 bg-[#160f26] border border-purple-400/30 rounded-lg px-2 py-1 text-center font-silkscreen text-2xl text-amber-300 focus:outline-none focus:border-amber-400"
              placeholder="25"
            />
            <span className="font-silkscreen text-xl text-purple-300">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={editSeconds}
              onChange={(e) => setEditSeconds(e.target.value)}
              className="w-16 bg-[#160f26] border border-purple-400/30 rounded-lg px-2 py-1 text-center font-silkscreen text-2xl text-amber-300 focus:outline-none focus:border-amber-400"
              placeholder="00"
            />
          </div>
          <button
            type="submit"
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            title="Save"
          >
            <Check size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            title="Cancel"
          >
            <X size={18} />
          </button>
        </form>
      )}

      {/* Quick Stepper Bar (-5m, -1m, +1m, +5m) */}
      {!isEditing && showQuickAdjust && !isRunning && (
        <div className="flex items-center gap-1.5 mt-3 px-2 py-1 bg-[#1e1630]/80 backdrop-blur-md rounded-lg border border-purple-500/20 text-xs font-mono text-purple-200 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => adjustTime(-300)}
            disabled={timeRemaining <= 300}
            className="px-2 py-0.5 rounded hover:bg-purple-900/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Subtract 5 minutes"
          >
            -5m
          </button>
          <button
            onClick={() => adjustTime(-60)}
            disabled={timeRemaining <= 60}
            className="px-2 py-0.5 rounded hover:bg-purple-900/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Subtract 1 minute"
          >
            -1m
          </button>
          <span className="text-purple-500/50">|</span>
          <button
            onClick={() => adjustTime(60)}
            className="px-2 py-0.5 rounded hover:bg-purple-900/60 transition-colors"
            title="Add 1 minute"
          >
            +1m
          </button>
          <button
            onClick={() => adjustTime(300)}
            className="px-2 py-0.5 rounded hover:bg-purple-900/60 transition-colors"
            title="Add 5 minutes"
          >
            +5m
          </button>
        </div>
      )}

      {/* Minimalist Progress Line */}
      <div className="w-48 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
