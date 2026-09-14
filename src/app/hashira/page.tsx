'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, X, Play, RotateCcw } from 'lucide-react';

interface SakuraPetal {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  color: string;
  opacity: number;
}

interface DissolveCode {
  id: number;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export default function HashiraBadgeShowcase() {
  const [activeFrame, setActiveFrame] = useState<number>(3); // 1: Base, 2: Particles, 3: Idle, 4: Fold
  const [isAssemblyPlaying, setIsAssemblyPlaying] = useState<boolean>(false);
  const [assembledLetters, setAssembledLetters] = useState<string>('Hashira Coders');
  const [assembledCreated, setAssembledCreated] = useState<string>('CREATED BY');
  const [iconPop, setIconPop] = useState<boolean>(true);
  const [sparklePop, setSparklePop] = useState<boolean>(true);
  const [greenDotPop, setGreenDotPop] = useState<boolean>(true);
  const [closeBtnRed, setCloseBtnRed] = useState<boolean>(false);
  const [isPaperFolding, setIsPaperFolding] = useState<boolean>(false);
  const [dissolveSnippets, setDissolveSnippets] = useState<DissolveCode[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<SakuraPetal[]>([]);

  // Sakura Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const petals = petalsRef.current;
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.vAngle;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        if (p.y > canvas.height + 20 || p.x > canvas.width + 30) {
          petals.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Trigger Sakura Petal Sweep
  const spawnSakuraWave = (count = 35) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        petalsRef.current.push({
          x: -20,
          y: Math.random() * (canvas.height * 0.6),
          size: 6 + Math.random() * 8,
          vx: 2.5 + Math.random() * 3,
          vy: 1.2 + Math.random() * 1.8,
          angle: Math.random() * 360,
          vAngle: (Math.random() - 0.5) * 4,
          color: Math.random() > 0.4 ? '#ffb7c5' : '#f472b6',
          opacity: 0.6 + Math.random() * 0.4,
        });
      }, i * 35);
    }
  };

  // Assembly Sequence
  const playAssembly = () => {
    setIsAssemblyPlaying(true);
    setActiveFrame(2);
    setIsPaperFolding(false);
    setCloseBtnRed(false);
    setDissolveSnippets([]);

    // 1. Sakura petal sweep
    spawnSakuraWave(40);

    // 2. Hide everything initially
    setIconPop(false);
    setSparklePop(false);
    setGreenDotPop(false);
    setAssembledCreated('');
    setAssembledLetters('');

    // Pop icon after 300ms
    setTimeout(() => {
      setIconPop(true);
    }, 300);

    // Type "CREATED BY"
    const fullCreated = 'CREATED BY';
    const fullBrand = 'Hashira Coders';

    setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < fullCreated.length) {
          setAssembledCreated(fullCreated.slice(0, idx + 1));
          idx++;
        } else {
          clearInterval(interval);
          setGreenDotPop(true);
        }
      }, 45);
    }, 500);

    // Type "Hashira Coders" letter-by-letter with color wash
    setTimeout(() => {
      let bIdx = 0;
      const bInterval = setInterval(() => {
        if (bIdx < fullBrand.length) {
          setAssembledLetters(fullBrand.slice(0, bIdx + 1));
          bIdx++;
        } else {
          clearInterval(bInterval);
          // Sparkle burst
          setTimeout(() => {
            setSparklePop(true);
            setIsAssemblyPlaying(false);
            setActiveFrame(3); // Enter Idle state
          }, 200);
        }
      }, 55);
    }, 900);
  };

  // Paper-Fold Collapse & Code Snippet Dissolve
  const triggerPaperFold = () => {
    setActiveFrame(4);
    setCloseBtnRed(true);
    setIsPaperFolding(true);

    // Spawn burst of 40 floating code characters
    const chars = ['{', '}', '</>', '/>', 'const', 'fn', '=>', ';', '*', '01', 'div', 'class'];
    const colors = ['#c084fc', '#67e8f9', '#f43f5e', '#fbbf24', '#818cf8'];
    const snippets: DissolveCode[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      char: chars[i % chars.length],
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 5,
      vy: 1.5 + Math.random() * 4,
      color: colors[i % colors.length],
      size: 10 + Math.random() * 4,
    }));
    setDissolveSnippets(snippets);
  };

  const handleReset = () => {
    setActiveFrame(3);
    setIsPaperFolding(false);
    setCloseBtnRed(false);
    setIconPop(true);
    setSparklePop(true);
    setGreenDotPop(true);
    setAssembledCreated('CREATED BY');
    setAssembledLetters('Hashira Coders');
    setDissolveSnippets([]);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <style jsx global>{`
        @keyframes spectralShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .spectral-shimmer-text {
          background: linear-gradient(
            90deg,
            #4338ca 0%,
            #6366f1 20%,
            #ec4899 40%,
            #fbbf24 60%,
            #8b5cf6 80%,
            #4338ca 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: spectralShimmer 4s linear infinite;
        }

        @keyframes coolWhitePulseAura {
          0%, 100% {
            box-shadow: 0 12px 35px -5px rgba(255, 255, 255, 0.45),
                        0 0 25px 3px rgba(224, 231, 255, 0.6),
                        0 4px 6px -2px rgba(0, 0, 0, 0.08);
          }
          50% {
            box-shadow: 0 18px 50px -5px rgba(255, 255, 255, 0.75),
                        0 0 40px 8px rgba(199, 210, 254, 0.9),
                        0 6px 12px -2px rgba(0, 0, 0, 0.12);
          }
        }
        .cool-white-halo {
          animation: coolWhitePulseAura 3s ease-in-out infinite;
        }

        @keyframes paperFoldFull {
          0% {
            transform: perspective(700px) rotateX(0deg) rotateY(0deg) scale(1);
            clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
            opacity: 1;
          }
          35% {
            transform: perspective(700px) rotateX(30deg) rotateY(-20deg) scale(0.85);
            clip-path: polygon(15% 0%, 100% 12%, 85% 100%, 0% 88%);
            opacity: 0.95;
          }
          70% {
            transform: perspective(700px) rotateX(65deg) rotateY(-38deg) scale(0.6) translateY(20px);
            clip-path: polygon(30% 15%, 85% 25%, 70% 85%, 15% 75%);
            opacity: 0.7;
          }
          100% {
            transform: perspective(700px) rotateX(88deg) rotateY(-50deg) scale(0.15) translateY(55px);
            clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
            opacity: 0;
          }
        }
        .paper-fold-animation {
          animation: paperFoldFull 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: center center;
        }

        @keyframes gradientSwirlKey {
          0% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(35deg); }
          100% { filter: hue-rotate(0deg); }
        }
        .swirl-gradient-icon {
          animation: gradientSwirlKey 6s ease-in-out infinite;
        }

        @keyframes snippetFall {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.6); opacity: 0; }
        }
      `}</style>

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to LearnGraph</span>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono font-bold text-indigo-400">
            Hashira Coders Badge Lab
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-mono">Workspace:</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
            Dimly Lit Developer Suite
          </span>
        </div>
      </header>

      {/* Main Workspace Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Atmospheric Developer Workspace Lighting */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Ambient IDE Background Lines */}
        <div className="absolute inset-0 opacity-10 font-mono text-xs p-10 leading-loose select-none pointer-events-none overflow-hidden">
          <div>// Hashira Coders Component Architecture (image_10.png reference)</div>
          <div>interface BadgeProps &#123; mode: 'assembly' | 'idle' | 'fold'; &#125;</div>
          <div>export const SakuraEngine = new ParticleStream(&#123; petals: 40, drift: 2.5 &#125;);</div>
          <div>const spectralLightSweep = keyframes`0% &#123; bg-position: -200% &#125; 100% &#123; bg-position: 200% &#125;`;</div>
          <div>const origamiFold = new 3DTransform(&#123; perspective: 700, angleX: 88, angleY: -50 &#125;);</div>
          <div>return &lt;HashiraCodersBadge aura="cool-white" /&gt;;</div>
        </div>

        {/* The Visualizer Card Container */}
        <div className="relative w-full max-w-3xl bg-[#0d121f]/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10 flex flex-col items-center">
          {/* Card Header */}
          <div className="w-full flex items-center justify-between pb-6 mb-6 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="font-mono text-xs text-slate-400">
                src/components/HashiraCodersBadge.tsx
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                FRAME {activeFrame}: {activeFrame === 1 ? 'BASE' : activeFrame === 2 ? 'ASSEMBLY' : activeFrame === 3 ? 'IDLE GLOW' : 'PAPER-FOLD DISSOLVE'}
              </span>
            </div>
          </div>

          {/* Canvas & Interactive Badge Display Stage */}
          <div className="relative w-full h-64 flex items-center justify-center overflow-visible">
            {/* Canvas for Sakura Petals */}
            <canvas
              ref={canvasRef}
              width={700}
              height={260}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Drifting Translucent Code Particles around badge (Frame 2 & 3) */}
            {(activeFrame === 2 || activeFrame === 3) && (
              <div className="absolute inset-0 pointer-events-none z-10 font-mono text-[11px] text-indigo-400/50">
                <span className="absolute top-10 left-[26%] animate-pulse">&#123;</span>
                <span className="absolute top-8 left-[38%] opacity-60">/&gt;</span>
                <span className="absolute bottom-10 left-[25%] opacity-40">*</span>
                <span className="absolute bottom-6 left-[34%] opacity-50">&#125;</span>
                <span className="absolute top-10 right-[28%] opacity-60">&lt;/&gt;</span>
                <span className="absolute bottom-10 right-[25%] opacity-50">;</span>
                <span className="absolute top-20 right-[24%] opacity-40">()</span>
              </div>
            )}

            {/* BADGE WRAPPER */}
            <div className="relative z-20">
              {/* Origami Creases Overlay */}
              {isPaperFolding && (
                <>
                  <div className="absolute -top-3 left-[22%] w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[14px] border-b-white/95 filter drop-shadow-md z-30"></div>
                  <div className="absolute top-1 -left-3 w-0 h-0 border-t-[22px] border-t-transparent border-b-[22px] border-b-transparent border-r-[20px] border-r-slate-100 filter drop-shadow-md z-30"></div>
                </>
              )}

              {/* Main Badge Card */}
              <div
                className={`relative flex items-center space-x-3.5 bg-white text-slate-900 px-4 py-3 rounded-2xl border border-slate-100/90 shadow-2xl transition-all duration-300 select-none cursor-pointer ${
                  isPaperFolding
                    ? 'paper-fold-animation'
                    : activeFrame === 3
                    ? 'cool-white-halo'
                    : activeFrame === 2
                    ? 'shadow-indigo-500/20'
                    : 'shadow-md'
                }`}
                style={{ minWidth: '260px' }}
                onClick={triggerPaperFold}
              >
                {/* Left: Pink-to-Purple Gradient Code Icon Box */}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ec4899] via-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-purple-500/30 shrink-0 transition-transform duration-300 ${
                    iconPop ? 'scale-100' : 'scale-0'
                  } ${activeFrame === 3 ? 'swirl-gradient-icon' : ''}`}
                >
                  <span className="font-mono font-bold tracking-tighter">&lt;/&gt;</span>
                </div>

                {/* Middle: Text Block */}
                <div className="flex flex-col text-left flex-1 min-w-[130px]">
                  {/* Top Row: CREATED BY + Green Dot */}
                  <div className="flex items-center space-x-1.5 leading-none">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {assembledCreated}
                    </span>
                    {greenDotPop && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-400 animate-pulse"></span>
                    )}
                  </div>

                  {/* Bottom Row: Hashira Coders + Sparkle */}
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span
                      className={`text-sm font-black tracking-tight ${
                        activeFrame === 3 ? 'spectral-shimmer-text' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text text-transparent'
                      }`}
                    >
                      {assembledLetters}
                    </span>
                    {sparklePop && (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 opacity-95 transition-transform duration-200 hover:rotate-45" />
                    )}
                  </div>
                </div>

                {/* Right: Close 'X' Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerPaperFold();
                  }}
                  className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center w-6 h-6 shrink-0 ${
                    closeBtnRed
                      ? 'bg-rose-100 text-rose-500 border border-rose-200 shadow-xs'
                      : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Close badge (Fold & Dissolve)"
                  aria-label="Close badge"
                >
                  <X className={`w-3.5 h-3.5 ${closeBtnRed ? 'text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Resting Shadow Slot below the badge (Frame 1 from image_10.png) */}
              <div
                className={`w-4/5 mx-auto h-2.5 bg-slate-950/60 rounded-full blur-md mt-3 transition-opacity duration-300 ${
                  isPaperFolding ? 'opacity-0' : 'opacity-100'
                }`}
              ></div>

              {/* Dissolving Code Snippets Particle Cloud (Frame 4 from image_10.png) */}
              {isPaperFolding && (
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {dissolveSnippets.map((p) => (
                    <span
                      key={p.id}
                      className="absolute font-mono font-bold"
                      style={{
                        left: `calc(50% + ${p.x}px)`,
                        top: `calc(50% + ${p.y}px)`,
                        color: p.color,
                        fontSize: `${p.size}px`,
                        animation: 'snippetFall 0.85s ease-out forwards',
                        ['--dx' as any]: `${p.vx * 22}px`,
                        ['--dy' as any]: `${p.vy * 28}px`,
                      }}
                    >
                      {p.char}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Control Panel */}
          <div className="w-full pt-6 mt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={playAssembly}
                disabled={isAssemblyPlaying}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play Assembly</span>
              </button>

              <button
                onClick={triggerPaperFold}
                className="px-4 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-800/60 font-semibold text-xs transition-all flex items-center space-x-2"
              >
                <X className="w-3.5 h-3.5" />
                <span>Paper Fold & Dissolve</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center space-x-1.5"
                title="Reset Badge"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Frame Selector buttons matching image_10.png */}
            <div className="flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 px-2 font-mono">FRAMES:</span>
              <button
                onClick={() => {
                  handleReset();
                  setActiveFrame(1);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  activeFrame === 1 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                1: Base
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setActiveFrame(2);
                  spawnSakuraWave(15);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  activeFrame === 2 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                2: Particles
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setActiveFrame(3);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  activeFrame === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                3: Idle Glow
              </button>
              <button
                onClick={() => {
                  triggerPaperFold();
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  activeFrame === 4 ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                4: Fold
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
