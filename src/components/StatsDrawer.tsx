import React from 'react';
import { X, Flame, Trophy, Clock, Calendar } from 'lucide-react';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  completedSessions: number;
  totalFocusMinutes: number;
  streakDays: number;
  dailyGoal: number;
  onResetStats?: () => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({
  isOpen,
  onClose,
  completedSessions,
  totalFocusMinutes,
  streakDays,
  dailyGoal,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1a1429] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#160f24]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold tracking-wide text-white">Focus & Ember Stats</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#241a3a] border border-purple-500/20 rounded-xl p-3.5 text-center">
              <div className="flex items-center justify-center mb-1 text-amber-400">
                <Flame size={18} />
              </div>
              <div className="text-2xl font-bold font-silkscreen text-white">{completedSessions}</div>
              <div className="text-[11px] text-purple-300/70 mt-1">Fires Kept</div>
            </div>

            <div className="bg-[#241a3a] border border-purple-500/20 rounded-xl p-3.5 text-center">
              <div className="flex items-center justify-center mb-1 text-purple-400">
                <Clock size={18} />
              </div>
              <div className="text-2xl font-bold font-silkscreen text-white">{timeFormatted}</div>
              <div className="text-[11px] text-purple-300/70 mt-1">Focus Time</div>
            </div>

            <div className="bg-[#241a3a] border border-purple-500/20 rounded-xl p-3.5 text-center">
              <div className="flex items-center justify-center mb-1 text-rose-400">
                <Calendar size={18} />
              </div>
              <div className="text-2xl font-bold font-silkscreen text-white">{streakDays}d</div>
              <div className="text-[11px] text-purple-300/70 mt-1">Day Streak</div>
            </div>
          </div>

          {/* Daily Goal Visualizer */}
          <div className="bg-[#201734] border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs font-medium mb-3 text-purple-200">
              <span>Daily Goal Progress</span>
              <span className="font-mono text-amber-400">
                {completedSessions} / {dailyGoal} fires
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              {Array.from({ length: dailyGoal }).map((_, idx) => {
                const isLit = idx < completedSessions;
                return (
                  <div
                    key={idx}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all ${
                      isLit
                        ? 'border-amber-400/50 bg-amber-500/20 text-amber-300 shadow-sm shadow-amber-500/30'
                        : 'border-purple-500/20 bg-[#160f24] text-purple-400/30'
                    }`}
                  >
                    <Flame
                      size={20}
                      className={isLit ? 'animate-pulse text-amber-400' : 'text-slate-600'}
                    />
                    <span className="text-[10px] font-mono mt-1">#{idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivation Quote */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 rounded-xl border border-amber-500/20 text-xs text-purple-200/90 leading-relaxed italic text-center">
            &ldquo;Keep the flame alive through patient focus. One ember at a time builds the warmest hearth.&rdquo;
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-purple-500/20 bg-[#160f24]">
          {onResetStats ? (
            <button
              onClick={onResetStats}
              className="text-xs text-rose-400/80 hover:text-rose-300 transition-colors"
            >
              Reset Today
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
