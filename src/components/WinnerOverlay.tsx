import React, { useEffect, useRef } from 'react';
import {
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Award,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { GameConfig, InsectType, StudentItem } from '../game/types';
import { audioManager } from '../audio/AudioManager';

interface WinnerOverlayProps {
  winner: StudentItem;
  totalStudents: number;
  config: GameConfig;
  onReplay: () => void;
  onReplayWithoutWinner: (winnerId: string) => void;
  onBackToSetup: () => void;
  onUpdateConfig: (partial: Partial<GameConfig>) => void;
}

const INSECT_NAMES_VI: Record<InsectType, string> = {
  bee: 'Ong mật vàng',
  dragonfly: 'Chuồn chuồn ngọc',
  ladybug: 'Bọ rùa đỏ',
  butterfly: 'Bướm hoa',
  fly: 'Ruồi siêu tốc',
  beetle: 'Bọ cánh cứng',
};

const FIREWORK_PALETTES = [
  ['#facc15', '#fef08a', '#f97316'], // Gold & Amber
  ['#34d399', '#a7f3d0', '#22d3ee'], // Emerald & Cyan
  ['#f472b6', '#fbcfe8', '#c084fc'], // Lotus Pink & Violet
  ['#fb7185', '#fda4af', '#facc15'], // Ruby & Gold
  ['#38bdf8', '#bae6fd', '#818cf8'], // Sky & Indigo
];

interface Rocket3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  targetY: number;
  palette: string[];
  trail: { x: number; y: number; z: number }[];
}

interface Spark3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  prevX: number;
  prevY: number;
  prevZ: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  twinklePhase: number;
}

interface ShockwaveRing3D {
  x: number;
  y: number;
  z: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export const WinnerOverlay: React.FC<WinnerOverlayProps> = ({
  winner,
  totalStudents,
  config,
  onReplay,
  onReplayWithoutWinner,
  onBackToSetup,
  onUpdateConfig,
}) => {
  const fireworksCanvasRef = useRef<HTMLCanvasElement>(null);
  const triggerSalvoRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let isDisposed = false;

    const resize = () => {
      canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
      canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const rockets: Rocket3D[] = [];
    const sparks: Spark3D[] = [];
    const rings: ShockwaveRing3D[] = [];

    const explode3D = (rx: number, ry: number, rz: number, palette: string[]) => {
      audioManager.playFireworkBurst();

      // Add expanding 3D glow ring
      rings.push({
        x: rx,
        y: ry,
        z: rz,
        radius: 2,
        maxRadius: 110 + Math.random() * 50,
        color: palette[0],
        alpha: 0.85,
      });

      // Outer spherical chrysanthemum shell + inner core ring in 3D space
      const count = 95;
      const isDoubleRing = Math.random() > 0.45;
      for (let i = 0; i < count; i++) {
        // Fibonacci / uniform spherical distribution in 3D
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);

        const isInner = isDoubleRing && i % 3 === 0;
        const speed = (isInner ? 95 : 175) + Math.random() * 75;

        const vx = Math.sin(phi) * Math.cos(theta) * speed;
        const vy = Math.sin(phi) * Math.sin(theta) * speed;
        const vz = Math.cos(phi) * speed;

        sparks.push({
          x: rx,
          y: ry,
          z: rz,
          prevX: rx,
          prevY: ry,
          prevZ: rz,
          vx,
          vy,
          vz,
          color: palette[i % palette.length],
          alpha: 1,
          decay: 0.48 + Math.random() * 0.35,
          size: isInner ? 2.4 : 3.2,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const launchRocket = (sideBias?: -1 | 0 | 1) => {
      // Position rockets primarily on left/right flanks and upper sky so center card stays super legible
      const side =
        sideBias !== undefined
          ? sideBias
          : Math.random() < 0.5
          ? -1
          : 1;
      const spreadX =
        side === 0
          ? (Math.random() - 0.5) * 180
          : side * (180 + Math.random() * 260);
      const targetY = -120 - Math.random() * 140; // Upper half in 3D space (negative Y is up in screen space before projection, let's use +Y = up!)
      const startY = -280;
      const endY = 90 + Math.random() * 150;
      const rz = -40 + (Math.random() - 0.5) * 140;
      const palette =
        FIREWORK_PALETTES[Math.floor(Math.random() * FIREWORK_PALETTES.length)];

      rockets.push({
        x: spreadX * 0.75,
        y: startY,
        z: rz,
        vx: (spreadX - spreadX * 0.75) * 1.3,
        vy: 420 + Math.random() * 110,
        vz: (Math.random() - 0.5) * 30,
        targetY: endY,
        palette,
        trail: [],
      });
      void targetY;
    };

    const launchSalvo = () => {
      launchRocket(-1);
      setTimeout(() => !isDisposed && launchRocket(1), 180);
      setTimeout(() => !isDisposed && launchRocket(0), 380);
    };

    triggerSalvoRef.current = launchSalvo;

    // Initial celebratory salvo immediately on mount
    launchSalvo();
    const intervalId = window.setInterval(() => {
      if (rockets.length + sparks.length < 280) {
        launchRocket(Math.random() < 0.5 ? -1 : 1);
      }
    }, 850);

    let lastTime = performance.now();
    const fov = 520;

    // Project 3D coordinates (x, +y up, z depth) to 2D canvas pixels
    const project3D = (
      x: number,
      y: number,
      z: number,
      cw: number,
      ch: number
    ) => {
      const depth = Math.max(120, fov + z + 260);
      const scale = fov / depth;
      return {
        sx: cw * 0.5 + x * scale * (cw / 960),
        sy: ch * 0.5 - y * scale * (cw / 960),
        scale,
      };
    };

    const renderLoop = () => {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = 'lighter';

      // 1. Update & Draw 3D Ascending Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y, z: r.z });
        if (r.trail.length > 8) r.trail.shift();

        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.z += r.vz * dt;
        r.vy -= 140 * dt; // Gravity slowing ascent

        // Draw rocket comet trail in 3D perspective
        if (r.trail.length >= 2) {
          ctx.beginPath();
          for (let t = 0; t < r.trail.length; t++) {
            const pt = project3D(
              r.trail[t].x,
              r.trail[t].y,
              r.trail[t].z,
              cw,
              ch
            );
            if (t === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = r.palette[0];
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = 0.75;
          ctx.stroke();
        }

        const head = project3D(r.x, r.y, r.z, cw, ch);
        ctx.beginPath();
        ctx.arc(head.sx, head.sy, 3.5 * head.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.95;
        ctx.fill();

        if (r.y >= r.targetY || r.vy <= 40) {
          explode3D(r.x, r.y, r.z, r.palette);
          rockets.splice(i, 1);
        }
      }

      // 2. Update & Draw 3D Shockwave Rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.radius += (rg.maxRadius - rg.radius) * 6 * dt;
        rg.alpha -= 1.6 * dt;
        if (rg.alpha <= 0.02) {
          rings.splice(i, 1);
          continue;
        }
        const center = project3D(rg.x, rg.y, rg.z, cw, ch);
        ctx.beginPath();
        ctx.arc(
          center.sx,
          center.sy,
          Math.max(1, rg.radius * center.scale),
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = rg.color;
        ctx.lineWidth = 2 * center.scale;
        ctx.globalAlpha = rg.alpha * 0.45;
        ctx.stroke();
      }

      // 3. Update & Draw 3D Spherical Firework Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.prevX = s.x;
        s.prevY = s.y;
        s.prevZ = s.z;

        // 3D air drag + gravity
        const drag = Math.pow(0.18, dt);
        s.vx *= drag;
        s.vy = s.vy * drag - 95 * dt;
        s.vz *= drag;

        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.z += s.vz * dt;
        s.alpha -= s.decay * dt;
        s.twinklePhase += dt * 18;

        if (s.alpha <= 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        const pNow = project3D(s.x, s.y, s.z, cw, ch);
        const pPrev = project3D(s.prevX, s.prevY, s.prevZ, cw, ch);

        const twinkle = 0.7 + 0.3 * Math.sin(s.twinklePhase);
        ctx.globalAlpha = Math.max(0, s.alpha * twinkle);

        // Glowing streak from prev 3D pos to current 3D pos
        ctx.beginPath();
        ctx.moveTo(pPrev.sx, pPrev.sy);
        ctx.lineTo(pNow.sx, pNow.sy);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = Math.max(1, s.size * pNow.scale);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Hot white-gold core tip
        ctx.beginPath();
        ctx.arc(
          pNow.sx,
          pNow.sy,
          Math.max(0.8, s.size * 0.55 * pNow.scale),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 md:p-8 pointer-events-none">
      {/* 3D Perspective Fireworks Stage (Behind Winner Card, Non-Blocking) */}
      <canvas
        ref={fireworksCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Main Winner Card (Positioned above bottom frogs so celebrating frogs stay visible & clickable!) */}
      <div
        className="relative z-10 w-full max-w-3xl rounded-3xl border-2 border-amber-400/75 shadow-2xl px-6 py-7 md:px-12 md:py-9 text-center mb-14 pointer-events-auto"
        style={{ backgroundColor: 'rgba(8, 34, 43, 0.95)' }}
      >
        {/* Top Bar inside Winner Card */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-semibold text-emerald-300 font-mono-tabular">
            Chiến thắng từ {totalStudents} học sinh · {INSECT_NAMES_VI[winner.insectType]}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerSalvoRef.current?.()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-200 border border-amber-400/40 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Bắn pháo hoa</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateConfig({ muted: !config.muted })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 cursor-pointer whitespace-nowrap"
            >
              {config.muted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Đã tắt âm</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Âm thanh: Bật</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Kicker */}
        <div className="inline-flex items-center gap-2 text-amber-300 font-bold text-sm md:text-base tracking-wider uppercase mb-3">
          <Award className="w-5 h-5" />
          <span>HÔM NAY, CHÚNG TA CHỌN BẠN...</span>
        </div>

        {/* Giant Projector-Ready Winner Name */}
        <div className="my-3 py-5 px-6 rounded-2xl bg-slate-950/95 border border-amber-300/40 shadow-inner">
          <h2
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight break-words"
            style={{ textWrap: 'balance' }}
          >
            {winner.name}
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-base md:text-xl font-semibold text-emerald-200 mt-3 mb-6">
          Đến lượt bạn rồi! Chúc mừng bạn đã được chọn!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={onReplay}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm md:text-base shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-5 h-5" />
            <span>CHƠI LẠI</span>
          </button>

          {totalStudents > 1 && (
            <button
              type="button"
              onClick={() => onReplayWithoutWinner(winner.id)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 font-bold text-sm md:text-base transition-all cursor-pointer whitespace-nowrap"
              title="Loại tên vừa chọn khỏi danh sách và quay vòng tiếp theo"
            >
              <UserCheck className="w-5 h-5" />
              <span>CHƠI TIẾP (BỎ QUA TÊN NÀY)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToSetup}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/15 font-bold text-sm md:text-base transition-all cursor-pointer whitespace-nowrap"
          >
            <Settings className="w-5 h-5" />
            <span>QUAY VỀ CÀI ĐẶT</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Mẹo: Bạn có thể click trực tiếp vào các chú ếch ở dưới ao sen để đổi màu cho từng chú ếch!
        </p>
      </div>
    </div>
  );
};
