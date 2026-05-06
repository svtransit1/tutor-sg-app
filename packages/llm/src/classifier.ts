import type { Subject } from './routing';

// ──────────────────────────────────────────────
// Subject Classifier — on-device rule-based
// Routes homework text → subject → correct LLM
// ──────────────────────────────────────────────

/**
 * Confidence-scored classification result.
 */
export interface ClassificationResult {
  subject: Subject;
  /** Score in 0–1 range. ≥0.7 = strong signal, <0.4 = uncertain. */
  confidence: number;
  /** Normalized scores for all 4 subjects (debug / logging). */
  scores: Record<Subject, number>;
}

// ────── Signal definitions ────────────────────

interface Signal {
  /** Regex pattern (case-insensitive). Use word boundaries where appropriate. */
  pattern: RegExp;
  /** Weight contributed to the subject score (positive or negative). */
  weight: number;
}

/** Subject-specific signals grouped for clarity. */
type SubjectSignals = Record<Subject, Signal[]>;

/**
 * Primary keyword + pattern signals per subject.
 * Weights are tuned so that strong signals from a single subject usually
 * outweigh weak / incidental signals from another subject.
 *
 * NOTE: If you add or tweak signals, run `packages/llm` tests to verify
 * no regressions on the known-good classification set.
 */
const SIGNALS: SubjectSignals = {
  math: [
    // Equations / explicit operators (strong)
    { pattern: /[+\-–]\s*\d/i, weight: 0.6 },
    { pattern: /[×x]\s*\d/i, weight: 0.6 },
    { pattern: /[÷/]\s*\d/i, weight: 0.6 },
    { pattern: /[=≠<>≤≥]/, weight: 0.4 },
    { pattern: /\d\s*[+\-–×x÷/]\s*\d/, weight: 0.7 },
    // Unit patterns (standalone number + unit)
    { pattern: /\d+\s*(cm|metre|meter|m\b|km|kilogram|kg|gram|g\b|millilitre|milliliter|ml|litre|liter|l\b|ℓ)/i, weight: 0.5 },
    { pattern: /[$¢€]/, weight: 0.4 },
    // Math word-problem phrasing (flexible pattern — matches even with words in between)
    { pattern: /how many.*\b(more|less|left|altogether|in total|are there)\b/i, weight: 0.5 },
    { pattern: /how much.*\b(more|less|left|change|did (she|he|they) (receive|pay|have))\b/i, weight: 0.5 },
    { pattern: /\b(total|altogether|in all|remaining|left over)\b/i, weight: 0.3 },
    // Math-specific nouns / phrases
    { pattern: /\b(angle|triangle|rectangle|square|circle|polygon|perimeter|area|volume|circumference|diameter|radius)\b/i, weight: 0.7 },
    { pattern: /\b(fraction|decimal|percentage?|ratio|proportion|average|mean|median|mode)\b/i, weight: 0.7 },
    { pattern: /\b(sum|product|quotient|difference)\b/i, weight: 0.6 },
    { pattern: /\b(times|multipl(y|ied)|divide[ds]?|add(s|ed)?|subtract(s|ed)?)\b/i, weight: 0.5 },
    { pattern: /\b(bar model|number bond|part-whole|heuristic|guess and check|working backwards)\b/i, weight: 0.6 },
    { pattern: /\b(speed|distance|time)\b.*\b(km\/h|m\/s|km per hour|metres per second)/i, weight: 0.5 },
    { pattern: /\b(mass|weight|length|capacity|volume)\b.*\b(kg|g\b|cm|m\b|l\b|ml)\b/i, weight: 0.4 },
    // Number-heavy (3+ standalone 2-digit+ numbers)
    { pattern: /\b\d{2,}\b.*\b\d{2,}\b.*\b\d{2,}\b/, weight: 0.3 },
    // Chinese math keywords (weighted to compete with CJK boost for zh-Hans math problems)
    { pattern: /(面积|周长|体积|角度|分数|小数|比例|百分比|计算|算式|方程式|应用题)/, weight: 0.6 },
    { pattern: /(三角形|长方形|正方形|圆形|梯形|菱形|多边形)/, weight: 0.6 },
    { pattern: /(底|高|边长|半径|直径|圆周率)/, weight: 0.4 },
    { pattern: /(平方|立方|厘米|毫米|米|千米|公里)/, weight: 0.4 },
    { pattern: /(和|差|积|商|乘以|除以|加上|减去|等于|是……的|共有)/, weight: 0.5 },
  ],

  science: [
    // Strong biology signals
    { pattern: /\b(photosynthesis|respiration|digestion|circulat(ory|ion)|respiratory|skeletal|nervous)\b/i, weight: 0.7 },
    { pattern: /\b(chlorophyll|chloroplast|cell wall|nucleus|membrane|cytoplasm)\b/i, weight: 0.7 },
    { pattern: /\b(living things?|non-living|organism|habitat|ecosystem|food chain|food web|producer|consumer|decomposer)\b/i, weight: 0.7 },
    { pattern: /\b(life cycle|reproduce|offspring|inherit|characteristics? of living)\b/i, weight: 0.6 },
    // Strong physics signals
    { pattern: /\b(gravity|friction|magnet(ic|ism)?|force|energy|kinetic|potential|elastic)\b/i, weight: 0.7 },
    { pattern: /\b(electric(ity|al)?|circuit|conductor|insulator|current|voltage|resistance)\b/i, weight: 0.7 },
    { pattern: /\b(heat|temperature|thermometer|expand|contract|freeze|melt|conduct(ion|or|ivity))\b/i, weight: 0.6 },
    { pattern: /\b(shadow|light|reflect(ion)?|refract(ion)?|transparent|translucent|opaque)\b/i, weight: 0.5 },
    // Strong chemistry / matter signals
    { pattern: /\b(solid|liquid|gas|states? of matter|evaporat(e|ion)|condens(e|ation))\b/i, weight: 0.7 },
    { pattern: /\b(material|property|absorb|repel|dissolve|soluble|insoluble|mixture|solution)\b/i, weight: 0.6 },
    // Water cycle / Earth / Space
    { pattern: /\b(water cycle|precipitation|transpiration|water vapour|groundwater)\b/i, weight: 0.7 },
    { pattern: /\b(weather|climate|season|rotation|revolution|orbit|satellite|planet|solar system)\b/i, weight: 0.5 },
    // Plant-specific
    { pattern: /\b(seed|germinate|seedling|roots?|stem|leaf|leaves|flower|fruit|dispersal|pollination)\b/i, weight: 0.5 },
    // C-E-R / scientific structure
    { pattern: /\b(claim|evidence|reasoning|observation|conclusion|hypothesis|experiment)\b/i, weight: 0.5 },
    // Chinese science keywords (higher weight to compete with CJK boost)
    { pattern: /(光合作用|细胞|细胞壁|细胞膜|细胞核|叶绿体|叶绿素)/, weight: 0.6 },
    { pattern: /(重力|磁铁|导体|绝缘体|蒸发|凝结|食物链|食物网)/, weight: 0.6 },
    { pattern: /(栖息地|生态系统|呼吸系统|血液循环|消化系统|骨骼系统)/, weight: 0.6 },
    { pattern: /(植物|动物|生物|非生物|生命|繁殖|后代|遗传)/, weight: 0.5 },
    { pattern: /(固体|液体|气体|物质|溶解|混合物|溶液)/, weight: 0.5 },
    { pattern: /(水循环|降水|自转|公转)/, weight: 0.5 },
    { pattern: /(种子|发芽|根|茎|叶|花|果实|传播|授粉)/, weight: 0.4 },
  ],

  english: [
    // Strong ELA signals
    { pattern: /\b(comprehension|passage|inference|synthesis and transform(ation)?)\b/i, weight: 0.7 },
    { pattern: /\b(grammar|punctuation|subject-verb agreement|tense|past tense|present tense|continuous tense)\b/i, weight: 0.7 },
    { pattern: /\b(vocabulary|synonym|antonym|definition|meaning|phrase|word class)\b/i, weight: 0.6 },
    { pattern: /\b(composition|writing|paragraph|essay|topic sentence|continuous writing)\b/i, weight: 0.6 },
    { pattern: /\b(PEE?L|point.*evidence.*explanation)\b/i, weight: 0.5 },
    { pattern: /\b(cloze passage|cloze|fill in the blanks?|multiple choice|editing|grammar (cloze|MCQ))\b/i, weight: 0.5 },
    { pattern: /\b(noun|verb|adjective|adverb|preposition|conjunction|pronoun|determiner|quantifier)\b/i, weight: 0.6 },
    { pattern: /\b(active voice|passive voice|direct speech|indirect speech|reported speech)\b/i, weight: 0.6 },
    { pattern: /\b(homophone|homonym|contraction|prefix|suffix|root word|compound word)\b/i, weight: 0.5 },
    { pattern: /\b(oral|listening comprehension|reading|writing|speaking)\b/i, weight: 0.3 },
    { pattern: /\b(spelling|grammatical error|correct word|underlined word)\b/i, weight: 0.4 },
    // Chinese English keywords (when English class is instructed in Chinese)
    { pattern: /(阅读理解|完形填空|语法|词汇|写作|作文|英译中|中译英)/, weight: 0.4 },
  ],

  chinese_mt: [
    // Script-based (computed separately in classify())
    // These signals are additive on top of the CJK ratio
    { pattern: /(课文|阅读|短文|段落|句子|词语|生字|笔画|部首|拼音)/, weight: 0.6 },
    { pattern: /(阅读理解|完形填空|作文|命题作文|看图作文|实用文)/, weight: 0.7 },
    { pattern: /(造句|组词|近义词|反义词|同音词|形近字)/, weight: 0.7 },
    { pattern: /(把字句|被字句|陈述句|疑问句|感叹句|祈使句)/, weight: 0.6 },
    { pattern: /(华文|华语|母语|\bMT\b)/i, weight: 0.5 },
    { pattern: /(默写|背诵|听写|朗读|朗读题)/, weight: 0.5 },
    // Pinyin patterns
    { pattern: /[a-z]+\b[1-4]/i, weight: 0.3 },
    { pattern: /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/, weight: 0.8 },
  ],
};

// ────── Script detection ──────────────────────

/** CJK Unified Ideographs range (Simplified Chinese heavily overlaps). */
const CJK_PATTERN = /[\u4E00-\u9FFF\u3400-\u4DBF]/g;

/**
 * Returns the fraction of characters that are CJK ideographs.
 */
function cjkProportion(text: string): number {
  const chars = text.replace(/\s/g, '');
  if (chars.length === 0) return 0;
  const cjkCount = (text.match(CJK_PATTERN) ?? []).length;
  return cjkCount / chars.length;
}

// ────── Pattern match engine ──────────────────

/**
 * Sum the weights of all matching signals for a given subject.
 * Each signal matches at most once (no double-counting on repeats).
 */
function scoreSubject(text: string, signals: Signal[]): number {
  let score = 0;
  for (const signal of signals) {
    if (signal.pattern.test(text)) {
      score += signal.weight;
    }
  }
  return score;
}

// ────── Normalization ─────────────────────────

/**
 * Softmax-like normalisation that still allows clear winners when totals are low.
 * Scores below THRESHOLD are clamped to 0 to avoid noise.
 */
export function normalizeScores(raw: Record<Subject, number>): Record<Subject, number> {
  const THRESHOLD = 0.01;
  const entries = (Object.keys(raw) as Subject[]).map((k) => ({
    key: k,
    val: raw[k] < THRESHOLD ? 0 : raw[k],
  }));
  const total = entries.reduce((sum, e) => sum + e.val, 0);
  if (total === 0) return { english: 0, math: 0, science: 0, chinese_mt: 0 };
  const result = {} as Record<Subject, number>;
  for (const { key, val } of entries) {
    result[key] = val / total;
  }
  return result;
}

// ────── Public API ────────────────────────────

/**
 * Classify a text chunk (from OCR or manual entry) into a school subject.
 *
 * - Designed to run on-device at <1 ms on any realistic homework text.
 * - No LLM dependency — this is the gate that decides *which* LLM to use.
 * - CJK script detection gates Chinese MT routing.
 * - Keyword/signal scoring breaks ties among English / Math / Science.
 *
 * @param text — raw text from OCR or typed input (EN or zh-Hans)
 * @returns ClassificationResult with subject, confidence, and per-subject scores
 */
export function classify(text: string): ClassificationResult {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return {
      subject: 'english',
      confidence: 0,
      scores: { english: 0, math: 0, science: 0, chinese_mt: 0 },
    };
  }

  const cjkFrac = cjkProportion(trimmed);

  // Compute raw keyword scores per subject
  const rawScores: Record<Subject, number> = {
    english: scoreSubject(trimmed, SIGNALS.english),
    math: scoreSubject(trimmed, SIGNALS.math),
    science: scoreSubject(trimmed, SIGNALS.science),
    chinese_mt: scoreSubject(trimmed, SIGNALS.chinese_mt),
  };

  // ── Script-based boost for Chinese MT ──
  // CJK proportion adds a scaled signal to Chinese MT.
  // Kept moderate so explicit math/science/english keyword matches can override.
  // Multiple subject-specific Chinese keywords should collectively beat this boost.
  if (cjkFrac > 0.5) {
    rawScores.chinese_mt += cjkFrac * 0.5;
  } else if (cjkFrac > 0.2) {
    rawScores.chinese_mt += cjkFrac * 0.25;
  }

  // ── Numbers + operators → anti-signal for English (usually Math/Science) ──
  const hasNumbers = /\d/.test(trimmed);
  const hasOperators = /[+\-–×x÷/=]/.test(trimmed);
  if (hasNumbers && hasOperators && cjkFrac < 0.4) {
    // Soft penalty on English — bump math when it has no explicit signals yet
    if (rawScores.english > 0 && rawScores.math === 0 && rawScores.science === 0) {
      rawScores.math += 0.5;
    }
  }

  // ── Implicit English baseline for plausible-but-sparse text ──
  // When no other subject has strong signals, give English a tiny baseline
  // so it wins with non-zero confidence rather than 0.
  if (rawScores.math === 0 && rawScores.science === 0 && rawScores.chinese_mt === 0) {
    rawScores.english += 0.08;
  }

  // ── Normalize and pick winner ──
  const scores = normalizeScores(rawScores);
  const subject = (Object.entries(scores) as [Subject, number][]).reduce(
    (best, [k, v]) => (v > best[1] ? [k, v] : best),
    ['english' as Subject, -1],
  );

  // ── Confidence: winning score as proportion of total signal ──
  const confidence = scores[subject[0]];

  return {
    subject: subject[0],
    confidence,
    scores,
  };
}

/**
 * Convenience: classify and resolve model in one call.
 * Requires the device tier to be known beforehand.
 */
export { resolveModel } from './routing';
