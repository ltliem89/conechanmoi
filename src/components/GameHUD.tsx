import React, { useState } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GameConfig, GamePhase } from '../game/types';

interface GameHUDProps {
  phase: GamePhase;
  remainingMs: number;
  totalStudents: number;
  remainingStudents: number;
  config: GameConfig;
  onTogglePause: () => void;
  onReplay: () => void;
  onBackToSetup: () => void;
  onUpdateConfig: (partial: Partial<GameConfig>) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  phase,
  remainingMs,
  totalStudents,
  remainingStudents,
  config,
  onTogglePause,
  onReplay,
  onBackToSetup,
  onUpdateConfig,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const totalSecCeil = Math.max(0, Math.ceil(remainingMs / 1000));
  const formattedTime = `00:${String(totalSecCeil).padStart(2, '0')}`;
  const isUrgent = totalSecCeil <= 5 && totalSecCeil > 0;
  const isPaused = phase === 'PAUSED';
  const isRevealing = phase === 'REVEALING';

  return (
    <>
      {/* Top Status Bar (10-12% height, zero center occlusion) */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-8 py-3 pointer-events-none">
        {/* Left: Brand Title & Remaining Students */}
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/15 shadow-lg pointer-events-auto"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          <span className="text-sm md:text-base font-extrabold tracking-tight text-emerald-300 whitespace-nowrap">
            FROG POND 3D
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-xs md:text-sm font-semibold text-slate-200 font-mono-tabular whitespace-nowrap">
            Còn lại: <strong className="text-white">{remainingStudents}</strong> / {totalStudents} tên
          </span>
          {totalStudents === 1 && (
            <>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-amber-300 font-medium whitespace-nowrap">
                Danh sách chỉ có 1 học sinh
              </span>
            </>
          )}
        </div>

        {/* Center: Big Projector-Optimized Countdown Clock */}
        <div
          className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border shadow-2xl transition-transform duration-150 ${
            isUrgent
              ? 'border-amber-400/80 scale-105'
              : 'border-emerald-400/35'
          }`}
          style={{
            backgroundColor: isUrgent
              ? 'rgba(120, 53, 15, 0.92)'
              : 'rgba(6, 34, 41, 0.92)',
          }}
        >
          <span className="text-xs md:text-sm font-bold text-emerald-200 uppercase tracking-wider">
            {isPaused ? 'Tạm dừng' : isRevealing ? 'Hết giờ' : 'Thời gian'}
          </span>
          <span
            className={`text-2xl md:text-4xl font-extrabold font-mono-tabular tracking-tight ${
              isUrgent ? 'text-amber-300' : 'text-white'
            }`}
          >
            {formattedTime}
          </span>
          <span className="text-xs font-mono-tabular text-slate-300 hidden sm:inline">
            ({totalSecCeil} giây)
          </span>
        </div>

        {/* Right: Quick Pause / Mute status indicator */}
        <div className="hidden lg:flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => onUpdateConfig({ muted: !config.muted })}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 text-xs font-bold text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
          >
            {config.muted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>Tắt tiếng</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Âm thanh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Paused Center Banner */}
      {isPaused && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div
            className="px-8 py-6 rounded-2xl border border-amber-400/40 shadow-2xl text-center pointer-events-auto"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.94)' }}
          >
            <p className="text-xl md:text-2xl font-extrabold text-amber-300 mb-1">
              TRÒ CHƠI ĐANG TẠM DỪNG
            </p>
            <p className="text-xs md:text-sm text-slate-300 mb-4 font-mono-tabular">
              Đồng hồ đang giữ ở {formattedTime} · Còn lại {remainingStudents} học sinh
            </p>
            <button
              type="button"
              onClick={onTogglePause}
              className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>TIẾP TỤC SĂN TÊN</span>
            </button>
          </div>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[94vw] pointer-events-auto">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          className="px-3 py-1 rounded-t-lg border border-b-0 border-white/15 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Hiện điều khiển</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Ẩn điều khiển</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-4 py-2.5 rounded-2xl border border-white/15 shadow-2xl"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.92)' }}
          >
            {/* Pause / Resume */}
            <button
              type="button"
              disabled={isRevealing}
              onClick={onTogglePause}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 ${
                isPaused
                  ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                  : 'bg-amber-400/20 text-amber-200 border border-amber-400/40 hover:bg-amber-400/30'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>TIẾP TỤC</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>TẠM DỪNG</span>
                </>
              )}
            </button>

            {/* Mute / Unmute + Volume */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-white/10">
              <button
                type="button"
                onClick={() => onUpdateConfig({ muted: !config.muted })}
                className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-200 hover:text-white cursor-pointer whitespace-nowrap"
              >
                {config.muted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span>Bật âm</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Tắt âm</span>
                  </>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(config.volume * 100)}
                onChange={(e) =>
                  onUpdateConfig({
                    volume: Number(e.target.value) / 100,
                    muted: Number(e.target.value) === 0,
                  })
                }
                aria-label="Âm lượng"
                className="w-16 md:w-20 accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Replay Round */}
            <button
              type="button"
              onClick={onReplay}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CHƠI LẠI</span>
            </button>

            {/* Return to Setup */}
            <button
              type="button"
              onClick={onBackToSetup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Settings className="w-4 h-4" />
              <span>QUAY VỀ CÀI ĐẶT</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
