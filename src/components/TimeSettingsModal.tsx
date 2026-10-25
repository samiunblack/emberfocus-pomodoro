import React, { useState } from 'react';
import { X, Volume2, Flame, Bell, Sparkles, Sliders } from 'lucide-react';

export interface TimerSettings {
  focusDuration: number; // in seconds
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // e.g. every 4 sessions
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  brownNoiseAutoPlay: boolean;
  brownNoiseVolume: number;
  crackleEnabled: boolean;
  crackleVolume: number;
  atmosphereIntensity: 'subtle' | 'balanced' | 'vivid';
  soundChimeEnabled: boolean;
}

interface TimeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSave: (newSettings: TimerSettings) => void;
  customGifUrl?: string | null;
  onUploadGif?: (dataUrl: string) => void;
  onResetToDefault?: () => void;
}

export const TimeSettingsModal: React.FC<TimeSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  customGifUrl,
  onUploadGif,
  onResetToDefault,
}) => {
  const [localSettings, setLocalSettings] = useState<TimerSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'time' | 'audio' | 'atmosphere'>('time');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const focusMinutes = Math.floor(localSettings.focusDuration / 60);
  const shortBreakMinutes = Math.floor(localSettings.shortBreakDuration / 60);
  const longBreakMinutes = Math.floor(localSettings.longBreakDuration / 60);

  const focusPresets = [15, 20, 25, 30, 45, 50, 60];
  const shortBreakPresets = [3, 5, 8, 10];
  const longBreakPresets = [10, 15, 20, 30];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1a1429] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#160f24]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold tracking-wide text-white">Timer & Atmosphere Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-500/20 bg-[#130d20] px-6">
          <button
            onClick={() => setActiveTab('time')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'time'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={14} />
            Durations & Sessions
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audio'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 size={14} />
            Brown Noise & Audio
          </button>
          <button
            onClick={() => setActiveTab('atmosphere')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'atmosphere'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} />
            Fire & Atmosphere
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'time' && (
            <div className="space-y-6">
              {/* Focus Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-purple-200">Focus Duration</label>
                  <span className="font-mono text-sm font-semibold text-amber-400">{focusMinutes} minutes</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {focusPresets.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLocalSettings((s) => ({ ...s, focusDuration: mins * 60 }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        focusMinutes === mins
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-[#251b3a] text-purple-200 hover:bg-[#32244d]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={focusMinutes}
                  onChange={(e) =>
                    setLocalSettings((s) => ({ ...s, focusDuration: parseInt(e.target.value, 10) * 60 }))
                  }
                  className="w-full accent-amber-500 bg-[#2b1f42] rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Short Break */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-purple-200">Short Break</label>
                  <span className="font-mono text-sm font-semibold text-emerald-400">{shortBreakMinutes} minutes</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {shortBreakPresets.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLocalSettings((s) => ({ ...s, shortBreakDuration: mins * 60 }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        shortBreakMinutes === mins
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-[#251b3a] text-purple-200 hover:bg-[#32244d]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={shortBreakMinutes}
                  onChange={(e) =>
                    setLocalSettings((s) => ({ ...s, shortBreakDuration: parseInt(e.target.value, 10) * 60 }))
                  }
                  className="w-full accent-emerald-500 bg-[#2b1f42] rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Long Break */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-purple-200">Long Break</label>
                  <span className="font-mono text-sm font-semibold text-blue-400">{longBreakMinutes} minutes</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {longBreakPresets.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLocalSettings((s) => ({ ...s, longBreakDuration: mins * 60 }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        longBreakMinutes === mins
                          ? 'bg-blue-500 text-slate-950 font-bold'
                          : 'bg-[#251b3a] text-purple-200 hover:bg-[#32244d]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={longBreakMinutes}
                  onChange={(e) =>
                    setLocalSettings((s) => ({ ...s, longBreakDuration: parseInt(e.target.value, 10) * 60 }))
                  }
                  className="w-full accent-blue-500 bg-[#2b1f42] rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Long Break Interval */}
              <div className="pt-2 border-t border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-purple-200">Long Break Interval</div>
                    <div className="text-xs text-purple-300/60">Number of sessions before long break</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setLocalSettings((s) => ({ ...s, longBreakInterval: num }))}
                        className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-colors ${
                          localSettings.longBreakInterval === num
                            ? 'bg-purple-500 text-white'
                            : 'bg-[#251b3a] text-purple-300 hover:bg-[#32244d]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Brown Noise Volume */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-purple-200">Brown Noise Volume</label>
                  <span className="font-mono text-sm font-semibold text-amber-400">
                    {Math.round(localSettings.brownNoiseVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(localSettings.brownNoiseVolume * 100)}
                  onChange={(e) =>
                    setLocalSettings((s) => ({
                      ...s,
                      brownNoiseVolume: parseInt(e.target.value, 10) / 100,
                    }))
                  }
                  className="w-full accent-amber-500 bg-[#2b1f42] rounded-lg h-2 cursor-pointer"
                />
                <p className="mt-2 text-xs text-purple-300/60 leading-relaxed">
                  Brown Noise features continuous low-frequency spectral roll-off, masking distractions and fostering deep cognitive flow.
                </p>
              </div>

              {/* Campfire Wood Crackle Layer */}
              <div className="pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-purple-200">Campfire Crackle Layer</div>
                    <div className="text-xs text-purple-300/60">Gentle procedural wood pops and ember snaps</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.crackleEnabled}
                    onChange={(e) =>
                      setLocalSettings((s) => ({ ...s, crackleEnabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>
                {localSettings.crackleEnabled && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-purple-300/70 mb-1">
                      <span>Crackle Volume</span>
                      <span>{Math.round(localSettings.crackleVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(localSettings.crackleVolume * 100)}
                      onChange={(e) =>
                        setLocalSettings((s) => ({
                          ...s,
                          crackleVolume: parseInt(e.target.value, 10) / 100,
                        }))
                      }
                      className="w-full accent-amber-500 bg-[#2b1f42] rounded-lg h-2 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Brown noise auto-play */}
              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-200">Auto-Play with Focus Session</div>
                  <div className="text-xs text-purple-300/60">Start Brown noise automatically when you hit Play</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.brownNoiseAutoPlay}
                  onChange={(e) =>
                    setLocalSettings((s) => ({ ...s, brownNoiseAutoPlay: e.target.checked }))
                  }
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Meditation chime bell */}
              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-200">Session Completion Chime</div>
                  <div className="text-xs text-purple-300/60">Play soft singing bowl tone when session finishes</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.soundChimeEnabled}
                  onChange={(e) =>
                    setLocalSettings((s) => ({ ...s, soundChimeEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'atmosphere' && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-purple-200 block mb-2">
                  Atmospheric Glow Intensity
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['subtle', 'balanced', 'vivid'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setLocalSettings((s) => ({ ...s, atmosphereIntensity: level }))
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        localSettings.atmosphereIntensity === level
                          ? 'border-amber-400 bg-amber-500/10 text-white'
                          : 'border-purple-500/20 bg-[#251b3a] text-purple-300/70 hover:bg-[#32244d]'
                      }`}
                    >
                      <div className="text-xs font-semibold capitalize mb-1">{level}</div>
                      <div className="text-[11px] text-purple-300/60">
                        {level === 'subtle' && 'Gentle warm twilight glow'}
                        {level === 'balanced' && 'Natural campfire illumination'}
                        {level === 'vivid' && 'Rich vibrant ember radiance'}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-purple-300/60 leading-relaxed">
                  As your session ticks forward, the campfire light naturally expands and warms the background, giving visual feedback of your deep work progress.
                </p>
              </div>

              {/* Campfire Sprite / GIF Upload */}
              <div className="pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-sm font-medium text-purple-200 block">Campfire Visual Asset</label>
                    <span className="text-xs text-purple-300/60">
                      {customGifUrl ? 'Using your custom uploaded GIF' : 'Using default pixel campfire sprite'}
                    </span>
                  </div>
                  {customGifUrl && onResetToDefault && (
                    <button
                      type="button"
                      onClick={onResetToDefault}
                      className="text-xs text-purple-300 hover:text-white underline transition-colors"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 bg-[#241a3a] p-3 rounded-xl border border-purple-500/20">
                  <div className="w-16 h-16 bg-[#160f24] rounded-lg overflow-hidden flex items-center justify-center p-1 border border-purple-500/30">
                    <img
                      src={customGifUrl || '/assets/aistudio/image_23eb3ae0.png'}
                      alt="Campfire preview"
                      className="w-full h-full object-contain image-pixelated"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-sm">
                      <span>Upload Animated GIF</span>
                      <input
                        type="file"
                        accept="image/gif,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0] && onUploadGif) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const result = ev.target?.result as string;
                              if (result) onUploadGif(result);
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-purple-300/60 mt-1">
                      You can also drag & drop any .gif file directly onto the campfire.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-purple-500/20 bg-[#160f24]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
