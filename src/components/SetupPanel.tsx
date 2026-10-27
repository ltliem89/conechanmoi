import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Eye,
  SlidersHorizontal,
  Palette,
} from 'lucide-react';
import { GameConfig, ParsedStudentResult } from '../game/types';
import {
  DEFAULT_SAMPLE_STUDENTS,
  normalizeMultiColumnText,
} from '../game/parseStudentList';
import { FROG_PALETTES } from '../scene/proceduralModels';

interface SetupPanelProps {
  rawText: string;
  onRawTextChange: (text: string) => void;
  parsed: ParsedStudentResult;
  config: GameConfig;
  onUpdateConfig: (partial: Partial<GameConfig>) => void;
  onCycleFrogColor: (frogIndex: number) => void;
  onStartGame: () => void;
}

const TIME_PRESETS = [5, 10, 15, 20, 25, 30];
const FROG_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8];

export const SetupPanel: React.FC<SetupPanelProps> = ({
  rawText,
  onRawTextChange,
  parsed,
  config,
  onUpdateConfig,
  onCycleFrogColor,
  onStartGame,
}) => {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [pondPreviewMode, setPondPreviewMode] = useState(false);

  const canStart = parsed.validCount >= 1 && !parsed.exceedsMaxLimit;

  const handleDurationChange = (sec: number) => {
    const clamped = Math.min(30, Math.max(5, Math.round(sec)));
    onUpdateConfig({ durationSec: clamped });
  };

  const handleFrogCountChange = (count: number) => {
    const clamped = Math.min(8, Math.max(1, Math.round(count)));
    onUpdateConfig({ frogCount: clamped });
  };

  // If user toggled "Ngắm ao sen & Click đổi màu ếch", render a compact floating bar at the top/bottom so the 3D pond & frogs are 100% exposed for direct clicking!
  if (pondPreviewMode) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 md:p-6 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-emerald-400/40 shadow-xl"
            style={{ backgroundColor: 'rgba(6, 34, 41, 0.92)' }}
          >
            <Palette className="w-5 h-5 text-amber-300 shrink-0" />
            <span className="text-xs md:text-sm font-bold text-white">
              Hãy click trực tiếp vào từng chú ếch 3D dưới ao sen để đổi màu!
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPondPreviewMode(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs md:text-sm shadow-xl cursor-pointer whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Mở lại bảng cài đặt ({parsed.validCount} học sinh)</span>
          </button>
        </div>

        <div className="flex items-center justify-center pointer-events-auto mb-2">
          <button
            type="button"
            disabled={!canStart}
            onClick={onStartGame}
            className="py-3.5 px-8 rounded-2xl font-extrabold text-base md:text-lg tracking-wide flex items-center justify-center gap-3 bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 shadow-2xl transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>BẮT ĐẦU SĂN TÊN NGAY</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 md:p-6 pointer-events-none overflow-y-auto">
      <div
        className="w-full max-w-5xl rounded-2xl border border-emerald-400/25 shadow-2xl p-5 md:p-7 text-slate-100 pointer-events-auto"
        style={{ backgroundColor: 'rgba(6, 34, 41, 0.94)' }}
      >
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-emerald-500/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 48 48"
                className="w-8 h-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse cx="24" cy="36" rx="18" ry="6" fill="#15803d" />
                <ellipse cx="24" cy="27" rx="13" ry="10" fill="#22c55e" />
                <ellipse cx="24" cy="29" rx="9" ry="6.5" fill="#bbf7d0" />
                <circle cx="16" cy="17" r="5" fill="#22c55e" />
                <circle cx="32" cy="17" r="5" fill="#22c55e" />
                <circle cx="16" cy="17" r="3" fill="#ffffff" />
                <circle cx="32" cy="17" r="3" fill="#ffffff" />
                <circle cx="16.5" cy="17" r="1.5" fill="#0f172a" />
                <circle cx="31.5" cy="17" r="1.5" fill="#0f172a" />
                <path
                  d="M18 26 Q24 30 30 26"
                  stroke="#14532d"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                FROG POND 3D — AO SEN SĂN TÊN
              </h1>
              <p className="text-xs md:text-sm text-emerald-200/80">
                Trò chơi 3D chọn ngẫu nhiên học sinh công bằng, sinh động trên lớp học
              </p>
            </div>
          </div>

          {/* Right Header Controls: Preview Pond & Audio */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setPondPreviewMode(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/35 transition-colors cursor-pointer whitespace-nowrap"
              title="Ẩn bảng để click trực tiếp vào từng chú ếch 3D ngoài ao sen"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>Xem Ao & Click Đổi Màu Ếch</span>
            </button>

            <div className="flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => onUpdateConfig({ muted: !config.muted })}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
                title={config.muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {config.muted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span>Tắt tiếng</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-300" />
                    <span>Âm thanh</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-1.5">
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
                  aria-label="Âm lượng tổng"
                  className="w-16 accent-emerald-400 cursor-pointer"
                />
                <span className="text-xs font-mono-tabular text-slate-300 w-8 text-right">
                  {config.muted ? '0%' : `${Math.round(config.volume * 100)}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
          {/* Left Column: Student List Input (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label
                htmlFor="student-list-textarea"
                className="text-sm font-bold text-emerald-100"
              >
                1. Danh sách học sinh (Mỗi dòng 1 họ tên)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRawTextChange(DEFAULT_SAMPLE_STUDENTS)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-200 border border-emerald-500/20 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Dùng danh sách mẫu (24 tên)
                </button>
                <button
                  type="button"
                  disabled={rawText.trim().length === 0}
                  onClick={() => setConfirmClearOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 disabled:opacity-40 text-rose-200 border border-rose-500/30 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa danh sách</span>
                </button>
              </div>
            </div>

            <div className="relative flex-1">
              <textarea
                id="student-list-textarea"
                rows={11}
                value={rawText}
                onChange={(e) => onRawTextChange(e.target.value)}
                placeholder={
                  'Dán danh sách học sinh vào đây (mỗi dòng là một học sinh)...\nVí dụ:\nNguyễn Minh An\nTrần Gia Bảo\nLê Ngọc Chi'
                }
                className="w-full h-64 lg:h-72 rounded-xl bg-slate-950/90 border border-emerald-500/30 focus:border-emerald-400 focus:outline-none p-3.5 text-sm md:text-base leading-relaxed text-white placeholder-slate-500 resize-none font-medium"
              />

              {confirmClearOpen && (
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center p-4 z-10"
                  style={{ backgroundColor: 'rgba(9, 24, 30, 0.96)' }}
                >
                  <div className="max-w-sm w-full bg-slate-900 border border-rose-500/40 rounded-xl p-4 text-center shadow-xl">
                    <p className="text-sm font-bold text-white mb-1">
                      Xác nhận xóa toàn bộ danh sách?
                    </p>
                    <p className="text-xs text-slate-300 mb-4">
                      Thao tác này sẽ xóa tất cả {parsed.validCount} tên học sinh hiện tại khỏi ô nhập.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setConfirmClearOpen(false)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRawTextChange('');
                          setConfirmClearOpen(false);
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                      >
                        Xác nhận xóa
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status & Validation Feedback Bar */}
            <div className="mt-2.5 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  {parsed.validCount > 0 && !parsed.exceedsMaxLimit ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span className="font-bold text-white font-mono-tabular">
                    Đã nhận {parsed.validCount} học sinh
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-300 text-xs">
                    Tự động lưu trên trình duyệt
                  </span>
                </div>

                {parsed.validCount === 1 && (
                  <span className="text-xs text-amber-300 font-medium">
                    Danh sách chỉ có 1 học sinh (sẽ được chọn ngay khi hết giờ)
                  </span>
                )}
              </div>

              {parsed.validCount === 0 && (
                <p className="text-xs font-semibold text-rose-400">
                  Vui lòng nhập ít nhất một tên học sinh.
                </p>
              )}

              {parsed.exceedsMaxLimit && (
                <p className="text-xs font-semibold text-rose-400">
                  Danh sách vượt giới hạn an toàn {parsed.maxLimit} học sinh (hiện có {parsed.validCount}). Vui lòng giảm bớt danh sách để đảm bảo hiệu năng 3D.
                </p>
              )}

              {parsed.duplicateCount > 0 && (
                <p className="text-xs text-amber-300">
                  Lưu ý: Có {parsed.duplicateCount} tên trùng nhau. Hệ thống vẫn giữ riêng từng học sinh, khuyến nghị ghi đầy đủ họ và tên đệm.
                </p>
              )}

              {parsed.hasTabColumns && (
                <div className="flex items-center justify-between gap-2 bg-amber-500/15 border border-amber-400/30 rounded-lg px-3 py-1.5 text-xs text-amber-200">
                  <span>
                    Phát hiện dữ liệu bảng có nhiều cột (Tab). Đã ưu tiên lấy cột tên học sinh của mỗi dòng.
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onRawTextChange(normalizeMultiColumnText(rawText))
                    }
                    className="px-2.5 py-1 rounded bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 font-semibold shrink-0 cursor-pointer"
                  >
                    Làm sạch cột thừa
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Frog Count, Frog Colors, Countdown Timer & Start CTA (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              {/* Frog Count & Individual Frog Color Customization (1..8) */}
              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-bold text-emerald-100">
                    2. Số lượng & Màu sắc ếch
                  </span>
                  <span className="text-xs font-mono-tabular font-bold text-emerald-300">
                    {config.frogCount} chú ếch · {config.frogCount} lá sen
                  </span>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {FROG_COUNTS.map((num) => {
                    const active = config.frogCount === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleFrogCountChange(num)}
                        className={`py-2 rounded-lg text-sm font-bold font-mono-tabular transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* Clickable Frog Color Badges for Each Active Frog */}
                <div className="mt-3 pt-2.5 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mb-2">
                    <span>Click vào ếch dưới ao hoặc bấm ô dưới để đổi màu:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {Array.from({ length: config.frogCount }).map((_, idx) => {
                      const palIdx =
                        (config.frogPalettes?.[idx] ?? 0) %
                        FROG_PALETTES.length;
                      const pal = FROG_PALETTES[palIdx];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onCycleFrogColor(idx)}
                          title={`Ếch #${idx + 1}: ${pal.nameVi} (Click để đổi màu)`}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/15 text-xs font-semibold text-white transition-transform active:scale-95 cursor-pointer"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                            style={{ backgroundColor: pal.hexCss }}
                          />
                          <span className="font-mono-tabular">Ếch #{idx + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Countdown Duration Selector (5..30 seconds) */}
              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-bold text-emerald-100">
                    3. Thời gian săn tên (5–30 giây)
                  </span>
                  <span className="text-base font-mono-tabular font-extrabold text-amber-300">
                    {config.durationSec} giây
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5 mb-3.5">
                  {TIME_PRESETS.map((sec) => {
                    const active = config.durationSec === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleDurationChange(sec)}
                        className={`py-1.5 rounded-lg text-xs font-bold font-mono-tabular transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono-tabular text-slate-400">
                    5s
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={config.durationSec}
                    onChange={(e) =>
                      handleDurationChange(Number(e.target.value))
                    }
                    aria-label="Thời gian đếm ngược từ 5 đến 30 giây"
                    className="flex-1 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-xs font-mono-tabular text-slate-400">
                    30s
                  </span>
                </div>
              </div>

              {/* Fairness & Environment Info Box */}
              <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/20 p-3 text-xs text-emerald-100/90 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Ao sen 3D sinh động · Ếch nhảy qua lá sen & Cá phóng lên đớp mồi</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Mặc định ếch đồng xanh lá có họa tiết tự nhiên; click vào bất kỳ chú ếch 3D nào để đổi màu. Kết quả chọn ngẫu nhiên công bằng 100%.
                </p>
              </div>
            </div>

            {/* Primary Start Game CTA */}
            <button
              type="button"
              disabled={!canStart}
              onClick={onStartGame}
              className="w-full py-4 px-6 rounded-xl font-extrabold text-base md:text-lg tracking-wide flex items-center justify-center gap-3 bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 shadow-xl transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>BẮT ĐẦU SĂN TÊN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
