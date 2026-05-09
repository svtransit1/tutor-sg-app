/**
 * AAAS-1129: OCR failure → manual input fallback integration test
 *
 * Covers the full manual input fallback flow:
 *   1. OCR runs → low-confidence blocks trigger manual input modal
 *   2. Kid types corrections into the modal
 *   3. Corrections are merged back into OCR result
 *   4. Merged result feeds into LLM inference
 *
 * Contract tested against ADD §4.1 and decisions-locked OCR failure handling.
 * All types are defined inline (no runtime imports) — pure logic integration test.
 *
 * @see ADD §4.1 — OCR fallback: manual-input when confidence < 0.6
 */

// ── Type Definitions (inline — mirroring actual contracts) ─────────

interface OcrBoundingBox {
  x: number; y: number; width: number; height: number;
}

/** Single text block detected by OCR */
interface OcrTextBlock {
  text: string;
  confidence: number;       // 0–1
  bbox?: OcrBoundingBox;
  manuallyEntered?: boolean;
}

/** One page/photo OCR result */
interface OcrPageResult {
  pageIndex: number;
  blocks: OcrTextBlock[];
  overallConfidence: number;
  hasManualInput: boolean;
}

/** Combined multi-page OCR result */
interface OcrResult {
  pages: OcrPageResult[];
  fullText: string;
  lowConfidenceBlocks: number;
  needsManualInput: boolean;
}

/** Manual input item shown in the modal */
interface ManualInputItem {
  itemIndex: number;
  originalText: string;
  pageIndex: number;
}

// ── Constants ─────────────────────────────────────────────────────

/** OCR confidence threshold — blocks below this trigger manual input (per ADD §4.1, OCR service) */
const CONFIDENCE_THRESHOLD = 0.6;

/** Retake threshold — blocks below this trigger retake suggestion (per OCR service) */
const RETAKE_THRESHOLD = 0.3;

/** Confidence assigned to manually entered text */
const MANUAL_CONFIDENCE = 0.95;

// ── Core Logic (mirrors CameraScreen manual input flow) ────────────

/** Classify blocks by confidence threshold */
function classifyBlocks(
  blocks: OcrTextBlock[],
  threshold: number = CONFIDENCE_THRESHOLD,
): { good: OcrTextBlock[]; fallback: OcrTextBlock[] } {
  const good: OcrTextBlock[] = [];
  const fallback: OcrTextBlock[] = [];
  for (const b of blocks) {
    if (b.confidence >= threshold) good.push(b);
    else fallback.push(b);
  }
  return { good, fallback };
}

/** Determine if manual input is needed for an OCR result */
function needsManualInput(pages: OcrPageResult[], threshold: number = CONFIDENCE_THRESHOLD): boolean {
  return pages.some((p) => p.blocks.some((b) => b.confidence < threshold));
}

/** Build manual input items from low-confidence blocks */
function buildManualItems(
  pages: OcrPageResult[],
  threshold: number = CONFIDENCE_THRESHOLD,
): ManualInputItem[] {
  const items: ManualInputItem[] = [];
  let itemIndex = 0;
  for (const page of pages) {
    for (const block of page.blocks) {
      if (block.confidence < threshold) {
        items.push({
          itemIndex: itemIndex++,
          originalText: block.text,
          pageIndex: page.pageIndex,
        });
      }
    }
  }
  return items;
}

/** Merge manual inputs back into OCR pages */
function mergeManualInputs(
  pages: OcrPageResult[],
  manualInputs: (string | null | undefined)[],
  threshold: number = CONFIDENCE_THRESHOLD,
): { pages: OcrPageResult[]; mergedCount: number } {
  let manualIndex = 0;
  let mergedCount = 0;
  const updated = pages.map((page) => ({
    ...page,
    blocks: page.blocks.map((block) => {
      if (block.confidence < threshold && manualIndex < manualInputs.length) {
        const input = manualInputs[manualIndex];
        manualIndex++;
        if (input && input.trim().length > 0) {
          mergedCount++;
          return {
            ...block,
            text: input.trim(),
            manuallyEntered: true,
            confidence: MANUAL_CONFIDENCE,
          };
        }
        // Empty input → keep original (not merged)
        return block;
      }
      return block;
    }),
  }));
  return { pages: updated, mergedCount };
}

/** Rebuild fullText from merged pages */
function rebuildFullText(pages: OcrPageResult[]): string {
  return pages
    .flatMap((p) => p.blocks.map((b) => b.text))
    .join('\n');
}

/** Check if any block is still below retake threshold after manual merge */
function stillNeedsRetake(pages: OcrPageResult[]): boolean {
  return pages.some((p) => p.blocks.some((b) => b.confidence < RETAKE_THRESHOLD));
}

/** Check if merged result is ready for inference (no blocks below threshold) */
function isReadyForInference(pages: OcrPageResult[], threshold: number = CONFIDENCE_THRESHOLD): boolean {
  return !needsManualInput(pages, threshold);
}

// ── Test Fixtures ─────────────────────────────────────────────────

const P3_MATH_CLEAR_BLOCKS: OcrTextBlock[] = [
  { text: '1. 4 × 7 = ?', confidence: 0.92, bbox: { x: 0.05, y: 0.05, width: 0.5, height: 0.06 } },
  { text: '2. 6 × 8 = ?', confidence: 0.94, bbox: { x: 0.05, y: 0.14, width: 0.5, height: 0.06 } },
  { text: '3. There are 5 bags. Each bag has 9 apples. How many apples are there altogether?', confidence: 0.88, bbox: { x: 0.05, y: 0.23, width: 0.85, height: 0.08 } },
];

const P3_MATH_MIXED_BLOCKS: OcrTextBlock[] = [
  { text: '1. 4 × 7 = ?', confidence: 0.91, bbox: { x: 0.05, y: 0.05, width: 0.4, height: 0.06 } },
  { text: '2. 6/ × 8 = ?', confidence: 0.48, bbox: { x: 0.05, y: 0.14, width: 0.4, height: 0.06 } }, // slashed through, low conf
  { text: '3. There arie 5 bags.', confidence: 0.55, bbox: { x: 0.05, y: 0.23, width: 0.7, height: 0.08 } }, // typo + smudge, low conf
  { text: '4. Each bag has 9 apples.', confidence: 0.93, bbox: { x: 0.05, y: 0.34, width: 0.7, height: 0.08 } },
  { text: '5. How many apple?', confidence: 0.87, bbox: { x: 0.05, y: 0.45, width: 0.6, height: 0.08 } },
];

const P3_HANDWRITING_SCRAMBLED: OcrTextBlock[] = [
  { text: '1. Wfiat is 3/4 0f 20z', confidence: 0.22, bbox: { x: 0.05, y: 0.05, width: 0.5, height: 0.06 } }, // barely legible
  { text: '2. a ÷ b = 12', confidence: 0.31, bbox: { x: 0.05, y: 0.14, width: 0.4, height: 0.06 } },  // below retake threshold but above 0.3
  { text: '3. Solve:', confidence: 0.82, bbox: { x: 0.05, y: 0.23, width: 0.2, height: 0.06 } },
];

const P3_SCIENCE_LOW: OcrTextBlock[] = [
  { text: '1. Water ___ when heated.', confidence: 0.42, bbox: { x: 0.05, y: 0.05, width: 0.6, height: 0.06 } },
  { text: '2. A plants need ___ to grow.', confidence: 0.38, bbox: { x: 0.05, y: 0.14, width: 0.6, height: 0.06 } },
  { text: '3. The sun is a ___.', confidence: 0.44, bbox: { x: 0.05, y: 0.23, width: 0.4, height: 0.06 } },
];

const P4_CHINESE_MIXED: OcrTextBlock[] = [
  { text: '1. 快___', confidence: 0.88, bbox: { x: 0.05, y: 0.05, width: 0.25, height: 0.06 } },
  { text: '2. 乐___', confidence: 0.46, bbox: { x: 0.05, y: 0.14, width: 0.25, height: 0.06 } }, // smudged character
  { text: '3. 大___', confidence: 0.92, bbox: { x: 0.05, y: 0.23, width: 0.25, height: 0.06 } },
  { text: '造句：认真', confidence: 0.51, bbox: { x: 0.05, y: 0.34, width: 0.4, height: 0.06 } }, // handwriting faint
];

const P6_PSLE_HEAVY_LOW: OcrTextBlock[] = [
  { text: 'The ratioP of boy1s to girls is 3:5.', confidence: 0.35, bbox: { x: 0.05, y: 0.05, width: 0.7, height: 0.08 } },
  { text: 'There are 240 more girl', confidence: 0.41, bbox: { x: 0.05, y: 0.16, width: 0.5, height: 0.08 } },
  { text: 'than boys.', confidence: 0.28, bbox: { x: 0.55, y: 0.16, width: 0.3, height: 0.08 } },
  { text: 'How many students are there altogether?', confidence: 0.66, bbox: { x: 0.05, y: 0.27, width: 0.7, height: 0.08 } },
];

function makePage(blocks: OcrTextBlock[], pageIndex: number = 0, threshold: number = CONFIDENCE_THRESHOLD): OcrPageResult {
  const overall = blocks.length > 0 ? blocks.reduce((s, b) => s + b.confidence, 0) / blocks.length : 0;
  return {
    pageIndex,
    blocks,
    overallConfidence: Math.round(overall * 100) / 100,
    hasManualInput: blocks.some((b) => b.confidence < threshold),
  };
}

function makeOcrResult(pages: OcrPageResult[], threshold: number = CONFIDENCE_THRESHOLD): OcrResult {
  return {
    pages,
    fullText: pages.flatMap((p) => p.blocks.map((b) => b.text)).join('\n'),
    lowConfidenceBlocks: pages.reduce((s, p) => s + p.blocks.filter((b) => b.confidence < threshold).length, 0),
    needsManualInput: pages.some((p) => p.hasManualInput),
  };
}

// ── Page fixtures ─────────────────────────────────────────────────

const clearPage = makePage(P3_MATH_CLEAR_BLOCKS);
const mixedPage = makePage(P3_MATH_MIXED_BLOCKS);
const scrambledPage = makePage(P3_HANDWRITING_SCRAMBLED);
const scienceLowPage = makePage(P3_SCIENCE_LOW);
const chinesePage = makePage(P4_CHINESE_MIXED);
const pslePage = makePage(P6_PSLE_HEAVY_LOW);

const clearResult = makeOcrResult([clearPage]);
const mixedResult = makeOcrResult([mixedPage]);
const scrambledResult = makeOcrResult([scrambledPage]);
const scienceLowResult = makeOcrResult([scienceLowPage]);
const chineseResult = makeOcrResult([chinesePage]);
const psleResult = makeOcrResult([pslePage]);

// Multi-page: first page clear, second page has low blocks
const multiPageResult = makeOcrResult([
  makePage(P3_MATH_CLEAR_BLOCKS, 0),
  makePage(P3_SCIENCE_LOW, 1),
]);

// ─────────────────────────────────────────────────────────────────
// Test Suites
// ─────────────────────────────────────────────────────────────────

describe('MANFALL-01: Confidence classification at threshold 0.6', () => {
  it('all blocks in clear page classified as good', () => {
    const { good, fallback } = classifyBlocks(clearPage.blocks);
    expect(good).toHaveLength(3);
    expect(fallback).toHaveLength(0);
  });

  it('mixed page: 3 good, 2 fallback', () => {
    const { good, fallback } = classifyBlocks(mixedPage.blocks);
    expect(good).toHaveLength(3);
    expect(fallback).toHaveLength(2);
  });

  it('fallback blocks have confidence < 0.6', () => {
    const { fallback } = classifyBlocks(mixedPage.blocks);
    for (const b of fallback) expect(b.confidence).toBeLessThan(CONFIDENCE_THRESHOLD);
  });

  it('confidence exactly 0.6 passes (boundary)', () => {
    const block: OcrTextBlock = { text: 'boundary', confidence: 0.6 };
    const { good, fallback } = classifyBlocks([block]);
    expect(good).toHaveLength(1);
    expect(fallback).toHaveLength(0);
  });

  it('confidence 0.599 fails (just below)', () => {
    const block: OcrTextBlock = { text: 'just below', confidence: 0.599 };
    const { good, fallback } = classifyBlocks([block]);
    expect(good).toHaveLength(0);
    expect(fallback).toHaveLength(1);
  });

  it('confidence 0.3 classifies as fallback, not retake', () => {
    const block: OcrTextBlock = { text: 'threshold edge', confidence: 0.3 };
    const { fallback } = classifyBlocks([block], CONFIDENCE_THRESHOLD);
    expect(fallback).toHaveLength(1);
  });

  it('confidence 1.0 always good', () => {
    const block: OcrTextBlock = { text: 'perfect', confidence: 1.0 };
    const { good } = classifyBlocks([block]);
    expect(good).toHaveLength(1);
  });

  it('confidence 0.0 always fallback', () => {
    const block: OcrTextBlock = { text: 'garbage', confidence: 0.0 };
    const { fallback } = classifyBlocks([block]);
    expect(fallback).toHaveLength(1);
  });

  it('empty blocks array returns empty classifications', () => {
    const { good, fallback } = classifyBlocks([]);
    expect(good).toHaveLength(0);
    expect(fallback).toHaveLength(0);
  });

  it('custom threshold: 0.8 filters strictly', () => {
    const { good, fallback } = classifyBlocks(clearPage.blocks, 0.8);
    // Only blocks >= 0.8 survive: 0.92, 0.94, 0.88 = 3
    expect(good).toHaveLength(3);
    expect(fallback).toHaveLength(0);
  });
});

describe('MANFALL-02: Manual input trigger detection', () => {
  it('clear page: no manual input needed', () => {
    expect(clearPage.hasManualInput).toBe(false);
    expect(clearResult.needsManualInput).toBe(false);
    expect(needsManualInput([clearPage])).toBe(false);
  });

  it('mixed page: manual input needed', () => {
    expect(mixedPage.hasManualInput).toBe(true);
    expect(mixedResult.needsManualInput).toBe(true);
    expect(needsManualInput([mixedPage])).toBe(true);
  });

  it('scrambled page: manual input needed (3 fallback)', () => {
    const { fallback } = classifyBlocks(scrambledPage.blocks);
    expect(fallback).toHaveLength(2); // 0.22 is below retake, but still fallback
    expect(needsManualInput([scrambledPage])).toBe(true);
  });

  it('multi-page: manual input true if any page has low blocks', () => {
    expect(multiPageResult.needsManualInput).toBe(true);
    expect(needsManualInput(multiPageResult.pages)).toBe(true);
  });

  it('all pages clear = no manual input', () => {
    const doubleClear = makeOcrResult([clearPage, clearPage]);
    expect(doubleClear.needsManualInput).toBe(false);
  });

  it('lowConfidenceBlocks count matches fallback count', () => {
    expect(mixedResult.lowConfidenceBlocks).toBe(2);
    expect(scienceLowResult.lowConfidenceBlocks).toBe(3);
    expect(scrambledResult.lowConfidenceBlocks).toBe(2);
    expect(clearResult.lowConfidenceBlocks).toBe(0);
  });
});

describe('MANFALL-03: Manual input item extraction', () => {
  it('mixed page produces 2 manual items', () => {
    const items = buildManualItems(mixedResult.pages);
    expect(items).toHaveLength(2);
  });

  it('items preserve original text', () => {
    const items = buildManualItems(mixedResult.pages);
    expect(items[0].originalText).toBe('2. 6/ × 8 = ?');
    expect(items[1].originalText).toBe('3. There arie 5 bags.');
  });

  it('items have sequential indices', () => {
    const items = buildManualItems(mixedResult.pages);
    expect(items[0].itemIndex).toBe(0);
    expect(items[1].itemIndex).toBe(1);
  });

  it('items reference correct page', () => {
    const items = buildManualItems(multiPageResult.pages);
    // Page 0 has no low items, page 1 has 3
    expect(items).toHaveLength(3);
    for (const item of items) expect(item.pageIndex).toBe(1);
  });

  it('clear page produces 0 items', () => {
    const items = buildManualItems([clearPage]);
    expect(items).toHaveLength(0);
  });

  it('science low page: 3 items extracted', () => {
    const items = buildManualItems([scienceLowPage]);
    expect(items).toHaveLength(3);
  });

  it('item ordering follows page then block order', () => {
    const items = buildManualItems([scienceLowPage]);
    expect(items[0].itemIndex).toBe(0);
    expect(items[1].itemIndex).toBe(1);
    expect(items[2].itemIndex).toBe(2);
  });
});

describe('MANFALL-04: Manual input merge into OCR pages', () => {
  it('merges 2 manual corrections into mixed page', () => {
    const inputs = ['2. 6 × 8 = ?', '3. There are 5 bags.'];
    const { pages, mergedCount } = mergeManualInputs([mixedPage], inputs);

    expect(mergedCount).toBe(2);
    expect(pages[0].blocks[1].text).toBe('2. 6 × 8 = ?');
    expect(pages[0].blocks[2].text).toBe('3. There are 5 bags.');
  });

  it('merged blocks are marked manuallyEntered', () => {
    const inputs = ['2. 6 × 8 = ?', '3. There are 5 bags.'];
    const { pages } = mergeManualInputs([mixedPage], inputs);

    expect(pages[0].blocks[1].manuallyEntered).toBe(true);
    expect(pages[0].blocks[2].manuallyEntered).toBe(true);
  });

  it('merged blocks get confidence 0.95', () => {
    const inputs = ['2. 6 × 8 = ?', '3. There are 5 bags.'];
    const { pages } = mergeManualInputs([mixedPage], inputs);

    expect(pages[0].blocks[1].confidence).toBe(MANUAL_CONFIDENCE);
    expect(pages[0].blocks[2].confidence).toBe(MANUAL_CONFIDENCE);
  });

  it('non-fallback blocks are unchanged', () => {
    const inputs = ['2. 6 × 8 = ?', '3. There are 5 bags.'];
    const { pages } = mergeManualInputs([mixedPage], inputs);

    expect(pages[0].blocks[0].text).toBe('1. 4 × 7 = ?');
    expect(pages[0].blocks[0].confidence).toBe(0.91);
    expect(pages[0].blocks[0].manuallyEntered).toBeUndefined();
    expect(pages[0].blocks[3].text).toBe('4. Each bag has 9 apples.');
    expect(pages[0].blocks[4].text).toBe('5. How many apple?');
  });

  it('empty manual input string — block not merged', () => {
    const inputs = ['', '3. There are 5 bags.'];
    const { pages, mergedCount } = mergeManualInputs([mixedPage], inputs);

    expect(mergedCount).toBe(1); // Only the second one merged
    expect(pages[0].blocks[1].text).toBe('2. 6/ × 8 = ?'); // unchanged
    expect(pages[0].blocks[1].manuallyEntered).toBeUndefined();
  });

  it('whitespace-only manual input — block not merged', () => {
    const inputs = ['   ', '3. There are 5 bags.'];
    const { pages, mergedCount } = mergeManualInputs([mixedPage], inputs);

    expect(mergedCount).toBe(1);
    expect(pages[0].blocks[1].text).toBe('2. 6/ × 8 = ?');
  });

  it('null/undefined manual input — block not merged', () => {
    const inputs = [null, '3. There are 5 bags.'];
    const { pages, mergedCount } = mergeManualInputs([mixedPage], inputs);

    expect(mergedCount).toBe(1);
  });

  it('fewer inputs than fallback blocks — only first N merged', () => {
    const inputs = ['1. Water boils when heated.'];
    const { pages, mergedCount } = mergeManualInputs([scienceLowPage], inputs);

    expect(mergedCount).toBe(1);
    expect(pages[0].blocks[0].text).toBe('1. Water boils when heated.');
    expect(pages[0].blocks[0].manuallyEntered).toBe(true);
    expect(pages[0].blocks[1].text).toBe('2. A plants need ___ to grow.'); // unchanged
  });

  it('more inputs than fallback blocks — extras ignored', () => {
    const inputs = ['q1 fix', 'q2 fix', 'q3 fix', 'q4 extra', 'q5 extra'];
    const { pages, mergedCount } = mergeManualInputs([scienceLowPage], inputs);

    expect(mergedCount).toBe(3); // Only 3 fallback blocks exist
  });

  it('merge on multi-page result', () => {
    // Page 0: no fallback. Page 1: 3 fallback blocks.
    const inputs = ['1. Water boils when heated.', '2. A plant needs water to grow.', '3. The sun is a star.'];
    const { pages, mergedCount } = mergeManualInputs(multiPageResult.pages, inputs);

    expect(mergedCount).toBe(3);
    // Page 0 unchanged
    expect(pages[0].blocks[1].text).toBe(multiPageResult.pages[0].blocks[1].text);
    // Page 1 fully corrected
    expect(pages[1].blocks[0].text).toBe('1. Water boils when heated.');
    expect(pages[1].blocks[1].text).toBe('2. A plant needs water to grow.');
    expect(pages[1].blocks[2].text).toBe('3. The sun is a star.');
    // All page 1 blocks now high confidence
    for (const b of pages[1].blocks) {
      expect(b.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
    }
  });
});

describe('MANFALL-05: Post-merge fullText rebuild', () => {
  it('fullText reflects merged corrections', () => {
    const original = rebuildFullText([mixedPage]);
    expect(original).toContain('2. 6/ × 8 = ?');
    expect(original).toContain('3. There arie 5 bags.');

    const inputs = ['2. 6 × 8 = ?', '3. There are 5 bags.'];
    const { pages } = mergeManualInputs([mixedPage], inputs);
    const rebuilt = rebuildFullText(pages);

    expect(rebuilt).toContain('2. 6 × 8 = ?');
    expect(rebuilt).toContain('3. There are 5 bags.');
    expect(rebuilt).not.toContain('6/');
    expect(rebuilt).not.toContain('arie');
  });

  it('fullText is non-empty after merge', () => {
    const inputs = ['hello'];
    const { pages } = mergeManualInputs([scienceLowPage], inputs);
    const rebuilt = rebuildFullText(pages);
    expect(rebuilt.length).toBeGreaterThan(0);
  });

  it('rebuild preserves block ordering', () => {
    const rebuilt = rebuildFullText([mixedPage]);
    const lines = rebuilt.split('\n');
    expect(lines[0]).toContain('4 × 7');
    expect(lines[1]).toContain('6/');
    expect(lines[2]).toContain('arie');
    expect(lines[3]).toContain('Each bag');
    expect(lines[4]).toContain('How many');
  });
});

describe('MANFALL-06: Inference readiness after merge', () => {
  it('merged result is ready for inference', () => {
    const inputs = ['2. 6 × 8 = ?', '3. There are 5 bags.'];
    const { pages } = mergeManualInputs([mixedPage], inputs);
    expect(isReadyForInference(pages)).toBe(true);
  });

  it('partial merge may still leave low blocks', () => {
    // Only fix 1 of 2 low blocks
    const inputs = ['2. 6 × 8 = ?'];
    const { pages } = mergeManualInputs([mixedPage], inputs);
    expect(isReadyForInference(pages)).toBe(false); // block[2] still low
  });

  it('fully corrected Chinese page is ready', () => {
    const inputs = ['乐快', '用认真造句：他认真学习。'];
    const { pages } = mergeManualInputs([chinesePage], inputs);
    expect(isReadyForInference(pages)).toBe(true);
  });

  it('no manual inputs needed → already ready', () => {
    expect(isReadyForInference([clearPage])).toBe(true);
  });

  it('fully corrected scrambled page ready', () => {
    // Note: confidence 0.22 block is below RETAKE_THRESHOLD (0.3) but still merged
    const inputs = ['1. What is 3/4 of 20?', '2. a ÷ b = 12'];
    const { pages } = mergeManualInputs([scrambledPage], inputs);
    expect(isReadyForInference(pages)).toBe(true);
  });

  it('still needs retake if empty inputs for very-low blocks', () => {
    // Scrambled page: block[0]=0.22, block[1]=0.31. Both are fallback.
    // Provide empty for block[0] (skip), fix for block[1] — block[0] stays at 0.22
    const inputs = ['', '2. a ÷ b = 12'];
    const { pages } = mergeManualInputs([scrambledPage], inputs);
    // block[0] still has confidence 0.22 < 0.3
    expect(stillNeedsRetake(pages)).toBe(true);
  });

  it('all corrected → no retake needed', () => {
    const inputs = ['1. What is 3/4 of 20?', '2. a ÷ b = 12'];
    const { pages } = mergeManualInputs([scrambledPage], inputs);
    expect(stillNeedsRetake(pages)).toBe(false);
  });
});

describe('MANFALL-07: PSLE heavy degradation scenario', () => {
  it('4 blocks, 3 fallback, 1 good', () => {
    const { good, fallback } = classifyBlocks(pslePage.blocks);
    expect(good).toHaveLength(1);
    expect(fallback).toHaveLength(3);
  });

  it('needs manual input', () => {
    expect(needsManualInput([pslePage])).toBe(true);
  });

  it('3 items extracted for manual input', () => {
    const items = buildManualItems([pslePage]);
    expect(items).toHaveLength(3);
  });

  it('full correction makes it ready', () => {
    const inputs = [
      'The ratio of boys to girls is 3:5.',
      'There are 240 more girls',
      'than boys.',
    ];
    const { pages, mergedCount } = mergeManualInputs([pslePage], inputs);
    expect(mergedCount).toBe(3);
    expect(isReadyForInference(pages)).toBe(true);
  });

  it('corrected text contains no OCR noise', () => {
    const inputs = [
      'The ratio of boys to girls is 3:5.',
      'There are 240 more girls than boys.',
      'How many students are there altogether?',
    ];
    const { pages } = mergeManualInputs([pslePage], inputs);
    const rebuilt = rebuildFullText(pages);
    expect(rebuilt).not.toContain('ratioP');
    expect(rebuilt).not.toContain('boy1s');
  });
});

describe('MANFALL-08: Bilingual OCR fallback (Simplified Chinese)', () => {
  it('Chinese page: 2 fallback, 2 good', () => {
    const { good, fallback } = classifyBlocks(chinesePage.blocks);
    expect(good).toHaveLength(2);
    expect(fallback).toHaveLength(2);
  });

  it('Chinese manual items preserve Chinese text', () => {
    const items = buildManualItems([chinesePage]);
    expect(items[0].originalText).toBe('2. 乐___');
    expect(items[1].originalText).toBe('造句：认真');
  });

  it('Chinese corrections merge correctly', () => {
    const inputs = ['乐快', '用认真造句：他认真学习。'];
    const { pages, mergedCount } = mergeManualInputs([chinesePage], inputs);

    expect(mergedCount).toBe(2);
    expect(pages[0].blocks[1].text).toBe('乐快');
    expect(pages[0].blocks[3].text).toBe('用认真造句：他认真学习。');
  });

  it('merged Chinese blocks have confidence 0.95', () => {
    const inputs = ['乐快', '用认真造句：他认真学习。'];
    const { pages } = mergeManualInputs([chinesePage], inputs);
    expect(pages[0].blocks[1].confidence).toBe(MANUAL_CONFIDENCE);
    expect(pages[0].blocks[3].confidence).toBe(MANUAL_CONFIDENCE);
  });
});

describe('MANFALL-09: Edge cases and robustness', () => {
  it('empty pages array → no manual input, 0 blocks', () => {
    expect(needsManualInput([])).toBe(false);
    expect(buildManualItems([])).toHaveLength(0);
    expect(isReadyForInference([])).toBe(true);
    expect(stillNeedsRetake([])).toBe(false);
  });

  it('page with no blocks → no manual input', () => {
    const emptyPage = makePage([]);
    expect(emptyPage.hasManualInput).toBe(false);
    expect(needsManualInput([emptyPage])).toBe(false);
  });

  it('all blocks at exactly threshold → no fallback', () => {
    const blocks: OcrTextBlock[] = [
      { text: 'a', confidence: CONFIDENCE_THRESHOLD },
      { text: 'b', confidence: CONFIDENCE_THRESHOLD },
    ];
    const page = makePage(blocks);
    expect(page.hasManualInput).toBe(false);
    const { fallback } = classifyBlocks(blocks);
    expect(fallback).toHaveLength(0);
  });

  it('single block below threshold → manual input triggered', () => {
    const blocks: OcrTextBlock[] = [{ text: 'smudge', confidence: 0.3 }];
    const page = makePage(blocks);
    expect(page.hasManualInput).toBe(true);
    expect(needsManualInput([page])).toBe(true);
  });

  it('very low confidence (0.01) still handled gracefully', () => {
    const blocks: OcrTextBlock[] = [{ text: '????', confidence: 0.01 }];
    const page = makePage(blocks);
    const items = buildManualItems([page]);
    expect(items).toHaveLength(1);
    expect(items[0].originalText).toBe('????');

    const { pages, mergedCount } = mergeManualInputs([page], ['corrected']);
    expect(mergedCount).toBe(1);
    expect(pages[0].blocks[0].text).toBe('corrected');
    expect(pages[0].blocks[0].confidence).toBe(MANUAL_CONFIDENCE);
  });

  it('non-text characters in manual input accepted', () => {
    const inputs = ['a = b / c', 'x² + y² = z²'];
    const { pages, mergedCount } = mergeManualInputs([scienceLowPage], inputs);
    expect(mergedCount).toBe(2);
    expect(pages[0].blocks[0].text).toBe('a = b / c');
  });

  it('merge does not affect blocks on other pages', () => {
    const inputs = ['1. Water boils when heated.', '2. A plant needs water.', '3. The sun is a star.'];
    const { pages } = mergeManualInputs(multiPageResult.pages, inputs);
    // Page 0 blocks should be completely untouched
    for (let i = 0; i < multiPageResult.pages[0].blocks.length; i++) {
      expect(pages[0].blocks[i].text).toBe(multiPageResult.pages[0].blocks[i].text);
      expect(pages[0].blocks[i].confidence).toBe(multiPageResult.pages[0].blocks[i].confidence);
    }
  });

  it('rebuild fullText is deterministic given same blocks', () => {
    const a = rebuildFullText([mixedPage]);
    const b = rebuildFullText([mixedPage]);
    expect(a).toBe(b);
  });

  it('classifyBlocks is deterministic', () => {
    const a = classifyBlocks(mixedPage.blocks);
    const b = classifyBlocks(mixedPage.blocks);
    expect(a.good).toHaveLength(b.good.length);
    expect(a.fallback).toHaveLength(b.fallback.length);
  });
});

describe('MANFALL-10: Full flow simulation (OCR→fallback→merge→ready)', () => {
  it('end-to-end: clear photo → no fallback → straight to inference', () => {
    // Simulate: photo taken, OCR runs
    const ocrResult = clearResult;

    // Stage 1: check if manual input needed
    const needsFallback = ocrResult.needsManualInput;
    expect(needsFallback).toBe(false);

    // Stage 2: should proceed directly to inference
    expect(isReadyForInference(ocrResult.pages)).toBe(true);
  });

  it('end-to-end: smudged photo → fallback triggered → kid types → merged → inference', () => {
    // Simulate: photo taken, OCR runs, some blocks unclear
    const ocrResult = mixedResult;

    // Stage 1: manual input needed
    expect(ocrResult.needsManualInput).toBe(true);
    expect(ocrResult.lowConfidenceBlocks).toBe(2);

    // Stage 2: build manual input items for the modal
    const manualItems = buildManualItems(ocrResult.pages);
    expect(manualItems).toHaveLength(2);

    // Stage 3: kid types corrections (simulated)
    const kidCorrections = manualItems.map((item) => {
      if (item.originalText.includes('6/')) return '2. 6 × 8 = ?';
      if (item.originalText.includes('arie')) return '3. There are 5 bags.';
      return item.originalText; // fallback: keep original
    });

    // Stage 4: merge corrections
    const { pages, mergedCount } = mergeManualInputs(ocrResult.pages, kidCorrections);
    expect(mergedCount).toBe(2);

    // Stage 5: rebuild fullText
    const correctedFullText = rebuildFullText(pages);

    // Stage 6: verify ready for inference
    expect(isReadyForInference(pages)).toBe(true);
    expect(correctedFullText).not.toContain('6/');
    expect(correctedFullText).not.toContain('arie');
    expect(correctedFullText).toContain('6 × 8 = ?');
    expect(correctedFullText).toContain('There are 5 bags.');
  });

  it('end-to-end: partially corrected → not ready', () => {
    const ocrResult = mixedResult;

    const kidCorrections = ['2. 6 × 8 = ?']; // Only fixed one
    const { pages, mergedCount } = mergeManualInputs(ocrResult.pages, kidCorrections);

    expect(mergedCount).toBe(1);
    // Still has one low-confidence block
    expect(isReadyForInference(pages)).toBe(false);
  });

  it('end-to-end: kid skips all corrections → blocks unchanged', () => {
    const ocrResult = mixedResult;
    const kidCorrections = ['', '']; // Empty inputs
    const { pages, mergedCount } = mergeManualInputs(ocrResult.pages, kidCorrections);

    expect(mergedCount).toBe(0);
    expect(isReadyForInference(pages)).toBe(false);
    // Original text preserved
    expect(pages[0].blocks[1].text).toBe('2. 6/ × 8 = ?');
  });

  it('end-to-end: multi-page with mixed quality', () => {
    const ocrResult = multiPageResult;

    // Page 0: clear, Page 1: 3 low blocks
    expect(ocrResult.needsManualInput).toBe(true);
    const items = buildManualItems(ocrResult.pages);
    expect(items).toHaveLength(3);

    const corrections = ['1. Water boils when heated.', '2. A plant needs water.', '3. The sun is a star.'];
    const { pages, mergedCount } = mergeManualInputs(ocrResult.pages, corrections);

    expect(mergedCount).toBe(3);
    expect(isReadyForInference(pages)).toBe(true);

    // Page 0 unchanged
    expect(pages[0].blocks[1].text).toBe('2. 6 × 8 = ?');
  });
});
