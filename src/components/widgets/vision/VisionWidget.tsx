'use client';

import { useEffect, useState, useCallback } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';

const VISIONS: { text: string; icon: string; color: string }[] = [
  { text: '50K ABONNES D\'ICI FIN 2026', icon: '🚀', color: '#00d4ff' },
  { text: 'LE PHYSIQUE DE CHRIS HERIA — ABDOS, MOBILITE, PUISSANCE', icon: '🔱', color: '#00ff88' },
  { text: 'LA CONFIANCE DE HARVEY SPECTER DANS CHAQUE MOT', icon: '👔', color: '#ffd700' },
  { text: 'LA SERENITE DE SADHGURU DANS CHAQUE INSTANT', icon: '🧘', color: '#b400ff' },
  { text: 'TU SERAS UNE ICONE — CONTINUE', icon: '👑', color: '#ff6ec7' },
  { text: 'TU ACHETERAS TOUT CE QUE TU VOUDRAS', icon: '💎', color: '#00d4ff' },
  { text: 'L\'ABONDANCE COULE VERS TOI SANS EFFORT', icon: '✨', color: '#ffd700' },
  { text: 'CHAQUE JOUR TU DEVIENS PLUS FORT, PLUS SAGE, PLUS RICHE', icon: '📈', color: '#00ff88' },
  { text: 'TU ES BENI, PROTEGE ET GUIDE PAR LE TRES-HAUT', icon: '🙏', color: '#ffd700' },
  { text: 'TA DISCIPLINE AUJOURD\'HUI C\'EST TA LIBERTE DEMAIN', icon: '⚔️', color: '#ff0040' },
  { text: 'LES PORTES S\'OUVRENT DEVANT TOI', icon: '🚪', color: '#b400ff' },
  { text: 'TU ES NE POUR REGNER — AGIS EN CONSEQUENCE', icon: '🦁', color: '#ffd700' },
  { text: 'TON TRAVAIL INVISIBLE DEVIENDRA UN SUCCES VISIBLE', icon: '🔥', color: '#ff6ec7' },
  { text: 'LA FAVEUR DE DIEU EST SUR TA VIE', icon: '🕊️', color: '#00d4ff' },
  { text: 'TU INSPIRES DES MILLIERS DE PERSONNES', icon: '🌍', color: '#00ff88' },
  { text: 'RIEN NE PEUT T\'ARRETER — TU ES INARRETABLE', icon: '💪', color: '#ff0040' },
];

// ===================== COMPACT VIEW =====================
function CompactVision() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const nextVision = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % VISIONS.length);
      setIsVisible(true);
    }, 400);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextVision, 5000);
    return () => clearInterval(interval);
  }, [nextVision]);

  const vision = VISIONS[currentIndex];

  return (
    <div className="flex flex-col h-full items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 rounded-lg transition-all duration-1000"
        style={{ background: `radial-gradient(ellipse at center, ${vision.color}15 0%, transparent 70%)` }}
      />
      <div
        className="absolute inset-2 rounded-lg transition-all duration-1000 animate-pulse-neon"
        style={{ border: `1px solid ${vision.color}15`, boxShadow: `inset 0 0 20px ${vision.color}08` }}
      />
      <div className={`relative flex flex-col items-center gap-2 px-3 text-center transition-all duration-400 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${vision.color}80)` }}>
          {vision.icon}
        </span>
        <p
          className="font-display text-[11px] font-bold leading-relaxed tracking-wide"
          style={{ color: vision.color, textShadow: `0 0 10px ${vision.color}60, 0 0 30px ${vision.color}20` }}
        >
          {vision.text}
        </p>
      </div>
      <div className="absolute bottom-1 flex gap-0.5">
        {VISIONS.map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === currentIndex ? vision.color : 'rgba(255,255,255,0.1)',
              boxShadow: i === currentIndex ? `0 0 4px ${vision.color}60` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ===================== EXPANDED GALLERY =====================
function ExpandedVision() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="flex flex-col h-full gap-4">
      <p className="font-mono text-[9px] text-cyber-text-dim/50 uppercase tracking-wider">
        Tes affirmations et visions — {VISIONS.length} mantras
      </p>

      <div className="grid grid-cols-4 gap-3 flex-1 overflow-y-auto no-scrollbar">
        {VISIONS.map((vision, i) => {
          const isActive = i === currentIndex;
          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all ${
                isActive ? 'bg-white/[0.06] scale-[1.02]' : 'bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
              style={{
                border: isActive ? `2px solid ${vision.color}60` : '2px solid transparent',
                boxShadow: isActive ? `0 0 20px ${vision.color}20, inset 0 0 15px ${vision.color}08` : 'none',
              }}
            >
              <span className="text-2xl" style={{ filter: isActive ? `drop-shadow(0 0 8px ${vision.color}80)` : 'none' }}>
                {vision.icon}
              </span>
              <p
                className="font-display text-[10px] font-bold leading-relaxed tracking-wide"
                style={{
                  color: isActive ? vision.color : 'rgba(255,255,255,0.5)',
                  textShadow: isActive ? `0 0 8px ${vision.color}40` : 'none',
                }}
              >
                {vision.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===================== MAIN WIDGET =====================
export default function VisionWidget() {
  return (
    <WidgetPanel accent="yellow" title="Vision" icon="⭐" className="h-full">
      {(isExpanded: boolean) =>
        isExpanded ? <ExpandedVision /> : <CompactVision />
      }
    </WidgetPanel>
  );
}
