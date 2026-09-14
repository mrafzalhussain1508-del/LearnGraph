'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, RotateCcw, Play, Maximize2 } from 'lucide-react';

interface Particle {
  id: number;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

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

export default function HashiraCodersBadge() {
  const pathname = usePathname();
  const isTeacherRoute = Boolean(pathname?.startsWith('/teacher'));
  const isStudentGuideRoute = Boolean(
    pathname?.startsWith('/student') || pathname?.startsWith('/student-study-guide')
  );
  const isAutoExitRoute = isTeacherRoute || isStudentGuideRoute;

  // Exit animation phases for Teacher Dashboard & Student Study Guide:
  // 'visible': normal or initial view before exit
  // 'animating-out': smooth slide-up + fade-out transition active
  // 'hidden': fully transitioned and removed (display: none)
  const [badgeExitPhase, setBadgeExitPhase] = useState<'visible' | 'animating-out' | 'hidden'>('visible');

  // Corner Badge States
  const [isAssembled, setIsAssembled] = useState(false);
  const [isFolding, setIsFolding] = useState(false);
  const [isDissolved, setIsDissolved] = useState(false);
  const [dissolveParticles, setDissolveParticles] = useState<Particle[]>([]);

  // Studio Modal Tab State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFrame, setActiveFrame] = useState<number>(3); // 1: Base, 2: Particles, 3: Idle, 4: Fold
  const [isAssemblyPlaying, setIsAssemblyPlaying] = useState<boolean>(false);
  const [assembledLetters, setAssembledLetters] = useState<string>('Hashira Coders');
  const [assembledCreated, setAssembledCreated] = useState<string>('CREATED BY');
  const [iconPop, setIconPop] = useState<boolean>(true);
  const [sparklePop, setSparklePop] = useState<boolean>(true);
  const [greenDotPop, setGreenDotPop] = useState<boolean>(true);
  const [closeBtnRed, setCloseBtnRed] = useState<boolean>(false);
  const [modalPaperFolding, setModalPaperFolding] = useState<boolean>(false);
  const [modalDissolveSnippets, setModalDissolveSnippets] = useState<DissolveCode[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<SakuraPetal[]>([]);

  // Auto-exit animation controller for Teacher Dashboard & Student Study Guide
  useEffect(() => {
    if (!isAutoExitRoute) {
      setBadgeExitPhase('visible');
      return;
    }

    // Auto-close modal if user is on dashboard views
    setIsModalOpen(false);

    // If already fully hidden, maintain persistent hidden state
    if (badgeExitPhase === 'hidden') return;

    // Trigger smooth fade-out / slide-out after a brief 350ms window
    // so the active view is loaded before animating
    const exitTimer = setTimeout(() => {
      setBadgeExitPhase('animating-out');
    }, 350);

    // Complete exit transition after 750ms duration (total 1100ms from start)
    const hiddenTimer = setTimeout(() => {
      setBadgeExitPhase('hidden');
    }, 1100);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hiddenTimer);
    };
  }, [isAutoExitRoute]);

  // On mount: trigger corner badge assembly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAssembled(true);
    }, isAutoExitRoute ? 50 : 300);
    return () => clearTimeout(timer);
  }, [isAutoExitRoute]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Sakura Canvas Animation Loop for Modal
  useEffect(() => {
    if (!isModalOpen) return;
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
  }, [isModalOpen]);

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

  // Modal Assembly Sequence
  const playAssembly = () => {
    setIsAssemblyPlaying(true);
    setActiveFrame(2);
    setModalPaperFolding(false);
    setCloseBtnRed(false);
    setModalDissolveSnippets([]);

    spawnSakuraWave(40);

    setIconPop(false);
    setSparklePop(false);
    setGreenDotPop(false);
    setAssembledCreated('');
    setAssembledLetters('');

    setTimeout(() => {
      setIconPop(true);
    }, 300);

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
      }, 40);
    }, 500);

    setTimeout(() => {
      let bIdx = 0;
      const bInterval = setInterval(() => {
        if (bIdx < fullBrand.length) {
          setAssembledLetters(fullBrand.slice(0, bIdx + 1));
          bIdx++;
        } else {
          clearInterval(bInterval);
          setTimeout(() => {
            setSparklePop(true);
            setIsAssemblyPlaying(false);
            setActiveFrame(3);
          }, 200);
        }
      }, 50);
    }, 900);
  };

  // Modal Paper-Fold & Code Dissolve
  const triggerModalPaperFold = () => {
    setActiveFrame(4);
    setCloseBtnRed(true);
    setModalPaperFolding(true);

    const chars = ['{', '}', '</>', '/>', 'const', 'fn', '=>', ';', '*', '01', 'div'];
    const colors = ['#c084fc', '#67e8f9', '#f43f5e', '#fbbf24', '#818cf8'];
    const snippets: DissolveCode[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      char: chars[i % chars.length],
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 5,
      vy: 1.5 + Math.random() * 4,
      color: colors[i % colors.length],
      size: 10 + Math.random() * 4,
    }));
    setModalDissolveSnippets(snippets);
  };

  const handleModalReset = () => {
    setActiveFrame(3);
    setModalPaperFolding(false);
    setCloseBtnRed(false);
    setIconPop(true);
    setSparklePop(true);
    setGreenDotPop(true);
    setAssembledCreated('CREATED BY');
    setAssembledLetters('Hashira Coders');
    setModalDissolveSnippets([]);
  };

  // Corner Badge Close Action
  const handleCornerClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFolding(true);

    const snippetChars = ['{', '}', '</>', '/>', 'const', 'fn', '=>', ';', '*', '01'];
    const colors = ['#c084fc', '#67e8f9', '#f43f5e', '#fbbf24', '#818cf8'];
    const particles: Particle[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      char: snippetChars[i % snippetChars.length],
      x: (Math.random() - 0.5) * 140,
      y: (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 4,
      vy: 1.5 + Math.random() * 3.5,
      color: colors[i % colors.length]
    }));
    setDissolveParticles(particles);

    setTimeout(() => {
      setIsDissolved(true);
      setIsFolding(false);
    }, 850);
  };

  const handleCornerRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDissolved(false);
    setIsFolding(false);
    setIsAssembled(true);
    setDissolveParticles([]);
  };

  return (
    <>
      {/* Corner Floating Badge */}
      <aside
        aria-label="Created by Hashira Coders"
        aria-hidden={badgeExitPhase === 'hidden'}
        style={{
          display: badgeExitPhase === 'hidden' ? 'none' : undefined,
          opacity: badgeExitPhase === 'animating-out' ? 0 : undefined,
          transform:
            badgeExitPhase === 'animating-out'
              ? 'translate(-28px, -24px) scale(0.92)'
              : undefined,
          filter: badgeExitPhase === 'animating-out' ? 'blur(3px)' : undefined,
          pointerEvents:
            badgeExitPhase === 'animating-out' || badgeExitPhase === 'hidden'
              ? 'none'
              : undefined,
          transition:
            badgeExitPhase === 'animating-out'
              ? 'opacity 750ms cubic-bezier(0.16, 1, 0.3, 1), transform 750ms cubic-bezier(0.16, 1, 0.3, 1), filter 750ms cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 300ms ease, opacity 300ms ease',
        }}
        className={`fixed top-18 sm:top-20 left-2 sm:left-6 z-40 font-sans print:hidden select-none scale-[0.85] sm:scale-100 origin-top-left ${
          badgeExitPhase === 'hidden' ? 'hidden' : ''
        }`}
      >
        <style jsx>{`
          @keyframes spectralSweep {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .spectral-text {
            background: linear-gradient(
              90deg,
              #4338ca 0%,
              #6366f1 25%,
              #ec4899 50%,
              #fbbf24 75%,
              #8b5cf6 90%,
              #4338ca 100%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: spectralSweep 4s linear infinite;
          }

          @keyframes coolWhiteGlow {
            0%, 100% {
              box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.4),
                          0 0 20px 2px rgba(224, 231, 255, 0.6),
                          0 4px 6px -2px rgba(0, 0, 0, 0.08);
            }
            50% {
              box-shadow: 0 14px 35px -5px rgba(255, 255, 255, 0.7),
                          0 0 30px 6px rgba(199, 210, 254, 0.9),
                          0 6px 12px -2px rgba(0, 0, 0, 0.12);
            }
          }
          .cool-white-aura {
            animation: coolWhiteGlow 3.5s ease-in-out infinite;
          }

          @keyframes paperFoldCollapse {
            0% {
              transform: perspective(600px) rotateX(0deg) rotateY(0deg) scale(1);
              clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
              opacity: 1;
            }
            40% {
              transform: perspective(600px) rotateX(30deg) rotateY(-20deg) scale(0.85);
              clip-path: polygon(20% 0%, 100% 15%, 80% 100%, 0% 85%);
              opacity: 0.9;
            }
            100% {
              transform: perspective(600px) rotateX(85deg) rotateY(-45deg) scale(0.2) translateY(40px);
              clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
              opacity: 0;
            }
          }
          .paper-folding-anim {
            animation: paperFoldCollapse 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            transform-origin: center center;
          }

          @keyframes gradientSwirl {
            0% { filter: hue-rotate(0deg); }
            50% { filter: hue-rotate(30deg); }
            100% { filter: hue-rotate(0deg); }
          }
          .swirl-icon {
            animation: gradientSwirl 5s ease-in-out infinite;
          }

          @keyframes floatSnippet {
            0% { transform: translate(0, 0); opacity: 1; }
            100% { transform: translate(var(--vx), var(--vy)); opacity: 0; }
          }
        `}</style>

        {isDissolved ? (
          <button
            onClick={handleCornerRestore}
            className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700/60 backdrop-blur-md transition-all text-xs font-bold hover:scale-105 group"
            title="Click to restore: Created by Hashira Coders"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-rose-300 bg-clip-text text-transparent">
              Hashira Coders
            </span>
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        ) : (
          <div className="relative group">
            {/* Click to Open Modal Hint Tooltip */}
            <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/90 text-[10px] text-slate-300 px-2.5 py-1 rounded-md shadow-md whitespace-nowrap border border-slate-800">
              Click to open Hashira Coders Studio ⚡
            </div>

            {/* Main Clickable Badge Card */}
            <div
              onClick={() => {
                handleModalReset();
                setIsModalOpen(true);
              }}
              className={`relative flex items-center space-x-3.5 bg-white dark:bg-slate-900/95 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-2xl border border-slate-100/80 dark:border-slate-800 transition-all duration-300 select-none shadow-xl cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${
                isFolding ? 'paper-folding-anim' : isAssembled ? 'cool-white-aura' : 'opacity-0 scale-90'
              }`}
              style={{ minWidth: '250px' }}
              title="Click to open Hashira Coders Workspace Studio"
            >
              {isFolding && (
                <>
                  <div className="absolute -top-3 left-1/4 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[12px] border-b-white/95 dark:border-b-slate-900/95 filter drop-shadow-sm"></div>
                  <div className="absolute top-1 -left-3 w-0 h-0 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent border-r-[16px] border-r-slate-100 dark:border-r-slate-800 filter drop-shadow-sm"></div>
                </>
              )}

              {/* Left: Gradient Code Icon */}
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ec4899] via-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-purple-500/25 shrink-0 transition-transform duration-300 group-hover:rotate-6 ${
                  isAssembled ? 'swirl-icon' : ''
                }`}
              >
                <span className="font-mono font-bold tracking-tighter">&lt;/&gt;</span>
              </div>

              {/* Middle: Text */}
              <div className="flex flex-col text-left flex-1 min-w-[120px]">
                <div className="flex items-center space-x-1.5 leading-none">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    CREATED BY
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400 animate-pulse"></span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="text-sm font-black tracking-tight spectral-text">
                    Hashira Coders
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 opacity-95" />
                </div>
              </div>

              {/* Right: Close 'X' Button */}
              <button
                onClick={handleCornerClose}
                className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center w-6 h-6 shrink-0 ${
                  isFolding
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-500 border border-rose-200 dark:border-rose-800/60 shadow-sm'
                    : 'text-slate-300 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Close badge"
                aria-label="Close badge"
              >
                <X className={`w-3.5 h-3.5 ${isFolding ? 'text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Corner Dissolve Snippets */}
            {isFolding && (
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {dissolveParticles.map((p) => (
                  <span
                    key={p.id}
                    className="absolute font-mono text-[10px] font-bold"
                    style={{
                      left: `calc(50% + ${p.x}px)`,
                      top: `calc(50% + ${p.y}px)`,
                      color: p.color,
                      animation: 'floatSnippet 0.8s ease-out forwards',
                      ['--vx' as any]: `${p.vx * 20}px`,
                      ['--vy' as any]: `${p.vy * 25}px`,
                    }}
                  >
                    {p.char}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* INTERACTIVE WORKSPACE STUDIO MODAL TAB (MATCHING USER SCREENSHOT) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Main Workspace Card */}
          <div
            className="relative w-full max-w-2xl bg-[#090d16] border border-slate-800/90 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 overflow-hidden flex flex-col font-sans select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Lighting Orbs */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Background Code Editor Lines (Matching Screenshot) */}
            <div className="absolute inset-0 opacity-[0.08] font-mono text-[11px] p-5 leading-relaxed overflow-hidden pointer-events-none select-none text-indigo-300">
              <div>const hashiraStudio = new Workspace(&#123; theme: 'dim-obsidian', bloom: true &#125;);</div>
              <div>import &#123; HashiraCoders, SakuraPhysics &#125; from '@hashira/core';</div>
              <div>export const renderMasteryEngine = async () =&gt; &#123;</div>
              <div>&nbsp;&nbsp;await sakuraParticles.sweep(&#123; angle: 45, density: 'lush' &#125;);</div>
              <div>&nbsp;&nbsp;return &lt;CognitiveBadge state="spectral_active" /&gt;;</div>
              <div>&#125;;</div>
              <div>// &lt;/&gt; Learning Diagnostics Platform v2.0 - Verified by Hashira Coders</div>
            </div>

            {/* Workspace Header Bar */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4 text-xs z-10">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] font-semibold pl-1">
                  workspace://hashira-badge.tsx
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#0d172e] border border-indigo-700/60 text-indigo-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>
                    STATE: {activeFrame === 1 ? 'BASE BADGE' : activeFrame === 2 ? 'ASSEMBLY' : activeFrame === 3 ? 'IDLE GLOW (FRAME 3)' : 'PAPER-FOLD DISSOLVE'}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                  title="Close Tab"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Stage Area (Badge & Canvas) */}
            <div className="relative h-[220px] flex items-center justify-center overflow-visible my-2">
              {/* Sakura Petals Canvas */}
              <canvas
                ref={canvasRef}
                width={600}
                height={220}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />

              {/* Drifting Translucent Code Particles */}
              {(activeFrame === 2 || activeFrame === 3) && (
                <div className="absolute inset-0 pointer-events-none z-10 font-mono text-[11px] text-indigo-400/50 select-none">
                  <span className="absolute top-8 left-[24%] animate-pulse">&#123;</span>
                  <span className="absolute top-6 left-[36%] opacity-60">/&gt;</span>
                  <span className="absolute bottom-8 left-[23%] opacity-40">*</span>
                  <span className="absolute top-8 right-[24%] opacity-60">&lt;/&gt;</span>
                  <span className="absolute bottom-6 right-[28%] opacity-50">~</span>
                </div>
              )}

              {/* Badge Element */}
              <div className="relative z-20">
                {/* Origami Creases */}
                {modalPaperFolding && (
                  <>
                    <div className="absolute -top-3 left-[20%] w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[14px] border-b-white/95 filter drop-shadow-md z-30"></div>
                    <div className="absolute top-1 -left-3 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[18px] border-r-slate-100 filter drop-shadow-md z-30"></div>
                  </>
                )}

                {/* Badge Card */}
                <div
                  className={`relative flex items-center space-x-3.5 bg-white text-slate-900 px-4 py-3 rounded-2xl border border-slate-100 shadow-2xl transition-all duration-300 select-none ${
                    modalPaperFolding
                      ? 'paper-folding-anim'
                      : activeFrame === 3
                      ? 'cool-white-aura'
                      : 'shadow-md'
                  }`}
                  style={{ minWidth: '265px' }}
                >
                  {/* Left: Code Squircle */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ec4899] via-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-purple-500/30 shrink-0 transition-transform duration-300 ${
                      iconPop ? 'scale-100' : 'scale-0'
                    } ${activeFrame === 3 ? 'swirl-icon' : ''}`}
                  >
                    <span className="font-mono font-bold tracking-tighter">&lt;/&gt;</span>
                  </div>

                  {/* Middle: Text */}
                  <div className="flex flex-col text-left flex-1 min-w-[130px]">
                    <div className="flex items-center space-x-1.5 leading-none">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {assembledCreated}
                      </span>
                      {greenDotPop && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-400 animate-pulse"></span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span
                        className={`text-sm font-black tracking-tight ${
                          activeFrame === 3 ? 'spectral-text' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text text-transparent'
                        }`}
                      >
                        {assembledLetters}
                      </span>
                      {sparklePop && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 opacity-95" />
                      )}
                    </div>
                  </div>

                  {/* Right: Close 'X' */}
                  <button
                    onClick={triggerModalPaperFold}
                    className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center w-6 h-6 shrink-0 ${
                      closeBtnRed
                        ? 'bg-rose-100 text-rose-500 border border-rose-200 shadow-xs'
                        : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Paper Fold & Dissolve"
                    aria-label="Close"
                  >
                    <X className={`w-3.5 h-3.5 ${closeBtnRed ? 'text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Resting Shadow below badge */}
                <div
                  className={`w-4/5 mx-auto h-2.5 bg-slate-950/70 rounded-full blur-md mt-2.5 transition-opacity duration-300 ${
                    modalPaperFolding ? 'opacity-0' : 'opacity-100'
                  }`}
                ></div>

                {/* Modal Dissolve Cloud */}
                {modalPaperFolding && (
                  <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {modalDissolveSnippets.map((p) => (
                      <span
                        key={p.id}
                        className="absolute font-mono font-bold"
                        style={{
                          left: `calc(50% + ${p.x}px)`,
                          top: `calc(50% + ${p.y}px)`,
                          color: p.color,
                          fontSize: `${p.size}px`,
                          animation: 'floatSnippet 0.85s ease-out forwards',
                          ['--vx' as any]: `${p.vx * 22}px`,
                          ['--vy' as any]: `${p.vy * 26}px`,
                        }}
                      >
                        {p.char}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Workspace Control Panel (Matching Screenshot) */}
            <div className="relative z-30 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={playAssembly}
                  disabled={isAssemblyPlaying}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-sm flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <span>🌸</span>
                  <span>Replay Assembly</span>
                </button>

                <button
                  onClick={handleModalReset}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] border border-slate-700 transition-all flex items-center space-x-1"
                >
                  <span>✨</span>
                  <span>Idle Glow</span>
                </button>

                <button
                  onClick={triggerModalPaperFold}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 font-medium text-[11px] transition-all flex items-center space-x-1"
                >
                  <span>✕</span>
                  <span>Paper Fold</span>
                </button>
              </div>

              {/* Quick Frame Switcher (1, 2, 3, 4) */}
              <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 px-1 font-mono">FRAMES:</span>
                <button
                  onClick={() => {
                    handleModalReset();
                    setActiveFrame(1);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                    activeFrame === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1:Base
                </button>
                <button
                  onClick={() => {
                    handleModalReset();
                    setActiveFrame(2);
                    spawnSakuraWave(15);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                    activeFrame === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2:Particles
                </button>
                <button
                  onClick={() => {
                    handleModalReset();
                    setActiveFrame(3);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                    activeFrame === 3 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3:Idle
                </button>
                <button
                  onClick={() => {
                    triggerModalPaperFold();
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                    activeFrame === 4 ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  4:Fold
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
