'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const BAR_COUNT = 48;
const FFT_SIZE = 256;

export function AnthemPlayer(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAutoPlayedRef = useRef(false);
  const userPausedRef = useRef(false);
  const userHasInteractedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize Web Audio API
  const initAudio = useCallback((): void => {
    if (audioCtxRef.current || !audioRef.current) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.75;

    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  // Attempt to start playback (called by observer + user gesture unlock)
  const tryAutoPlay = useCallback((): void => {
    if (hasAutoPlayedRef.current) return;
    if (userPausedRef.current) return;
    if (!userHasInteractedRef.current) return;

    const audio = audioRef.current;
    if (!audio) return;

    // Check if the element is currently in view
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight + 200 && rect.bottom > -200;
    if (!inView) return;

    hasAutoPlayedRef.current = true;

    if (!audioCtxRef.current) {
      initAudio();
    }

    if (audioCtxRef.current?.state === 'suspended') {
      void audioCtxRef.current.resume();
    }

    audio.play().then(() => {
      setPlaying(true);
    }).catch(() => {
      hasAutoPlayedRef.current = false;
    });
  }, [initAudio]);

  // Track first user interaction on the page (unlocks audio in all browsers)
  useEffect(() => {
    function handleInteraction(): void {
      if (userHasInteractedRef.current) return;
      userHasInteractedRef.current = true;

      // If we're already in view, try autoplay now
      tryAutoPlay();

      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    }

    document.addEventListener('click', handleInteraction, { passive: true });
    document.addEventListener('touchstart', handleInteraction, { passive: true });
    document.addEventListener('keydown', handleInteraction, { passive: true });
    document.addEventListener('scroll', handleInteraction, { passive: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };
  }, [tryAutoPlay]);

  // IntersectionObserver: trigger autoplay when section scrolls into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        tryAutoPlay();
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [tryAutoPlay]);

  // Draw visualizer frame
  const draw = useCallback((): void => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    ctx.clearRect(0, 0, w, h);

    const innerRadius = 68;
    const maxBarHeight = 40;

    for (let i = 0; i < BAR_COUNT; i++) {
      const binIndex = Math.floor((i / BAR_COUNT) * (dataArray.length * 0.7));
      const value = dataArray[binIndex] ?? 0;
      const normalizedValue = value / 255;
      const barHeight = normalizedValue * maxBarHeight + 2;

      const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;

      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * (innerRadius + barHeight);
      const y2 = centerY + Math.sin(angle) * (innerRadius + barHeight);

      const intensity = Math.min(1, normalizedValue * 1.5);
      const r = Math.round(37 + (255 - 37) * intensity);
      const g = Math.round(99 + (255 - 99) * intensity);
      const b = Math.round(235 + (255 - 235) * intensity);
      const alpha = 0.4 + normalizedValue * 0.6;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(alpha)})`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    const avgEnergy = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length / 255;
    const glowRadius = 50 + avgEnergy * 30;
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, glowRadius);
    glowGradient.addColorStop(0, `rgba(37, 99, 235, ${String(avgEnergy * 0.3)})`);
    glowGradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  // Start/stop animation loop
  useEffect(() => {
    if (playing) {
      draw();
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, draw]);

  // Track progress + duration (handle already-loaded metadata)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // If metadata already loaded before this effect ran
    if (audio.readyState >= 1 && audio.duration > 0 && !Number.isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    function onTimeUpdate(): void {
      if (!audio) return;
      setProgress(audio.currentTime);
    }
    function onDurationChange(): void {
      if (!audio || Number.isNaN(audio.duration)) return;
      setDuration(audio.duration);
    }
    function onLoadedMetadata(): void {
      if (!audio || Number.isNaN(audio.duration)) return;
      setDuration(audio.duration);
    }
    function onEnded(): void {
      setPlaying(false);
    }

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  async function togglePlay(): Promise<void> {
    const audio = audioRef.current;
    if (!audio) return;

    userHasInteractedRef.current = true;

    if (!audioCtxRef.current) {
      initAudio();
    }

    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      userPausedRef.current = true;
    } else {
      await audio.play();
      setPlaying(true);
      userPausedRef.current = false;
      hasAutoPlayedRef.current = true;
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>): void {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m)}:${String(s).padStart(2, '0')}`;
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6">
      <audio ref={audioRef} src="/hawkleads-anthem.mp3" preload="auto" crossOrigin="anonymous" />

      {/* Visualizer + Logo */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="absolute inset-0"
        />

        <div className="relative z-10 flex flex-col items-center">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14 text-white"
          >
            <path d="M12 8L22 56" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M26 4L40 60" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            <path d="M44 12L50 52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <span className="mt-2 font-body font-bold text-white text-lg tracking-tight">
            HawkLeads
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 w-full max-w-[300px]">
        <p className="text-xs text-stone-light font-body tracking-wide uppercase">
          Strike First (HawkLeads Anthem)
        </p>

        <div className="flex items-center gap-4 w-full">
          <button
            type="button"
            onClick={() => void togglePlay()}
            aria-label={playing ? 'Pause' : 'Play'}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-fast hover:bg-paper focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
          >
            {playing ? (
              <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-ink ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-stone-light font-mono tabular-nums w-8 text-right">
              {formatTime(progress)}
            </span>
            <div
              className="flex-1 h-1 bg-white/20 rounded-sm cursor-pointer relative"
              onClick={handleSeek}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={progress}
              tabIndex={0}
            >
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-sm transition-[width] duration-100"
                style={{ width: duration > 0 ? `${String((progress / duration) * 100)}%` : '0%' }}
              />
            </div>
            <span className="text-[10px] text-stone-light font-mono tabular-nums w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
