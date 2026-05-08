export type Subject = 'math' | 'english' | 'chinese_mt' | 'science';
export type DetectedLanguage = 'en' | 'zh-Hans' | 'mixed';

export interface SubjectClassification {
  subject: Subject | 'unknown';
  confidence: number;
  detectedLanguage: DetectedLanguage;
  scores: Record<Subject, number>;
}

// ── Keyword banks ───────────────────────────────────────────────────

interface KeywordGroup {
  keywords: string[];
  weight: number;
}

type KeywordBank = Record<Subject, KeywordGroup[]>;

const EN_MATH: KeywordGroup[] = [
  { weight: 1.0, keywords: ['sum', 'difference', 'product', 'quotient', 'add', 'subtract', 'multiply', 'divide', 'plus', 'minus', 'times', 'remainder', 'total', 'altogether', 'left', 'gave away', 'gives away', 'sold', 'bought', 'how many more'] },
  { weight: 1.2, keywords: ['fraction', 'fractions', 'decimal', 'decimals', 'numerator', 'denominator', 'percentage', 'percent', 'ratio', 'proportion', 'equivalent fraction', 'simplest form', 'mixed number', 'improper fraction'] },
  { weight: 1.5, keywords: ['area', 'perimeter', 'volume', 'angle', 'angles', 'triangle', 'triangles', 'rectangle', 'square', 'circle', 'cube', 'cuboid', 'length', 'breadth', 'height', 'width', 'radius', 'diameter', 'circumference', 'geometry', 'rhombus', 'parallelogram', 'trapezium', 'right angle', 'acute', 'obtuse', 'polygon', 'symmetry', 'tessellation', 'semicircle'] },
  { weight: 1.0, keywords: ['metre', 'centimetre', 'kilometre', 'gram', 'kilogram', 'litre', 'millilitre', 'mass', 'weight', 'capacity', 'distance', 'speed', 'rate'] },
  { weight: 1.5, keywords: ['graph', 'chart', 'pictogram', 'bar graph', 'line graph', 'average', 'mean', 'median', 'mode', 'table', 'tally'] },
  { weight: 1.5, keywords: ['equation', 'solve', 'value of', 'unknown', 'variable', 'algebra', 'expression', 'evaluate', 'simplify', 'expand', 'factorise'] },
  { weight: 0.8, keywords: ['how many', 'how much', 'what is the', 'find the', 'calculate', 'how long', 'what fraction', 'estimate', 'measure', 'convert', 'work out', 'show your working'] },
  { weight: 1.2, keywords: ['minute', 'minutes', 'hour', 'hours', 'day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years', 'calendar', 'duration', 'o\'clock', 'half past', 'quarter past', 'quarter to'] },
  { weight: 1.2, keywords: ['dollar', 'dollars', 'cent', 'cents', 'money', 'price', 'cost', 'change', 'discount'] },
];

const ZH_MATH: KeywordGroup[] = [
  { weight: 1.0, keywords: ['数学', '计算', '加', '减', '乘', '除', '加法', '减法', '乘法', '除法', '算式', '算一算'] },
  { weight: 1.2, keywords: ['分数', '小数', '百分数', '百分比', '比', '比例', '分子', '分母', '约分', '通分', '最简分数', '带分数', '假分数'] },
  { weight: 1.5, keywords: ['面积', '周长', '体积', '角', '三角形', '长方形', '正方形', '圆形', '立方体', '长方体', '正方体', '棱柱', '棱锥', '梯形', '平行四边形', '菱形', '直角', '锐角', '钝角', '多边形', '对称', '密铺', '边长'] },
  { weight: 1.0, keywords: ['米', '厘米', '千米', '毫米', '克', '千克', '升', '毫升', '长度', '质量', '重量', '容量', '距离', '速度'] },
  { weight: 1.5, keywords: ['图表', '统计图', '象形图', '条形图', '折线图', '平均数', '中位数', '众数', '表格', '记录'] },
  { weight: 1.5, keywords: ['方程', '代数', '未知数', '算式', '表达式', '简化', '展开', '因式分解'] },
  { weight: 0.8, keywords: ['多少', '总共', '一共', '计算', '求', '找出', '估计', '测量', '换算', '值'] },
  { weight: 1.2, keywords: ['元', '角', '分', '钱', '价格', '找钱', '折扣', '便宜', '贵'] },
  { weight: 0.8, keywords: ['还有', '剩下', '余', '相差', '比', '多', '少', '倍'] },
];

const EN_ENGLISH: KeywordGroup[] = [
  { weight: 1.5, keywords: ['noun', 'nouns', 'verb', 'verbs', 'adjective', 'adjectives', 'adverb', 'adverbs', 'pronoun', 'pronouns', 'preposition', 'prepositions', 'conjunction', 'tense', 'tenses', 'singular', 'plural', 'subject verb agreement', 'countable', 'uncountable'] },
  { weight: 1.2, keywords: ['grammar', 'punctuation', 'capital letter', 'full stop', 'comma', 'apostrophe', 'question mark', 'exclamation', 'direct speech', 'indirect speech'] },
  { weight: 1.5, keywords: ['comprehension', 'passage', 'read the passage', 'based on the passage', 'according to', 'reading', 'infer', 'conclude', 'theme', 'character', 'setting', 'plot', 'main idea', 'purpose'] },
  { weight: 1.2, keywords: ['vocabulary', 'meaning', 'synonym', 'synonyms', 'antonym', 'antonyms', 'opposite', 'similar', 'definition', 'define', 'spell', 'spelling', 'cloze', 'phrase', 'phrases', 'word', 'words'] },
  { weight: 1.5, keywords: ['composition', 'essay', 'write', 'letter', 'letters', 'narrative', 'recount', 'description', 'introduction', 'conclusion', 'paragraph', 'paragraphs', 'story', 'diary', 'report'] },
  { weight: 1.5, keywords: ['fill in the blanks', 'fill in each blank', 'underline', 'circle the', 'choose the', 'correct the', 'rewrite', 'complete the sentence', 'rearrange', 'join the sentences', 'synthesis', 'transformation'] },
  { weight: 1.0, keywords: ['sentence', 'sentences', 'clause', 'clauses', 'simple sentence', 'compound sentence', 'complex sentence', 'connector', 'connectors'] },
  { weight: 1.5, keywords: ['continuous writing', 'situational writing', 'formal letter', 'informal letter', 'email', 'notice', 'poster'] },
];

const ZH_CHINESE: KeywordGroup[] = [
  { weight: 2.0, keywords: ['语文', '华文', '华语', '汉语', '中文'] },
  { weight: 1.5, keywords: ['汉字', '拼音', '笔画', '笔顺', '部首', '偏旁', '声母', '韵母', '声调', '认字', '识字', '写字', '多音字', '形近字'] },
  { weight: 1.5, keywords: ['阅读', '理解', '课文', '文章', '段落', '短文', '篇章', '默读', '朗读', '背诵', '默写', '听写'] },
  { weight: 1.5, keywords: ['作文', '写作', '造句', '填空', '选择', '完成句子', '重组句子', '造句练习', '看图作文', '命题作文'] },
  { weight: 1.2, keywords: ['词语', '成语', '谚语', '俗语', '句子', '主语', '谓语', '宾语', '定语', '状语', '补语', '量词'] },
  { weight: 1.0, keywords: ['标点', '逗号', '句号', '问号', '感叹号', '引号', '书名号', '顿号', '分号', '冒号'] },
  { weight: 1.2, keywords: ['记叙文', '说明文', '议论文', '描写', '叙述', '说明', '讨论', '人物', '事件', '地点', '时间'] },
  { weight: 1.5, keywords: ['同义词', '反义词', '近义词'] },
  { weight: 1.2, keywords: ['扩写', '缩写', '改写', '续写', '读后感'] },
  { weight: 1.0, keywords: ['口语', '对话', '会话', '表达', '交流'] },
];

const EN_SCIENCE: KeywordGroup[] = [
  { weight: 1.5, keywords: ['science', 'scientific', 'experiment', 'experiments', 'laboratory', 'investigation', 'observe', 'observation', 'observations', 'hypothesis', 'variable', 'variables', 'control', 'fair test', 'conclusion'] },
  { weight: 1.2, keywords: ['matter', 'material', 'materials', 'solid', 'solids', 'liquid', 'liquids', 'gas', 'gases', 'state of matter', 'property', 'properties', 'density', 'float', 'sink', 'absorb', 'repel'] },
  { weight: 1.0, keywords: ['temperature', 'thermometer', 'energy', 'electricity', 'circuit', 'circuits', 'battery', 'batteries', 'bulb', 'bulbs', 'switch', 'conductor', 'conductors', 'insulator', 'insulators', 'magnet', 'magnets', 'magnetic', 'force', 'forces', 'gravity', 'friction', 'push', 'pull', 'spring', 'elastic'] },
  { weight: 1.5, keywords: ['plant', 'plants', 'animal', 'animals', 'human', 'humans', 'organ', 'organs', 'heart', 'lungs', 'stomach', 'brain', 'skeleton', 'muscle', 'muscles', 'skin', 'blood', 'cell', 'cells', 'life cycle', 'reproduce', 'reproduction', 'seed', 'seeds', 'germination', 'flower', 'flowers', 'leaf', 'leaves', 'stem', 'stems', 'root', 'roots', 'fruit', 'fruits', 'disperse', 'dispersion', 'pollinate', 'pollination', 'butterfly', 'butterflies', 'frog', 'frogs', 'larva', 'larvae', 'pupa', 'metamorphosis', 'tadpole', 'caterpillar', 'chrysalis', 'nymph', 'egg', 'eggs', 'adult', 'offspring'] },
  { weight: 1.5, keywords: ['habitat', 'habitats', 'ecosystem', 'ecosystems', 'food chain', 'food web', 'producer', 'producers', 'consumer', 'consumers', 'predator', 'predators', 'prey', 'adapt', 'adaptation', 'survive', 'survival', 'endangered', 'extinct', 'camouflage'] },
  { weight: 1.2, keywords: ['water cycle', 'evaporation', 'condensation', 'precipitation', 'weather', 'climate', 'rain', 'wind', 'cloud', 'clouds', 'humidity', 'forecast'] },
  { weight: 1.5, keywords: ['earth', 'space', 'solar system', 'sun', 'moon', 'planet', 'planets', 'orbit', 'rotation', 'revolution', 'day', 'night', 'season', 'seasons', 'star', 'stars', 'constellation', 'red planet', 'mars', 'saturn', 'jupiter', 'mercury', 'venus', 'neptune', 'uranus'] },
  { weight: 1.0, keywords: ['recycle', 'recycling', 'environment', 'pollution', 'conservation', 'reduce', 'reuse', 'natural resource'] },
  { weight: 1.5, keywords: ['photosynthesis', 'respiration', 'digestion', 'circulation', 'breathing', 'excretion', 'growth', 'movement', 'sensitivity', 'nutrition'] },
  { weight: 1.5, keywords: ['rock', 'rocks', 'soil', 'soils', 'mineral', 'minerals', 'fossil', 'fossils', 'volcano', 'volcanoes', 'earthquake', 'earthquakes', 'erosion', 'weathering'] },
];

const ZH_SCIENCE: KeywordGroup[] = [
  { weight: 1.5, keywords: ['科学', '实验', '观察', '假设', '变量', '控制', '结论', '调查', '数据', '结果', '方法', '仪器', '公平测试'] },
  { weight: 1.2, keywords: ['物质', '材料', '固体', '液体', '气体', '状态', '性质', '质量', '体积', '密度', '浮', '沉'] },
  { weight: 1.0, keywords: ['温度', '温度计', '能量', '光', '声音', '电', '电路', '电池', '灯泡', '开关', '导体', '绝缘体', '磁铁', '磁力', '力', '重力', '摩擦力', '推', '拉', '弹簧', '弹性'] },
  { weight: 1.5, keywords: ['植物', '动物', '人体', '器官', '心脏', '肺', '胃', '脑', '骨骼', '肌肉', '皮肤', '血液', '细胞', '生命周期', '繁殖', '种子', '发芽', '花', '叶', '茎', '根', '果实', '传播', '授粉', '蝴蝶', '青蛙', '毛毛虫', '蛹', '蝌蚪', '幼虫', '变态'] },
  { weight: 1.5, keywords: ['栖息地', '生态系统', '食物链', '食物网', '生产者', '消费者', '捕食者', '猎物', '适应', '生存', '濒危', '灭绝', '保护色'] },
  { weight: 1.2, keywords: ['水循环', '蒸发', '凝结', '降水', '天气', '气候', '雨', '风', '云', '湿度', '预报'] },
  { weight: 1.5, keywords: ['地球', '太空', '太阳系', '太阳', '月亮', '行星', '轨道', '自转', '公转', '白天', '黑夜', '季节', '星星', '星座', '火星', '木星', '土星', '水星', '金星'] },
  { weight: 1.0, keywords: ['循环', '环境', '污染', '保护', '减少', '重复使用', '自然资源', '回收'] },
  { weight: 1.5, keywords: ['光合作用', '呼吸', '消化', '循环系统', '呼吸系统', '排泄', '生长', '运动', '感应', '营养'] },
  { weight: 1.5, keywords: ['岩石', '土壤', '矿物', '化石', '火山', '地震', '侵蚀', '风化'] },
];

const EN_BANK: KeywordBank = { math: EN_MATH, english: EN_ENGLISH, chinese_mt: [], science: EN_SCIENCE };
const ZH_BANK: KeywordBank = { math: ZH_MATH, english: [], chinese_mt: ZH_CHINESE, science: ZH_SCIENCE };

// ── Language detection ──────────────────────────────────────────────

const CJK_GLOBAL_RE = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3000-\u303F\uFF00-\uFFEF]/g;
const LATIN_RE = /[a-zA-Z]/g;

function detectLanguage(text: string): { lang: DetectedLanguage; cjkRatio: number } {
  const chars = text.replace(/\s/g, '');
  if (chars.length === 0) return { lang: 'en', cjkRatio: 0 };

  const cjkCount = (chars.match(CJK_GLOBAL_RE) ?? []).length;
  const cjkRatio = cjkCount / chars.length;
  const latinCount = (chars.match(LATIN_RE) ?? []).length;
  const latinRatio = latinCount / chars.length;

  if (cjkRatio > 0.8) return { lang: 'zh-Hans', cjkRatio };
  if (cjkRatio > 0.05 && latinRatio < 0.8) return { lang: 'mixed', cjkRatio };
  return { lang: 'en', cjkRatio };
}

// ── Keyword matching ────────────────────────────────────────────────

function buildWordBoundaryRe(kw: string): RegExp {
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i');
}

function matchKeywords(text: string, groups: KeywordGroup[], lowercase: boolean): number {
  const target = lowercase ? text.toLowerCase() : text;
  let score = 0;
  for (const group of groups) {
    for (const kw of group.keywords) {
      const hasCJK = /[\u4E00-\u9FFF]/.test(kw);
      const wordLike = /^[a-zA-Z]/.test(kw) && kw.length >= 3;
      if (wordLike && !hasCJK) {
        if (buildWordBoundaryRe(kw).test(target)) {
          score += group.weight;
        }
      } else {
        if (target.includes(kw)) {
          score += group.weight;
        }
      }
    }
  }
  return score;
}

// ── Math signal boost ───────────────────────────────────────────────

const DIGIT_RE = /[0-9]/g;
const MATH_SYMBOL_RE = /[+\-×÷=<>%√^/]/;
const EQUATION_PATTERN = /[0-9]+\s*[+\-×÷=/]\s*[0-9]+/;

function mathSymbolBonus(text: string): number {
  const digits = (text.match(DIGIT_RE) ?? []).length;
  const symbols = (text.match(MATH_SYMBOL_RE) ?? []).length;
  const hasEquation = EQUATION_PATTERN.test(text);
  const digitRatio = text.length > 0 ? digits / text.length : 0;

  let bonus = 0;
  if (digitRatio > 0.15) bonus += 3;
  else if (digitRatio > 0.05) bonus += 1.5;
  else if (digits >= 3) bonus += 1;

  if (symbols >= 3 || hasEquation) bonus += 2;
  else if (symbols >= 1) bonus += 0.5;

  return bonus;
}

// ── Chinese MT signal boost ─────────────────────────────────────────

function cjkMTBonus(cjkRatio: number, hasChineseMTMatch: boolean): number {
  if (!hasChineseMTMatch) return 0;
  if (cjkRatio > 0.9) return 2;
  if (cjkRatio > 0.7) return 1;
  return 0;
}

// ── Main classifier ─────────────────────────────────────────────────

const ALL_SUBJECTS: Subject[] = ['math', 'english', 'chinese_mt', 'science'];
const MIN_TOTAL_SCORE = 1.0;

export function classify(text: string): SubjectClassification {
  if (!text || text.trim().length === 0) {
    return {
      subject: 'unknown',
      confidence: 0,
      detectedLanguage: 'en',
      scores: { math: 0, english: 0, chinese_mt: 0, science: 0 },
    };
  }

  const { lang, cjkRatio } = detectLanguage(text);
  const useEN = lang === 'en' || lang === 'mixed';
  const useZH = lang === 'zh-Hans' || lang === 'mixed';

  const rawScores: Record<Subject, number> = { math: 0, english: 0, chinese_mt: 0, science: 0 };

  if (useEN) {
    for (const subj of ALL_SUBJECTS) {
      rawScores[subj] += matchKeywords(text, EN_BANK[subj], true);
    }
    rawScores.math += mathSymbolBonus(text);
  }

  if (useZH) {
    for (const subj of ALL_SUBJECTS) {
      rawScores[subj] += matchKeywords(text, ZH_BANK[subj], false);
    }
    const zhChineseMTSignal = matchKeywords(text, ZH_BANK.chinese_mt, false);
    rawScores.chinese_mt += cjkMTBonus(cjkRatio, zhChineseMTSignal > 0);
  }

  const totalScore = Object.values(rawScores).reduce((a, b) => a + b, 0);

  const scores = { ...rawScores } as Record<Subject, number>;
  if (totalScore > 0) {
    for (const subj of ALL_SUBJECTS) {
      scores[subj] = Math.round((rawScores[subj] / totalScore) * 100) / 100;
    }
  }

  const bestSubject = ALL_SUBJECTS.reduce((best, curr) =>
    rawScores[curr] > rawScores[best] ? curr : best,
  );
  const maxRaw = rawScores[bestSubject];
  const confidence = totalScore > 0 ? Math.round((maxRaw / totalScore) * 100) / 100 : 0;

  if (confidence < 0.5 || totalScore < MIN_TOTAL_SCORE) {
    return { subject: 'unknown', confidence, detectedLanguage: lang, scores };
  }

  return { subject: bestSubject, confidence, detectedLanguage: lang, scores };
}
