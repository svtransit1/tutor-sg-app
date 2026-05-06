/**
 * Topic-specific hint scaffolds for P1–P3 Math, aligned to MOE syllabus.
 * Each scaffold defines Level 1–4 hints tailored to a specific math topic.
 * All strings are bilingual: EN + zh-Hans.
 */

export interface TopicScaffold {
  id: string;
  grade: 'P1' | 'P2' | 'P3';
  topic: string;
  level1: { en: string; 'zh-Hans': string };
  level2: { en: string; 'zh-Hans': string };
  level3: { en: string; 'zh-Hans': string };
  level4_prefix: { en: string; 'zh-Hans': string };
}

export const TOPIC_SCAFFOLDS: TopicScaffold[] = [
  // ==================== P1 SCAFFOLDS ====================

  {
    id: 'p1-addition-within-10',
    grade: 'P1',
    topic: 'Addition within 10',
    level1: {
      en: 'Let\'s count together! How many objects do you see in the first group? And the second group?',
      'zh-Hans': '我们一起来数一数！第一组有几个物品？第二组呢？',
    },
    level2: {
      en: 'Start with the bigger number in your head, then count on. For example, if it\'s 3 + 5, think "5" then count "6, 7, 8". So 3 + 5 = ___?',
      'zh-Hans': '从较大的数开始，接着数下去。比如3 + 5，先想"5"，然后数"6、7、8"。所以3 + 5 = ___？',
    },
    level3: {
      en: 'Let\'s solve it step by step: 3 + 5 → start at 5, count 3 more: 6, 7, 8. Answer: ___. Now try the same way for your question!',
      'zh-Hans': '我们一步步来：3 + 5 → 从5开始，数3个：6、7、8。答案：___。现在用同样的方法做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for addition:',
      'zh-Hans': '这是加法的完整解答：',
    },
  },

  {
    id: 'p1-subtraction-within-10',
    grade: 'P1',
    topic: 'Subtraction within 10',
    level1: {
      en: 'Imagine you have the first number of items. If you take away the second number, how many are left?',
      'zh-Hans': '想象你有第一个数那么多的物品。如果拿走第二个数那么多，还剩几个？',
    },
    level2: {
      en: 'Start at the first number and count backwards. For example, 8 − 3: start at 8, count back 3: 7, 6, 5. So 8 − 3 = ___?',
      'zh-Hans': '从第一个数开始倒数。比如8 − 3：从8开始倒着数3个：7、6、5。所以8 − 3 = ___？',
    },
    level3: {
      en: 'Let\'s work it out: 8 − 3 → start at 8, count back: 7, 6, 5. Answer: 5. Now try your question the same way!',
      'zh-Hans': '我们来算一算：8 − 3 → 从8开始倒数：7、6、5。答案：5。现在用同样的方法做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for subtraction:',
      'zh-Hans': '这是减法的完整解答：',
    },
  },

  {
    id: 'p1-number-bonds',
    grade: 'P1',
    topic: 'Number Bonds (Part-Whole)',
    level1: {
      en: 'Think of the whole number as two parts put together. If the whole is 7 and one part is 3, what must the other part be?',
      'zh-Hans': '把总数想成两个部分合起来。如果总数是7，其中一部分是3，另一部分是多少？',
    },
    level2: {
      en: 'Use number bonds: Whole = Part + Part. So if the whole is 7 and one part is 3: 7 = 3 + ___. What number makes this true?',
      'zh-Hans': '用数的分合：总数 = 部分 + 部分。所以如果总数是7，一部分是3：7 = 3 + ___。什么数让等式成立？',
    },
    level3: {
      en: '7 = 3 + 4, so the missing part is 4. Think: what number added to 3 makes 7? Try this for your question!',
      'zh-Hans': '7 = 3 + 4，所以缺少的部分是4。想想：3加上什么数等于7？用这个方法做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution using number bonds:',
      'zh-Hans': '这是用数的分合的完整解答：',
    },
  },

  {
    id: 'p1-shapes-patterns',
    grade: 'P1',
    topic: 'Shapes and Patterns',
    level1: {
      en: 'Look at the pattern carefully. What shape comes next? Circle, square, circle, square... what repeats?',
      'zh-Hans': '仔细看规律。下一个是什么形状？圆形、正方形、圆形、正方形……什么在重复？',
    },
    level2: {
      en: 'Find the repeating unit. In "circle, square, circle, square", the pattern unit is [circle, square]. The next one after the last square would be ___?',
      'zh-Hans': '找出重复的单位。在"圆形、正方形、圆形、正方形"中，重复单位是[圆形, 正方形]。最后一个正方形后面应该是___？',
    },
    level3: {
      en: 'The pattern repeats every 2 shapes: [circle, square]. Position 1 = circle, 2 = square, 3 = circle, 4 = square, so position 5 = ___. Apply this to your question!',
      'zh-Hans': '规律每2个形状重复一次：[圆形, 正方形]。位置1 = 圆形, 2 = 正方形, 3 = 圆形, 4 = 正方形, 所以位置5 = ___。用这个方法做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for the pattern:',
      'zh-Hans': '这是规律的完整解答：',
    },
  },

  {
    id: 'p1-length-comparison',
    grade: 'P1',
    topic: 'Length and Comparison',
    level1: {
      en: 'Look at the two objects. Which one looks longer? You can compare them by lining them up side by side.',
      'zh-Hans': '看看这两个物品。哪个看起来更长？你可以把它们并排对齐来比较。',
    },
    level2: {
      en: 'To compare length, measure both using the same unit (like paper clips or blocks). Object A = ___ blocks, Object B = ___ blocks. Which number is bigger?',
      'zh-Hans': '要比较长度，用同样的单位（比如回形针或积木）来量。物品A = ___ 个积木, 物品B = ___ 个积木。哪个数更大？',
    },
    level3: {
      en: 'Object A = 5 blocks, Object B = 3 blocks. Since 5 > 3, Object A is longer. The difference is 5 − 3 = ___ blocks. Try the same for your question!',
      'zh-Hans': '物品A = 5个积木, 物品B = 3个积木。因为5 > 3，物品A更长。相差5 − 3 = ___ 个积木。用同样的方法做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for comparing length:',
      'zh-Hans': '这是比较长度的完整解答：',
    },
  },

  // ==================== P2 SCAFFOLDS ====================

  {
    id: 'p2-multiplication-concept',
    grade: 'P2',
    topic: 'Multiplication (Concept of ×)',
    level1: {
      en: 'Think of multiplication as "groups of." If the question says 3 × 4, that means 3 groups of 4 items. How many items altogether?',
      'zh-Hans': '把乘法想成"几组"。如果题目是3 × 4，意思就是3组，每组4个。一共多少个？',
    },
    level2: {
      en: 'Draw it! Make 3 groups and put 4 dots in each. Now count all the dots: ___ + ___ + ___ = ___?',
      'zh-Hans': '画出来！画3组，每组4个点。然后数一数所有的点：___ + ___ + ___ = ___？',
    },
    level3: {
      en: '3 × 4 = 4 + 4 + 4 = 12. So 3 groups of 4 = 12. For your question: ___ × ___ = ___ + ___ + ... = ___?',
      'zh-Hans': '3 × 4 = 4 + 4 + 4 = 12。所以3组4 = 12。你的题目：___ × ___ = ___ + ___ + ... = ___？',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for multiplication:',
      'zh-Hans': '这是乘法的完整解答：',
    },
  },

  {
    id: 'p2-division-concept',
    grade: 'P2',
    topic: 'Division (Concept of ÷)',
    level1: {
      en: 'Think of division as sharing equally. If you have 12 items and share them among 3 people, how many does each person get?',
      'zh-Hans': '把除法想成平均分配。如果你有12个物品，分给3个人，每人得几个？',
    },
    level2: {
      en: 'Draw 12 dots. Now make 3 circles and distribute the dots equally — one dot to each circle at a time. How many dots in each circle when you\'re done? ___',
      'zh-Hans': '画12个点。然后画3个圈，轮流往每个圈里放点——每次每个圈放一个。放完后每个圈里有几个点？___',
    },
    level3: {
      en: '12 ÷ 3: distribute 12 into 3 equal groups → 4 in each. So 12 ÷ 3 = 4. Try the same method for your question!',
      'zh-Hans': '12 ÷ 3：把12分成3个相等的组 → 每组4个。所以12 ÷ 3 = 4。用同样的方法做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for division:',
      'zh-Hans': '这是除法的完整解答：',
    },
  },

  {
    id: 'p2-addition-subtraction-within-100',
    grade: 'P2',
    topic: 'Addition and Subtraction within 100',
    level1: {
      en: 'Look at the ones digit first. Do you need to regroup (carry or borrow)? If the ones add up to 10 or more, you\'ll need to carry.',
      'zh-Hans': '先看个位。你需要进位或退位吗？如果个位加起来是10或以上，就需要进位。',
    },
    level2: {
      en: 'Write it in columns. Add/subtract the ones column first, then the tens column. For 37 + 25: ones = 7 + 5 = 12. Write 2, carry the 1. Tens = 3 + 2 + 1 = ___. Answer: ___?',
      'zh-Hans': '用竖式写。先算个位，再算十位。比如37 + 25：个位 = 7 + 5 = 12。写2，进1。十位 = 3 + 2 + 1 = ___。答案：___？',
    },
    level3: {
      en: '37 + 25: ones 7+5=12 (write 2, carry 1), tens 3+2+1=6 → 62. For your question, set it up the same way and work column by column!',
      'zh-Hans': '37 + 25：个位7+5=12（写2进1），十位3+2+1=6 → 62。你的题目也用同样方法，逐列计算！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution using column method:',
      'zh-Hans': '这是用竖式计算的完整解答：',
    },
  },

  {
    id: 'p2-fractions-intro',
    grade: 'P2',
    topic: 'Fractions (Introduction)',
    level1: {
      en: 'A fraction shows parts of a whole. If something is cut into 4 equal pieces and you take 1 piece, that\'s 1/4. How many equal parts does your question have?',
      'zh-Hans': '分数表示一个整体的几部分。如果一个东西被切成4等份，你拿走1份，就是1/4。你的题目有几个等份？',
    },
    level2: {
      en: 'Count the total equal parts → that\'s the denominator (bottom number). Count how many parts are shaded/selected → that\'s the numerator (top number). So the fraction is ___/___?',
      'zh-Hans': '数一数总共几个等份 → 这是分母（下面的数）。数一数有几个部分被涂上/选中 → 这是分子（上面的数）。所以分数是___/___？',
    },
    level3: {
      en: 'Total parts = 4 (denominator), shaded = 1 (numerator) → fraction = 1/4. For your question: total = ___, shaded = ___ → fraction = ___/___?',
      'zh-Hans': '总份数 = 4（分母），涂色 = 1（分子）→ 分数 = 1/4。你的题目：总份数 = ___，涂色 = ___ → 分数 = ___/___？',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for the fraction:',
      'zh-Hans': '这是分数的完整解答：',
    },
  },

  {
    id: 'p2-money-word-problems',
    grade: 'P2',
    topic: 'Money Word Problems',
    level1: {
      en: 'Read the question carefully. What money does the person have? What are they buying? What are you trying to find — the total cost or the change?',
      'zh-Hans': '仔细读题。这个人有什么钱？他们要买什么？你要找的是什么——总价还是找零？',
    },
    level2: {
      en: 'List all the prices first, then add them up for the total cost. If finding change: change = money given − total cost. So: ___ − ___ = ___?',
      'zh-Hans': '先把所有价格列出来，然后加起来算总价。如果算找零：找零 = 给出的钱 − 总价。所以：___ − ___ = ___？',
    },
    level3: {
      en: 'Item 1 = $3, Item 2 = $5 → total = $8. Money given = $10 → change = $10 − $8 = $2. Try the same steps for your question!',
      'zh-Hans': '物品1 = $3, 物品2 = $5 → 总价 = $8。给出的钱 = $10 → 找零 = $10 − $8 = $2。用同样的步骤做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for the money problem:',
      'zh-Hans': '这是金钱问题的完整解答：',
    },
  },

  // ==================== P3 SCAFFOLDS ====================

  {
    id: 'p3-multiplication-division',
    grade: 'P3',
    topic: 'Multiplication and Division (within 1000)',
    level1: {
      en: 'Is this a multiplication or division question? Look at what\'s given: if you know groups × items-per-group, multiply. If you know total items and need groups or items-per-group, divide.',
      'zh-Hans': '这是乘法还是除法题？看已知条件：如果知道组数 × 每组个数，用乘法。如果知道总数，需要求组数或每组个数，用除法。',
    },
    level2: {
      en: 'For multiplication: break it into parts. 23 × 4 = (20 × 4) + (3 × 4) = ___ + ___ = ___? For division: think "what number times the divisor gives the dividend?"',
      'zh-Hans': '乘法：拆开算。23 × 4 = (20 × 4) + (3 × 4) = ___ + ___ = ___？除法：想想"什么数乘以除数等于被除数？"',
    },
    level3: {
      en: '23 × 4: 20×4=80, 3×4=12, 80+12=92. For division 84÷4: 80÷4=20, 4÷4=1, 20+1=21. Try this splitting method for your question!',
      'zh-Hans': '23 × 4：20×4=80, 3×4=12, 80+12=92。除法84÷4：80÷4=20, 4÷4=1, 20+1=21。用这种拆分法做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution using the splitting method:',
      'zh-Hans': '这是用拆分法的完整解答：',
    },
  },

  {
    id: 'p3-fractions-equivalent',
    grade: 'P3',
    topic: 'Equivalent Fractions',
    level1: {
      en: 'Two fractions are equivalent if they represent the same amount. Try drawing both fractions — do they shade the same area?',
      'zh-Hans': '如果两个分数表示相同的量，它们就相等。试着画出来——涂色面积一样吗？',
    },
    level2: {
      en: 'To find an equivalent fraction, multiply or divide BOTH the numerator and denominator by the same number. For 2/4: divide top and bottom by 2 → 1/___?',
      'zh-Hans': '要找相等分数，分子和分母同时乘或除以同一个数。比如2/4：分子分母同除以2 → 1/___？',
    },
    level3: {
      en: '2/4 = (2÷2)/(4÷2) = 1/2. So 2/4 and 1/2 are equivalent. For your question, find what number to divide/multiply by, then apply to both parts!',
      'zh-Hans': '2/4 = (2÷2)/(4÷2) = 1/2。所以2/4和1/2相等。你的题目：找出要除或乘的数，然后分子分母都用到！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for equivalent fractions:',
      'zh-Hans': '这是相等分数的完整解答：',
    },
  },

  {
    id: 'p3-bar-model-word-problems',
    grade: 'P3',
    topic: 'Bar Model Word Problems',
    level1: {
      en: 'Draw a bar model! Represent the total as one long bar, then divide it into parts for what you know and what you need to find.',
      'zh-Hans': '画条形模型！把总数画成一个长条，然后分成已知的部分和需要求的部分。',
    },
    level2: {
      en: 'Identify the known parts and the unknown. For "A has 30, B has 20 more than A": draw A\'s bar = 30, B\'s bar = 30 + 20 = ___?',
      'zh-Hans': '找出已知和未知。比如"A有30，B比A多20"：画A的条 = 30，B的条 = 30 + 20 = ___？',
    },
    level3: {
      en: 'A = 30, B = 30+20 = 50, Total = 30+50 = 80. Draw the bars, label each part, add them up. Try this for your question!',
      'zh-Hans': 'A = 30, B = 30+20 = 50, 总数 = 30+50 = 80。画条形，标出每部分，加起来。用这个方法做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution using bar model:',
      'zh-Hans': '这是用条形模型的完整解答：',
    },
  },

  {
    id: 'p3-perimeter',
    grade: 'P3',
    topic: 'Perimeter',
    level1: {
      en: 'Perimeter is the distance around the outside of a shape. Add up all the side lengths. How many sides does your shape have?',
      'zh-Hans': '周长是图形外围一圈的长度。把所有边长加起来。你的图形有几条边？',
    },
    level2: {
      en: 'For a rectangle: Perimeter = 2 × (length + width). Identify the length and width from the question. Then: 2 × (___ + ___) = ___?',
      'zh-Hans': '长方形：周长 = 2 × (长 + 宽)。从题目中找出长和宽。然后：2 × (___ + ___) = ___？',
    },
    level3: {
      en: 'Length = 8 cm, Width = 5 cm → P = 2 × (8+5) = 2 × 13 = 26 cm. For your question: identify each side length and add them all up!',
      'zh-Hans': '长 = 8 cm, 宽 = 5 cm → P = 2 × (8+5) = 2 × 13 = 26 cm。你的题目：找出每条边长，全部加起来！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for perimeter:',
      'zh-Hans': '这是周长的完整解答：',
    },
  },

  {
    id: 'p3-time-duration',
    grade: 'P3',
    topic: 'Time and Duration',
    level1: {
      en: 'Think about a clock. What time does the activity start? What time does it end? The duration is how much time passes between them.',
      'zh-Hans': '想想钟表。活动几点开始？几点结束？持续时间就是两个时刻之间经过的时间。',
    },
    level2: {
      en: 'Count the hours first, then the minutes. For example: 2:15 to 4:45 → hours: 2 to 4 = 2 hours, minutes: 15 to 45 = 30 minutes. Total = 2 h 30 min.',
      'zh-Hans': '先数小时，再数分钟。比如：2:15到4:45 → 小时：2到4 = 2小时，分钟：15到45 = 30分钟。总共 = 2小时30分。',
    },
    level3: {
      en: 'Start 2:15, End 4:45 → hours: 4−2=2, minutes: 45−15=30 → 2 h 30 min. If minutes need borrowing: 3:10 to 5:05 → 1 h 55 min. Try your question!',
      'zh-Hans': '开始2:15, 结束4:45 → 小时：4−2=2, 分钟：45−15=30 → 2小时30分。分钟需要借位时：3:10到5:05 → 1小时55分。做你的题目！',
    },
    level4_prefix: {
      en: 'Here\'s the full solution for time duration:',
      'zh-Hans': '这是时间计算的完整解答：',
    },
  },
];

export function getScaffoldById(id: string): TopicScaffold | undefined {
  return TOPIC_SCAFFOLDS.find(s => s.id === id);
}

export function getScaffoldsByGrade(grade: 'P1' | 'P2' | 'P3'): TopicScaffold[] {
  return TOPIC_SCAFFOLDS.filter(s => s.grade === grade);
}

export function getScaffoldHint(
  scaffold: TopicScaffold,
  level: 1 | 2 | 3 | 4,
  lang: 'en' | 'zh-Hans',
): string {
  switch (level) {
    case 1:
      return scaffold.level1[lang];
    case 2:
      return scaffold.level2[lang];
    case 3:
      return scaffold.level3[lang];
    case 4:
      return scaffold.level4_prefix[lang];
  }
}
