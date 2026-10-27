import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameConfig, GamePhase, RoundPlan } from './game/types';
import {
  loadSavedStudentText,
  parseStudentList,
  saveStudentText,
  STORAGE_KEY_GAME_CONFIG,
} from './game/parseStudentList';
import { createRoundPlan } from './game/shuffleStudents';
import { PondCanvas } from './scene/PondCanvas';
import { FROG_PALETTES } from './scene/proceduralModels';
import { SetupPanel } from './components/SetupPanel';
import { GameHUD } from './components/GameHUD';
import { WinnerOverlay } from './components/WinnerOverlay';
import { audioManager } from './audio/AudioManager';

const DEFAULT_FROG_PALETTES = [0, 0, 0, 0, 0, 0, 0, 0];

function loadSavedConfig(): GameConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAME_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      const savedPalettes = Array.isArray(parsed.frogPalettes)
        ? parsed.frogPalettes.map((n: unknown) =>
            typeof n === 'number' ? n : 0
          )
        : DEFAULT_FROG_PALETTES;
      while (savedPalettes.length < 8) {
        savedPalettes.push(0);
      }
      return {
        frogCount: Math.min(8, Math.max(1, Number(parsed.frogCount) || 3)),
        durationSec: Math.min(
          30,
          Math.max(5, Number(parsed.durationSec) || 15)
        ),
        volume:
          typeof parsed.volume === 'number'
            ? Math.min(1, Math.max(0, parsed.volume))
            : 0.75,
        muted: Boolean(parsed.muted),
        frogPalettes: savedPalettes.slice(0, 8),
      };
    }
  } catch {
    // ignore
  }
  return {
    frogCount: 3,
    durationSec: 15,
    volume: 0.75,
    muted: false,
    frogPalettes: [...DEFAULT_FROG_PALETTES],
  };
}

export default function App() {
  const [rawText, setRawText] = useState<string>(() => loadSavedStudentText());
  const [config, setConfig] = useState<GameConfig>(() => loadSavedConfig());
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [roundPlan, setRoundPlan] = useState<RoundPlan | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(
    config.durationSec * 1000
  );
  const [remainingStudents, setRemainingStudents] = useState<number>(0);
  const [frogColorToast, setFrogColorToast] = useState<{
    frogNumber: number;
    paletteName: string;
    hexCss: string;
  } | null>(null);

  const roundCounterRef = useRef<number>(1);
  const previousWinnerIdRef = useRef<string | null>(null);
  const victoryPlayedForRoundRef = useRef<number>(-1);
  const toastTimerRef = useRef<number>(0);

  const parsed = useMemo(() => parseStudentList(rawText, true), [rawText]);

  const handleRawTextChange = useCallback((nextText: string) => {
    setRawText(nextText);
    saveStudentText(nextText);
  }, []);

  const handleUpdateConfig = useCallback((partial: Partial<GameConfig>) => {
    audioManager.unlock();
    setConfig((prev) => {
      const next: GameConfig = {
        frogCount:
          partial.frogCount !== undefined
            ? Math.min(8, Math.max(1, Math.round(partial.frogCount)))
            : prev.frogCount,
        durationSec:
          partial.durationSec !== undefined
            ? Math.min(30, Math.max(5, Math.round(partial.durationSec)))
            : prev.durationSec,
        volume:
          partial.volume !== undefined
            ? Math.min(1, Math.max(0, partial.volume))
            : prev.volume,
        muted: partial.muted !== undefined ? partial.muted : prev.muted,
        frogPalettes: partial.frogPalettes ?? prev.frogPalettes,
      };
      audioManager.setVolume(next.volume);
      audioManager.setMuted(next.muted);
      try {
        localStorage.setItem(STORAGE_KEY_GAME_CONFIG, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Triggered when user clicks directly on a 3D frog in PondCanvas or clicks its swatch in SetupPanel
  const handleFrogColorChanged = useCallback(
    (
      frogIndex: number,
      nextPaletteIndex: number,
      paletteName: string,
      hexCss: string
    ) => {
      setConfig((prev) => {
        const nextPalettes = [...(prev.frogPalettes || DEFAULT_FROG_PALETTES)];
        nextPalettes[frogIndex] = nextPaletteIndex;
        const next = { ...prev, frogPalettes: nextPalettes };
        try {
          localStorage.setItem(STORAGE_KEY_GAME_CONFIG, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      setFrogColorToast({
        frogNumber: frogIndex + 1,
        paletteName,
        hexCss,
      });
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => {
        setFrogColorToast(null);
      }, 2200);
    },
    []
  );

  const handleCycleFrogColorFromUI = useCallback(
    (frogIndex: number) => {
      const currentIdx = config.frogPalettes?.[frogIndex] ?? frogIndex;
      const nextIdx = (currentIdx + 1) % FROG_PALETTES.length;
      const pal = FROG_PALETTES[nextIdx];
      audioManager.playFrogColorChange(nextIdx);
      handleFrogColorChanged(frogIndex, nextIdx, pal.nameVi, pal.hexCss);
    },
    [config.frogPalettes, handleFrogColorChanged]
  );

  useEffect(() => {
    audioManager.setVolume(config.volume);
    audioManager.setMuted(config.muted);
  }, [config.volume, config.muted]);

  const launchRoundWithStudents = useCallback(
    (studentsList: { id: string; name: string }[]) => {
      if (studentsList.length === 0 || studentsList.length > 100) return;

      audioManager.unlock();
      audioManager.resetRoundTracking();

      const nextRoundId = roundCounterRef.current++;
      const plan = createRoundPlan(
        studentsList,
        config.durationSec,
        config.frogCount,
        nextRoundId,
        previousWinnerIdRef.current
      );

      previousWinnerIdRef.current = plan.winner.id;
      setRoundPlan(plan);
      setRemainingMs(plan.durationSec * 1000);
      setRemainingStudents(plan.students.length);
      setPhase('PLAYING');
      audioManager.startAmbient();
      audioManager.playFrogJump();
    },
    [config.durationSec, config.frogCount]
  );

  const handleStartGame = useCallback(() => {
    if (phase === 'PLAYING' || phase === 'REVEALING') return;
    if (parsed.validCount === 0 || parsed.exceedsMaxLimit) return;
    launchRoundWithStudents(parsed.students);
  }, [phase, parsed, launchRoundWithStudents]);

  const handleReplay = useCallback(() => {
    if (parsed.validCount === 0 || parsed.exceedsMaxLimit) return;
    launchRoundWithStudents(parsed.students);
  }, [parsed, launchRoundWithStudents]);

  const handleReplayWithoutWinner = useCallback(
    (winnerId: string) => {
      const filtered = parsed.students.filter((s) => s.id !== winnerId);
      if (filtered.length === 0) return;
      const newText = filtered.map((s) => s.name).join('\n');
      handleRawTextChange(newText);
      const reparsed = parseStudentList(newText, true);
      launchRoundWithStudents(reparsed.students);
    },
    [parsed.students, handleRawTextChange, launchRoundWithStudents]
  );

  const handleTogglePause = useCallback(() => {
    audioManager.unlock();
    setPhase((prev) => {
      if (prev === 'PLAYING') {
        audioManager.stopAmbient();
        return 'PAUSED';
      }
      if (prev === 'PAUSED') {
        audioManager.startAmbient();
        return 'PLAYING';
      }
      return prev;
    });
  }, []);

  const handleBackToSetup = useCallback(() => {
    audioManager.stopAmbient();
    setPhase('SETUP');
    setRoundPlan(null);
  }, []);

  const handleRoundRevealStart = useCallback(() => {
    setPhase((prev) => (prev === 'PLAYING' ? 'REVEALING' : prev));
  }, []);

  const handleRoundComplete = useCallback(() => {
    audioManager.stopAmbient();
    setPhase('RESULT');
    if (
      roundPlan &&
      victoryPlayedForRoundRef.current !== roundPlan.roundId
    ) {
      victoryPlayedForRoundRef.current = roundPlan.roundId;
      audioManager.playVictoryFanfare();
    }
  }, [roundPlan]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'INPUT')
      ) {
        return;
      }
      if (e.code === 'Space' && (phase === 'PLAYING' || phase === 'PAUSED')) {
        e.preventDefault();
        handleTogglePause();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, handleTogglePause]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#072227] select-none">
      {/* Full-Viewport 3D Lotus Pond Scene */}
      <PondCanvas
        phase={phase}
        frogCount={config.frogCount}
        frogPalettes={config.frogPalettes}
        roundPlan={roundPlan}
        onTickTimer={setRemainingMs}
        onRemainingCountChange={setRemainingStudents}
        onRoundRevealStart={handleRoundRevealStart}
        onRoundComplete={handleRoundComplete}
        onFrogColorChanged={handleFrogColorChanged}
      />

      {/* Floating Toast Notification when a Frog's Color is Changed */}
      {frogColorToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/25 shadow-2xl text-xs md:text-sm font-bold text-white"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.94)' }}
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-white shrink-0"
              style={{ backgroundColor: frogColorToast.hexCss }}
            />
            <span>
              Ếch #{frogColorToast.frogNumber}:{' '}
              <strong className="text-amber-300">
                {frogColorToast.paletteName}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Setup Screen Overlay */}
      {phase === 'SETUP' && (
        <SetupPanel
          rawText={rawText}
          onRawTextChange={handleRawTextChange}
          parsed={parsed}
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onCycleFrogColor={handleCycleFrogColorFromUI}
          onStartGame={handleStartGame}
        />
      )}

      {/* Active Gameplay HUD & Controls */}
      {(phase === 'PLAYING' ||
        phase === 'PAUSED' ||
        phase === 'REVEALING') &&
        roundPlan && (
          <GameHUD
            phase={phase}
            remainingMs={remainingMs}
            totalStudents={roundPlan.students.length}
            remainingStudents={remainingStudents}
            config={config}
            onTogglePause={handleTogglePause}
            onReplay={handleReplay}
            onBackToSetup={handleBackToSetup}
            onUpdateConfig={handleUpdateConfig}
          />
        )}

      {/* Winner Reveal Centerpiece Overlay */}
      {phase === 'RESULT' && roundPlan && (
        <WinnerOverlay
          winner={roundPlan.winner}
          totalStudents={roundPlan.students.length}
          config={config}
          onReplay={handleReplay}
          onReplayWithoutWinner={handleReplayWithoutWinner}
          onBackToSetup={handleBackToSetup}
          onUpdateConfig={handleUpdateConfig}
        />
      )}
    </main>
  );
}
