export type GamePhase =
  | 'SETUP'
  | 'READY'
  | 'PLAYING'
  | 'PAUSED'
  | 'REVEALING'
  | 'RESULT';

export type InsectType =
  | 'bee'
  | 'dragonfly'
  | 'ladybug'
  | 'butterfly'
  | 'fly'
  | 'beetle';

export type StudentStatus =
  | 'FLYING'
  | 'TARGETED'
  | 'CAUGHT'
  | 'WINNER';

export type FrogAnimState =
  | 'IDLE'
  | 'LOOK_AT_TARGET'
  | 'PREPARE_JUMP'
  | 'JUMP'
  | 'LAND'
  | 'PREPARE_CATCH'
  | 'TONGUE_CATCH'
  | 'EAT_REACT'
  | 'CELEBRATE';

export interface StudentItem {
  id: string;
  name: string;
  insectType: InsectType;
  status: StudentStatus;
}

export interface CatchEventPlan {
  studentId: string;
  triggerElapsedMs: number;
  frogIndex: number;
  started: boolean;
  completed: boolean;
}

export interface RoundPlan {
  roundId: number;
  students: StudentItem[];
  winner: StudentItem;
  eliminationOrder: StudentItem[];
  catchSchedule: CatchEventPlan[];
  durationSec: number;
  frogCount: number;
}

export interface ParsedStudentResult {
  students: { id: string; name: string }[];
  rawLineCount: number;
  validCount: number;
  duplicateCount: number;
  hasTabColumns: boolean;
  exceedsMaxLimit: boolean;
  maxLimit: number;
}

export interface GameConfig {
  frogCount: number; // 1..8, default 3
  durationSec: number; // 5..30, default 15
  volume: number; // 0..1
  muted: boolean;
  frogPalettes: number[]; // Palette index for each of the 8 frogs
}
