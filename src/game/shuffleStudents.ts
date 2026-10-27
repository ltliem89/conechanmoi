import { CatchEventPlan, InsectType, RoundPlan, StudentItem } from './types';

export const INSECT_TYPES: InsectType[] = [
  'bee',
  'dragonfly',
  'ladybug',
  'butterfly',
  'fly',
  'beetle',
];

/**
 * Unbiased Fisher-Yates shuffle. Returns a new shuffled array.
 */
export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Creates a deterministic, fair round plan BEFORE any 3D animation begins.
 * - Shuffles students via Fisher-Yates.
 * - Avoids repeating the previous winner if there are >= 2 students.
 * - Predetermines the single winner (last in shuffled order) and elimination sequence.
 * - Schedules catch timestamps across the chosen countdown duration (5..30s).
 */
export function createRoundPlan(
  parsedStudents: { id: string; name: string }[],
  durationSec: number,
  frogCount: number,
  roundId: number,
  previousWinnerId?: string | null
): RoundPlan {
  const clampedDuration = Math.min(30, Math.max(5, Math.round(durationSec)));
  const clampedFrogs = Math.min(8, Math.max(1, Math.round(frogCount)));

  // Assign insect types in a shuffled round-robin so all 6 species appear evenly
  const shuffledSpecies = fisherYatesShuffle(INSECT_TYPES);

  const studentItems: StudentItem[] = parsedStudents.map((s, idx) => ({
    id: s.id,
    name: s.name,
    insectType: shuffledSpecies[idx % shuffledSpecies.length],
    status: 'FLYING',
  }));

  let randomizedOrder = fisherYatesShuffle(studentItems);

  // If replaying and there are at least 2 students, prevent repeating the exact same winner by default
  if (
    previousWinnerId &&
    randomizedOrder.length > 1 &&
    randomizedOrder[randomizedOrder.length - 1].id === previousWinnerId
  ) {
    // Swap the last item with a random earlier item
    const swapIdx = Math.floor(Math.random() * (randomizedOrder.length - 1));
    const lastIdx = randomizedOrder.length - 1;
    const temp = randomizedOrder[lastIdx];
    randomizedOrder[lastIdx] = randomizedOrder[swapIdx];
    randomizedOrder[swapIdx] = temp;
  }

  const winner = randomizedOrder[randomizedOrder.length - 1];
  const eliminationOrder = randomizedOrder.slice(0, randomizedOrder.length - 1);

  const totalDurationMs = clampedDuration * 1000;
  // Start catching after a brief 0.7s opening observation window, and finish catching ~0.55s before 00:00
  const startWindowMs = Math.min(850, totalDurationMs * 0.14);
  const endWindowMs = Math.max(startWindowMs + 500, totalDurationMs - 550);
  const activeSpanMs = Math.max(400, endWindowMs - startWindowMs);

  const countToEliminate = eliminationOrder.length;
  const catchSchedule: CatchEventPlan[] = [];

  for (let i = 0; i < countToEliminate; i++) {
    // Slight ease-in curve so catches build momentum toward the final seconds
    const progress =
      countToEliminate === 1 ? 0.5 : i / (countToEliminate - 1);
    const curvedProgress = Math.pow(progress, 0.88);
    const jitter =
      countToEliminate > 3
        ? (Math.random() - 0.5) * (activeSpanMs / countToEliminate) * 0.35
        : 0;

    const triggerElapsedMs = Math.min(
      endWindowMs,
      Math.max(startWindowMs, startWindowMs + curvedProgress * activeSpanMs + jitter)
    );

    // Distribute catches across frogs in varied rotation
    const frogIndex = (i + Math.floor(i / clampedFrogs)) % clampedFrogs;

    catchSchedule.push({
      studentId: eliminationOrder[i].id,
      triggerElapsedMs,
      frogIndex,
      started: false,
      completed: false,
    });
  }

  // Sort schedule chronologically
  catchSchedule.sort((a, b) => a.triggerElapsedMs - b.triggerElapsedMs);

  return {
    roundId,
    students: studentItems,
    winner,
    eliminationOrder,
    catchSchedule,
    durationSec: clampedDuration,
    frogCount: clampedFrogs,
  };
}
