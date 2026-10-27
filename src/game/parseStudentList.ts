import { ParsedStudentResult } from './types';

export const MAX_SAFE_STUDENTS = 100;
export const STORAGE_KEY_STUDENT_LIST = 'frog_pond_3d_student_list_v1';
export const STORAGE_KEY_GAME_CONFIG = 'frog_pond_3d_game_config_v2';

export const DEFAULT_SAMPLE_STUDENTS = [
  'Nguyễn Minh An',
  'Trần Gia Bảo',
  'Lê Ngọc Chi',
  'Phạm Quốc Dũng',
  'Võ Thanh Hà',
  'Đặng Hoàng Hải',
  'Bùi Phương Anh',
  'Đỗ Tuấn Kiệt',
  'Hồ Khánh Linh',
  'Ngô Bảo Minh',
  'Dương Thảo Nguyên',
  'Lý Thiên Phúc',
  'Mai Quỳnh Như',
  'Trương Minh Quân',
  'Vũ Bích Ngọc',
  'Phan Đức Thắng',
  'Trịnh Hoài Thương',
  'Đinh Gia Huy',
  'Lâm Bảo Trâm',
  'Đoàn Khôi Nguyên',
  'Châu Nhã Uyên',
  'Tạ Minh Khang',
  'Lương Diệu Hiền',
  'Hà Anh Tuấn',
].join('\n');

/**
 * Parses raw text input line-by-line.
 * - Normalizes CRLF / CR / LF line breaks.
 * - Each non-empty line is strictly 1 student name (never splits by space).
 * - Preserves full Vietnamese diacritics and original row order.
 * - Detects tab-separated columns from Excel/Google Sheets.
 * - Assigns unique IDs (student-001, student-002...) so duplicate names remain distinct items.
 */
export function parseStudentList(
  rawText: string,
  extractFirstTabColumn = true
): ParsedStudentResult {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  let hasTabColumns = false;
  const validNames: string[] = [];

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) continue;

    if (rawLine.includes('\t')) {
      const cols = rawLine
        .split('\t')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      if (cols.length > 1) {
        hasTabColumns = true;
      }
      if (extractFirstTabColumn && cols.length > 0) {
        // Choose first column that isn't purely a row index number (like "1", "01") if there is another column
        const firstCol = cols[0];
        if (cols.length >= 2 && /^\d+[.)]?$/.test(firstCol)) {
          validNames.push(cols[1].replace(/\s+/g, ' ').trim());
        } else {
          validNames.push(firstCol.replace(/\s+/g, ' ').trim());
        }
        continue;
      }
    }

    // Keep full student name intact, only collapsing accidental multiple internal spaces
    const cleanName = trimmedLine.replace(/\s+/g, ' ');
    if (cleanName.length > 0) {
      validNames.push(cleanName);
    }
  }

  // Count duplicates without deleting them
  const seenCounts = new Map<string, number>();
  for (const name of validNames) {
    const key = name.toLocaleLowerCase('vi-VN');
    seenCounts.set(key, (seenCounts.get(key) || 0) + 1);
  }

  let duplicateCount = 0;
  seenCounts.forEach((count) => {
    if (count > 1) {
      duplicateCount += count - 1;
    }
  });

  const students = validNames.map((name, idx) => ({
    id: `student-${String(idx + 1).padStart(3, '0')}`,
    name,
  }));

  return {
    students,
    rawLineCount: lines.length,
    validCount: students.length,
    duplicateCount,
    hasTabColumns,
    exceedsMaxLimit: students.length > MAX_SAFE_STUDENTS,
    maxLimit: MAX_SAFE_STUDENTS,
  };
}

/**
 * Formats tab-separated rows cleanly into single-column student names
 */
export function normalizeMultiColumnText(rawText: string): string {
  const parsed = parseStudentList(rawText, true);
  return parsed.students.map((s) => s.name).join('\n');
}

export function loadSavedStudentText(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENT_LIST);
    if (saved !== null) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_SAMPLE_STUDENTS;
}

export function saveStudentText(text: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENT_LIST, text);
  } catch {
    // ignore storage errors
  }
}
