import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PixelCampfire } from './components/PixelCampfire';
import { AtmosphereBackground } from './components/AtmosphereBackground';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { TimeSettingsModal, TimerSettings } from './components/TimeSettingsModal';
import { StatsDrawer } from './components/StatsDrawer';
import { soundEngine } from './audio/soundEngine';
import { Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  brownNoiseAutoPlay: true,
  brownNoiseVolume: 0.5,
  crackleEnabled: true,
  crackleVolume: 0.35,
  atmosphereIntensity: 'balanced',
  soundChimeEnabled: true,
};

export default function App() {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    try {
      const saved = localStorage.getItem('emberfocus_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.focusDuration);
  const [totalDuration, setTotalDuration] = useState<number>(settings.focusDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emberfocus_sessions');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emberfocus_focus_mins');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Brown noise and crackle audio state
  const [brownNoiseActive, setBrownNoiseActive] = useState<boolean>(false);
  const [brownNoiseVolume, setBrownNoiseVolume] = useState<number>(settings.brownNoiseVolume);
  const [crackleActive, setCrackleActive] = useState<boolean>(false);
  const [crackleVolume, setCrackleVolume] = useState<number>(settings.crackleVolume);

  // Custom uploaded GIF or sprite
  const [customGifUrl, setCustomGifUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('emberfocus_custom_gif');
    } catch {
      return null;
    }
  });

  // Modals & UI toggles
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Zen auto-hide for mouse inactivity
  const [isMouseActive, setIsMouseActive] = useState<boolean>(true);
  const mouseTimeoutRef = useRef<number | null>(null);

  // Calculate session progress (0.0 to 1.0)
  const progress = totalDuration > 0
    ? Math.min(1.0, Math.max(0.0, (totalDuration - timeRemaining) / totalDuration))
    : 0.0;

  // Persist session stats
  useEffect(() => {
    localStorage.setItem('emberfocus_sessions', sessionCount.toString());
  }, [sessionCount]);

  useEffect(() => {
    localStorage.setItem('emberfocus_focus_mins', totalFocusMinutes.toString());
  }, [totalFocusMinutes]);

  useEffect(() => {
    localStorage.setItem('emberfocus_settings', JSON.stringify(settings));
  }, [settings]);

  // Audio volume sync
  useEffect(() => {
    soundEngine.setBrownNoiseVolume(brownNoiseVolume);
  }, [brownNoiseVolume]);

  useEffect(() => {
    soundEngine.setCampfireCrackleVolume(crackleVolume);
  }, [crackleVolume]);

  useEffect(() => {
    soundEngine.setSfxEnabled(settings.soundChimeEnabled);
  }, [settings.soundChimeEnabled]);

  // Main countdown timer interval
  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, mode]);

  // Handle completion of a session
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);

    // Play singing bowl completion chime
    if (settings.soundChimeEnabled) {
      soundEngine.playSessionEndChime();
    }

    // Celebration confetti
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ff4d4d', '#ff9f1a', '#fffa65', '#ff3838', '#c56cf0'],
      });
    } catch {
      // Ignore if confetti blocked
    }

    if (mode === 'focus') {
      const addedMinutes = Math.round(totalDuration / 60);
      setTotalFocusMinutes((m) => m + addedMinutes);
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);

      // Determine next break mode
      if (newSessionCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeRemaining(settings.longBreakDuration);
        setTotalDuration(settings.longBreakDuration);
      } else {
        setMode('shortBreak');
        setTimeRemaining(settings.shortBreakDuration);
        setTotalDuration(settings.shortBreakDuration);
      }

      // Auto start break if enabled
      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Break completed, switch back to focus
      setMode('focus');
      setTimeRemaining(settings.focusDuration);
      setTotalDuration(settings.focusDuration);

      if (settings.autoStartFocus) {
        setIsRunning(true);
      }
    }
  }, [mode, totalDuration, sessionCount, settings]);

  // Play / Pause toggle
  const togglePlay = () => {
    soundEngine.playClickSound();
    const nextState = !isRunning;
    setIsRunning(nextState);

    // If starting focus and brown noise auto-play is configured
    if (nextState && mode === 'focus' && settings.brownNoiseAutoPlay && !brownNoiseActive) {
      startBrownNoise();
    }
  };

  // Reset timer
  const handleReset = () => {
    soundEngine.playClickSound();
    setIsRunning(false);
    if (mode === 'focus') {
      setTimeRemaining(settings.focusDuration);
      setTotalDuration(settings.focusDuration);
    } else if (mode === 'shortBreak') {
      setTimeRemaining(settings.shortBreakDuration);
      setTotalDuration(settings.shortBreakDuration);
    } else {
      setTimeRemaining(settings.longBreakDuration);
      setTotalDuration(settings.longBreakDuration);
    }
  };

  // Skip to next session
  const handleSkip = () => {
    soundEngine.playClickSound();
    setIsRunning(false);
    if (mode === 'focus') {
      const isLong = (sessionCount + 1) % settings.longBreakInterval === 0;
      const nextMode = isLong ? 'longBreak' : 'shortBreak';
      const nextDuration = isLong ? settings.longBreakDuration : settings.shortBreakDuration;
      setMode(nextMode);
      setTimeRemaining(nextDuration);
      setTotalDuration(nextDuration);
    } else {
      setMode('focus');
      setTimeRemaining(settings.focusDuration);
      setTotalDuration(settings.focusDuration);
    }
  };

  // Direct custom time setting
  const handleSetTime = (newSeconds: number) => {
    setTimeRemaining(newSeconds);
    setTotalDuration(newSeconds);
    if (mode === 'focus') {
      setSettings((s) => ({ ...s, focusDuration: newSeconds }));
    }
  };

  // Select quick presets
  const handleSelectPreset = (preset: 'focus25' | 'deep50' | 'short5' | 'long15') => {
    soundEngine.playClickSound();
    setIsRunning(false);
    if (preset === 'focus25') {
      setMode('focus');
      const dur = 25 * 60;
      setTimeRemaining(dur);
      setTotalDuration(dur);
    } else if (preset === 'deep50') {
      setMode('focus');
      const dur = 50 * 60;
      setTimeRemaining(dur);
      setTotalDuration(dur);
    } else if (preset === 'short5') {
      setMode('shortBreak');
      const dur = 5 * 60;
      setTimeRemaining(dur);
      setTotalDuration(dur);
    } else if (preset === 'long15') {
      setMode('longBreak');
      const dur = 15 * 60;
      setTimeRemaining(dur);
      setTotalDuration(dur);
    }
  };

  // Brown noise controls
  const startBrownNoise = () => {
    soundEngine.startBrownNoise(brownNoiseVolume);
    setBrownNoiseActive(true);
    if (settings.crackleEnabled) {
      soundEngine.startCampfireCrackle(crackleVolume);
      setCrackleActive(true);
    }
  };

  const stopBrownNoise = () => {
    soundEngine.stopBrownNoise();
    soundEngine.stopCampfireCrackle();
    setBrownNoiseActive(false);
    setCrackleActive(false);
  };

  const toggleBrownNoise = () => {
    soundEngine.playClickSound();
    if (brownNoiseActive) {
      stopBrownNoise();
    } else {
      startBrownNoise();
    }
  };

  const toggleCrackle = () => {
    soundEngine.playClickSound();
    if (crackleActive) {
      soundEngine.stopCampfireCrackle();
      setCrackleActive(false);
    } else {
      soundEngine.startCampfireCrackle(crackleVolume);
      setCrackleActive(true);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        toggleBrownNoise();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, brownNoiseActive, mode, totalDuration]);

  // Mouse activity tracker for Zen auto-hide (like on the user's desk display)
  const handleMouseMove = () => {
    setIsMouseActive(true);
    if (mouseTimeoutRef.current !== null) {
      clearTimeout(mouseTimeoutRef.current);
    }
    if (isRunning) {
      mouseTimeoutRef.current = window.setTimeout(() => {
        setIsMouseActive(false);
      }, 3500);
    }
  };

  useEffect(() => {
    if (!isRunning) {
      setIsMouseActive(true);
    }
  }, [isRunning]);

  const handleUploadGif = (dataUrl: string) => {
    try {
      localStorage.setItem('emberfocus_custom_gif', dataUrl);
    } catch {
      // Storage quota exceeded or disabled
    }
    setCustomGifUrl(dataUrl);
    soundEngine.playClickSound();
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem('emberfocus_custom_gif');
    } catch {
      //
    }
    setCustomGifUrl(null);
    soundEngine.playClickSound();
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative w-screen h-screen overflow-hidden flex flex-col justify-between font-sans ${
        !isMouseActive && isRunning ? 'cursor-none' : ''
      }`}
    >
      {/* Dynamic Atmospheric Background that intensifies as session progresses */}
      <AtmosphereBackground
        progress={progress}
        isRunning={isRunning}
        intensityLevel={settings.atmosphereIntensity}
      />

      {/* Top Header Bar (Minimal, clean, unboxed metadata, compliant with 3-zone contract) */}
      <header
        className={`relative z-20 flex items-center justify-between px-6 py-4 transition-opacity duration-700 ${
          !isMouseActive && isRunning ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-silkscreen text-sm tracking-wider font-bold text-amber-300/90 whitespace-nowrap shrink-0">
            EMBERFOCUS
          </span>
        </div>

        {/* Zone 2: Navigation / Status indicators */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-purple-300/70 font-mono">
          <span>{Math.round(progress * 100)}% through session</span>
          <span aria-hidden="true">·</span>
          <span>{sessionCount} fires completed today</span>
        </div>

        {/* Zone 3: Quick Action (Audio toggle & Settings) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleBrownNoise}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              brownNoiseActive
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'bg-purple-950/40 border border-purple-500/20 text-purple-200 hover:bg-purple-900/40'
            }`}
            title="Toggle Brown Noise (B)"
          >
            {brownNoiseActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>Brown Noise {brownNoiseActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* Centerpiece: Campfire & Minimalist Digital Timer Display */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-6">
        {/* Pixel Campfire (Animated & Responsive) */}
        <PixelCampfire
          isRunning={isRunning}
          progress={progress}
          size={290}
          customGifUrl={customGifUrl}
          onUploadGif={handleUploadGif}
          onResetToDefault={handleResetToDefault}
          onClick={() => {
            if (!isRunning) togglePlay();
          }}
        />

        {/* Timer Display with direct click-to-edit and stepper shortcuts */}
        <div className="mt-2">
          <TimerDisplay
            timeRemaining={timeRemaining}
            totalDuration={totalDuration}
            mode={mode}
            isRunning={isRunning}
            onSetTime={handleSetTime}
            onReset={handleReset}
            sessionCount={sessionCount}
          />
        </div>
      </main>

      {/* Floating Bottom Controls (Fades smoothly in Zen / Inactivity mode) */}
      <footer
        className={`relative z-20 flex flex-col items-center pb-6 transition-all duration-700 ${
          !isMouseActive && isRunning
            ? 'opacity-0 translate-y-3 pointer-events-none'
            : 'opacity-100 translate-y-0'
        }`}
      >
        <Controls
          isRunning={isRunning}
          mode={mode}
          onTogglePlay={togglePlay}
          onReset={handleReset}
          onSkip={handleSkip}
          onSelectPreset={handleSelectPreset}
          brownNoiseActive={brownNoiseActive}
          onToggleBrownNoise={toggleBrownNoise}
          brownNoiseVolume={brownNoiseVolume}
          onChangeBrownNoiseVolume={setBrownNoiseVolume}
          crackleActive={crackleActive}
          onToggleCrackle={toggleCrackle}
          crackleVolume={crackleVolume}
          onChangeCrackleVolume={setCrackleVolume}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          isZenMode={!isMouseActive}
          onToggleZenMode={() => setIsMouseActive(!isMouseActive)}
        />
      </footer>

      {/* Settings Modal */}
      <TimeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        customGifUrl={customGifUrl}
        onUploadGif={handleUploadGif}
        onResetToDefault={handleResetToDefault}
        onSave={(newSettings) => {
          setSettings(newSettings);
          setBrownNoiseVolume(newSettings.brownNoiseVolume);
          setCrackleVolume(newSettings.crackleVolume);
          // If paused, apply new duration immediately
          if (!isRunning) {
            if (mode === 'focus') {
              setTimeRemaining(newSettings.focusDuration);
              setTotalDuration(newSettings.focusDuration);
            } else if (mode === 'shortBreak') {
              setTimeRemaining(newSettings.shortBreakDuration);
              setTotalDuration(newSettings.shortBreakDuration);
            } else {
              setTimeRemaining(newSettings.longBreakDuration);
              setTotalDuration(newSettings.longBreakDuration);
            }
          }
        }}
      />

      {/* Stats & Streak Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        completedSessions={sessionCount}
        totalFocusMinutes={totalFocusMinutes}
        streakDays={1}
        dailyGoal={4}
        onResetStats={() => {
          setSessionCount(0);
          setTotalFocusMinutes(0);
        }}
      />
    </div>
  );
}
