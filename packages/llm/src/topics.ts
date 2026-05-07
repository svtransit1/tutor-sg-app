import type { Subject } from './routing';

export interface TopicEntry {
  id: string;
  subject: Subject;
  level: number;
  nameEn: string;
  nameZh: string;
  terms: string[];
}

export const TOPICS: TopicEntry[] = [
  // ─── MATH ────────────────────────────────────
  // P1
  { id: 'MAT-P1-001', subject: 'math', level: 1, nameEn: 'Numbers to 10', nameZh: '10以内的数', terms: ['count', 'read', 'write', 'numbers to 10', 'compare', 'order'] },
  { id: 'MAT-P1-002', subject: 'math', level: 1, nameEn: 'Addition and Subtraction within 10', nameZh: '10以内的加法和减法', terms: ['addition', 'subtraction', 'within 10', 'number sentences', 'word problems'] },
  { id: 'MAT-P1-003', subject: 'math', level: 1, nameEn: 'Numbers to 20', nameZh: '20以内的数', terms: ['count', 'read', 'write', 'numbers to 20', 'compare', 'order'] },
  { id: 'MAT-P1-004', subject: 'math', level: 1, nameEn: 'Addition and Subtraction within 20', nameZh: '20以内的加法和减法', terms: ['addition', 'subtraction', 'within 20', 'number sentences', 'word problems'] },
  { id: 'MAT-P1-005', subject: 'math', level: 1, nameEn: 'Shapes and Patterns', nameZh: '图形和模式', terms: ['shapes', '2D', 'pattern', 'rectangle', 'square', 'circle', 'triangle'] },
  { id: 'MAT-P1-006', subject: 'math', level: 1, nameEn: 'Length and Mass', nameZh: '长度和质量', terms: ['length', 'mass', 'compare', 'measure', 'non-standard units'] },
  { id: 'MAT-P1-007', subject: 'math', level: 1, nameEn: 'Time and Money', nameZh: '时间和货币', terms: ['time', 'money', 'coins', 'notes', 'hour', 'o\'clock'] },

  // P2
  { id: 'MAT-P2-001', subject: 'math', level: 2, nameEn: 'Numbers to 1000', nameZh: '1000以内的数', terms: ['count', 'read', 'write', 'numbers to 1000', 'place value', 'compare', 'order'] },
  { id: 'MAT-P2-002', subject: 'math', level: 2, nameEn: 'Addition and Subtraction within 1000', nameZh: '1000以内的加法和减法', terms: ['addition', 'subtraction', 'within 1000', 'regrouping', 'word problems'] },
  { id: 'MAT-P2-003', subject: 'math', level: 2, nameEn: 'Multiplication and Division', nameZh: '乘法和除法', terms: ['multiplication', 'division', 'times tables', 'multiply', 'divide'] },
  { id: 'MAT-P2-004', subject: 'math', level: 2, nameEn: 'Fractions', nameZh: '分数', terms: ['fraction', 'part of a whole', 'unit fractions', 'compare fractions'] },
  { id: 'MAT-P2-005', subject: 'math', level: 2, nameEn: 'Money', nameZh: '货币', terms: ['money', 'dollars', 'cents', 'money problems'] },
  { id: 'MAT-P2-006', subject: 'math', level: 2, nameEn: 'Time', nameZh: '时间', terms: ['time', '5-minute', 'minutes', 'hours', 'time problems'] },
  { id: 'MAT-P2-007', subject: 'math', level: 2, nameEn: 'Length, Mass and Volume', nameZh: '长度、质量和体积', terms: ['length', 'mass', 'volume', 'measure', 'standard units', 'compare'] },
  { id: 'MAT-P2-008', subject: 'math', level: 2, nameEn: 'Shapes and Graphs', nameZh: '图形和图表', terms: ['shapes', '2D', '3D', 'picture graphs', 'properties'] },

  // P3
  { id: 'MAT-P3-001', subject: 'math', level: 3, nameEn: 'Numbers to 10 000', nameZh: '10000以内的数', terms: ['numbers to 10000', 'round', 'count', 'read', 'write'] },
  { id: 'MAT-P3-002', subject: 'math', level: 3, nameEn: 'Addition and Subtraction within 10 000', nameZh: '10000以内的加法和减法', terms: ['addition', 'subtraction', '4 digits', 'multi-step', 'word problems'] },
  { id: 'MAT-P3-003', subject: 'math', level: 3, nameEn: 'Multiplication and Division', nameZh: '乘法和除法', terms: ['multiplication', 'division', 'multiply', 'divide', 'times tables', '3-digit'] },
  { id: 'MAT-P3-004', subject: 'math', level: 3, nameEn: 'Fractions', nameZh: '分数', terms: ['fractions', 'compare', 'order', 'like fractions', 'equivalent', 'add fractions', 'subtract fractions'] },
  { id: 'MAT-P3-005', subject: 'math', level: 3, nameEn: 'Money', nameZh: '货币', terms: ['money', 'multi-step', 'change', 'given amount'] },
  { id: 'MAT-P3-006', subject: 'math', level: 3, nameEn: 'Length, Mass and Volume', nameZh: '长度、质量和体积', terms: ['length', 'mass', 'volume', 'mixed units', 'word problems'] },
  { id: 'MAT-P3-007', subject: 'math', level: 3, nameEn: 'Perimeter and Area', nameZh: '周长和面积', terms: ['perimeter', 'area', 'rectilinear', 'counting squares', 'square units', 'square', 'rectangle'] },
  { id: 'MAT-P3-008', subject: 'math', level: 3, nameEn: 'Angles', nameZh: '角', terms: ['angle', 'right angle', 'less than', 'greater than'] },
  { id: 'MAT-P3-009', subject: 'math', level: 3, nameEn: 'Data and Graphs', nameZh: '数据和图表', terms: ['bar graph', 'data', 'tables', 'interpret', 'organise'] },
  { id: 'MAT-P3-010', subject: 'math', level: 3, nameEn: 'Time', nameZh: '时间', terms: ['time', 'minute', 'elapsed time'] },

  // P4
  { id: 'MAT-P4-001', subject: 'math', level: 4, nameEn: 'Numbers to 100 000', nameZh: '100000以内的数', terms: ['numbers to 100000', 'round', 'count'] },
  { id: 'MAT-P4-002', subject: 'math', level: 4, nameEn: 'Factors and Multiples', nameZh: '因数和倍数', terms: ['factor', 'multiple', 'prime number'] },
  { id: 'MAT-P4-003', subject: 'math', level: 4, nameEn: 'Four Operations', nameZh: '四则运算', terms: ['order of operations', 'multi-step', 'four operations'] },
  { id: 'MAT-P4-004', subject: 'math', level: 4, nameEn: 'Fractions and Decimals', nameZh: '分数和小数', terms: ['fractions', 'decimals', 'convert', 'unlike fractions', 'multiply fractions'] },
  { id: 'MAT-P4-005', subject: 'math', level: 4, nameEn: 'Decimals', nameZh: '小数', terms: ['decimals', 'order', 'add decimals', 'subtract decimals', 'multiply decimals'] },
  { id: 'MAT-P4-006', subject: 'math', level: 4, nameEn: 'Area and Perimeter', nameZh: '面积和周长', terms: ['area', 'perimeter', 'rectangle', 'square', 'word problems'] },
  { id: 'MAT-P4-007', subject: 'math', level: 4, nameEn: 'Symmetry and Lines', nameZh: '对称和线', terms: ['symmetry', 'line of symmetry', 'parallel', 'perpendicular'] },
  { id: 'MAT-P4-008', subject: 'math', level: 4, nameEn: 'Angles', nameZh: '角', terms: ['angle', 'degrees', 'estimate', 'measure', 'protractor'] },
  { id: 'MAT-P4-009', subject: 'math', level: 4, nameEn: 'Data, Tables and Graphs', nameZh: '数据、表格和图表', terms: ['bar graph', 'data', 'tables', 'interpret', 'construct'] },
  { id: 'MAT-P4-010', subject: 'math', level: 4, nameEn: 'Average', nameZh: '平均数', terms: ['average', 'data set', 'average problems'] },

  // P5
  { id: 'MAT-P5-001', subject: 'math', level: 5, nameEn: 'Whole Numbers', nameZh: '整数', terms: ['whole numbers', '10 million', 'compare', 'round'] },
  { id: 'MAT-P5-002', subject: 'math', level: 5, nameEn: 'Four Operations on Whole Numbers', nameZh: '整数的四则运算', terms: ['multiply', 'divide', '2-digit', 'brackets', 'number sentences'] },
  { id: 'MAT-P5-003', subject: 'math', level: 5, nameEn: 'Fractions', nameZh: '分数', terms: ['fractions', 'multiply fractions', 'divide fractions', 'multi-step'] },
  { id: 'MAT-P5-004', subject: 'math', level: 5, nameEn: 'Decimals', nameZh: '小数', terms: ['decimals', 'divide decimals', 'relate'] },
  { id: 'MAT-P5-005', subject: 'math', level: 5, nameEn: 'Percentage', nameZh: '百分比', terms: ['percentage', 'percent', 'express as percent', '%', 'discount'] },
  { id: 'MAT-P5-006', subject: 'math', level: 5, nameEn: 'Ratio', nameZh: '比', terms: ['ratio', 'simplify', 'ratio problems'] },
  { id: 'MAT-P5-007', subject: 'math', level: 5, nameEn: 'Rate', nameZh: '速率', terms: ['rate', 'per', 'rate problems'] },
  { id: 'MAT-P5-008', subject: 'math', level: 5, nameEn: 'Triangles and Quadrilaterals', nameZh: '三角形和四边形', terms: ['triangle', 'quadrilateral', 'angle sum', 'properties'] },
  { id: 'MAT-P5-009', subject: 'math', level: 5, nameEn: 'Area and Perimeter of Composite Shapes', nameZh: '组合图形的面积和周长', terms: ['area', 'perimeter', 'composite', 'rectilinear'] },
  { id: 'MAT-P5-010', subject: 'math', level: 5, nameEn: 'Volume of Cubes and Cuboids', nameZh: '正方体和长方体的体积', terms: ['volume', 'cube', 'cuboid', 'cm3', 'm3'] },
  { id: 'MAT-P5-011', subject: 'math', level: 5, nameEn: 'Data and Average', nameZh: '数据和平均数', terms: ['line graph', 'average', 'mode', 'median'] },
  { id: 'MAT-P5-012', subject: 'math', level: 5, nameEn: 'Introduction to Algebra', nameZh: '代数入门', terms: ['algebra', 'unknown', 'variable', 'linear equation'] },

  // P6
  { id: 'MAT-P6-001', subject: 'math', level: 6, nameEn: 'Numbers and Operations', nameZh: '数和运算', terms: ['mixed operations', 'fractions', 'decimals', 'percentages', 'complex word problems'] },
  { id: 'MAT-P6-002', subject: 'math', level: 6, nameEn: 'Ratio, Percentage and Rate', nameZh: '比、百分比和速率', terms: ['ratio', 'percentage', 'rate', 'multi-step', 'discount', 'GST'] },
  { id: 'MAT-P6-003', subject: 'math', level: 6, nameEn: 'Algebra', nameZh: '代数', terms: ['algebra', 'simplify', 'linear equation', 'substitute'] },
  { id: 'MAT-P6-004', subject: 'math', level: 6, nameEn: 'Geometry', nameZh: '几何', terms: ['nets', '3D solids', 'angle', 'straight line', 'point', 'triangle properties'] },
  { id: 'MAT-P6-005', subject: 'math', level: 6, nameEn: 'Area and Volume', nameZh: '面积和体积', terms: ['area', 'triangle', 'composite shapes', 'volume', 'cube', 'cuboid'] },
  { id: 'MAT-P6-006', subject: 'math', level: 6, nameEn: 'Speed', nameZh: '速度', terms: ['speed', 'distance', 'time', 'km/h', 'm/s'] },
  { id: 'MAT-P6-007', subject: 'math', level: 6, nameEn: 'Data Analysis', nameZh: '数据分析', terms: ['pie chart', 'tables', 'graphs', 'charts'] },
  { id: 'MAT-P6-008', subject: 'math', level: 6, nameEn: 'PSLE Problem Solving', nameZh: '小六会考解题', terms: ['heuristic', 'guess and check', 'before-after', 'working backwards', 'non-routine'] },

  // ─── ENGLISH ─────────────────────────────────
  // P1
  { id: 'ENG-P1-001', subject: 'english', level: 1, nameEn: 'Phonics and Word Recognition', nameZh: '语音和单词认读', terms: ['phonics', 'letter-sound', 'blend', 'sounds', 'read words'] },
  { id: 'ENG-P1-002', subject: 'english', level: 1, nameEn: 'Sight Words and Vocabulary', nameZh: '常见词和词汇', terms: ['sight words', 'context clues', 'new words'] },
  { id: 'ENG-P1-003', subject: 'english', level: 1, nameEn: 'Simple Sentences', nameZh: '简单句', terms: ['simple sentences', 'capitalisation', 'full stops', 'subject-verb agreement'] },
  { id: 'ENG-P1-004', subject: 'english', level: 1, nameEn: 'Listening and Speaking', nameZh: '听力和口语', terms: ['listening', 'speaking', 'oral instructions', 'speak clearly'] },
  { id: 'ENG-P1-005', subject: 'english', level: 1, nameEn: 'Picture Composition', nameZh: '看图写话', terms: ['picture composition', 'write sentences', 'sequencing', 'first next then'] },
  { id: 'ENG-P1-006', subject: 'english', level: 1, nameEn: 'Grammar Basics', nameZh: '语法基础', terms: ['singular', 'plural', 'nouns', 'prepositions', 'in on under'] },

  // P2
  { id: 'ENG-P2-001', subject: 'english', level: 2, nameEn: 'Reading Comprehension', nameZh: '阅读理解', terms: ['reading comprehension', 'short passages', 'main idea', 'literal questions'] },
  { id: 'ENG-P2-002', subject: 'english', level: 2, nameEn: 'Vocabulary Building', nameZh: '词汇积累', terms: ['vocabulary', 'context', 'synonym', 'antonym'] },
  { id: 'ENG-P2-003', subject: 'english', level: 2, nameEn: 'Sentence Construction', nameZh: '造句', terms: ['compound sentences', 'conjunctions', 'and but so', 'questions', 'negative'] },
  { id: 'ENG-P2-004', subject: 'english', level: 2, nameEn: 'Writing', nameZh: '写作', terms: ['paragraph', 'writing', 'adjectives', 'descriptive'] },
  { id: 'ENG-P2-005', subject: 'english', level: 2, nameEn: 'Grammar', nameZh: '语法', terms: ['past tense', 'present tense', 'future tense', 'articles', 'a an the'] },
  { id: 'ENG-P2-006', subject: 'english', level: 2, nameEn: 'Oral Communication', nameZh: '口语交流', terms: ['oral', 'conversation', 'describe pictures'] },

  // P3
  { id: 'ENG-P3-001', subject: 'english', level: 3, nameEn: 'Reading Comprehension (Passages)', nameZh: '阅读理解（短文）', terms: ['reading comprehension', 'passage', 'passages', 'literal', 'inferential', 'writer\'s purpose'] },
  { id: 'ENG-P3-002', subject: 'english', level: 3, nameEn: 'Vocabulary and Grammar', nameZh: '词汇和语法', terms: ['homophone', 'homonym', 'subject-verb agreement'] },
  { id: 'ENG-P3-003', subject: 'english', level: 3, nameEn: 'Cloze Passage', nameZh: '完形填空', terms: ['cloze passage', 'fill blanks', 'context', 'grammar clues'] },
  { id: 'ENG-P3-004', subject: 'english', level: 3, nameEn: 'Composition Writing', nameZh: '作文', terms: ['composition', 'narrative', 'introduction', 'beginning middle end', '80-100 words'] },
  { id: 'ENG-P3-005', subject: 'english', level: 3, nameEn: 'Grammar - Tenses', nameZh: '语法 - 时态', terms: ['present perfect', 'continuous tense'] },
  { id: 'ENG-P3-006', subject: 'english', level: 3, nameEn: 'Oral - Reading Aloud', nameZh: '口语 - 朗读', terms: ['reading aloud', 'pronunciation', 'intonation', 'pace'] },

  // P4
  { id: 'ENG-P4-001', subject: 'english', level: 4, nameEn: 'Reading Comprehension (Inferential)', nameZh: '阅读理解（推理）', terms: ['reading comprehension', 'inferential', 'evaluative', 'fact and opinion'] },
  { id: 'ENG-P4-002', subject: 'english', level: 4, nameEn: 'Vocabulary in Context', nameZh: '语境词汇', terms: ['vocabulary', 'unfamiliar words', 'context', 'phrasal verbs'] },
  { id: 'ENG-P4-003', subject: 'english', level: 4, nameEn: 'Grammar - Complex Structures', nameZh: '语法 - 复杂结构', terms: ['relative clause', 'direct speech', 'indirect speech', 'conditional'] },
  { id: 'ENG-P4-004', subject: 'english', level: 4, nameEn: 'Composition - Narrative', nameZh: '叙事作文', terms: ['composition', 'narrative', 'plot', 'dialogue', '100-150 words'] },
  { id: 'ENG-P4-005', subject: 'english', level: 4, nameEn: 'Summary Writing', nameZh: '摘要写作', terms: ['summary', 'key points', 'own words'] },
  { id: 'ENG-P4-006', subject: 'english', level: 4, nameEn: 'Oral - Conversation', nameZh: '口语 - 对话', terms: ['oral', 'conversation', 'opinion'] },

  // P5
  { id: 'ENG-P5-001', subject: 'english', level: 5, nameEn: 'Reading Comprehension (Advanced)', nameZh: '阅读理解（高级）', terms: ['tone', 'mood', 'writer\'s craft', 'predictions'] },
  { id: 'ENG-P5-002', subject: 'english', level: 5, nameEn: 'Vocabulary - Word Choice', nameZh: '词汇 - 选词', terms: ['word choice', 'idioms', 'figurative language'] },
  { id: 'ENG-P5-003', subject: 'english', level: 5, nameEn: 'Grammar - Advanced', nameZh: '语法 - 高级', terms: ['passive voice', 'conditional', 'reported speech'] },
  { id: 'ENG-P5-004', subject: 'english', level: 5, nameEn: 'Composition - Descriptive and Reflective', nameZh: '描写和反思作文', terms: ['composition', 'descriptive', 'sensory', 'reflection'] },
  { id: 'ENG-P5-005', subject: 'english', level: 5, nameEn: 'Summary and Synthesis', nameZh: '摘要和综合', terms: ['synthesis', 'multiple sources', 'summary'] },
  { id: 'ENG-P5-006', subject: 'english', level: 5, nameEn: 'PSLE Oral Preparation', nameZh: '小六会考口语备考', terms: ['oral', 'reading aloud', 'stimulus-based conversation'] },

  // P6
  { id: 'ENG-P6-001', subject: 'english', level: 6, nameEn: 'PSLE Reading Comprehension', nameZh: '小六会考阅读理解', terms: ['reading comprehension', 'open-ended', 'text evidence', 'writer\'s techniques'] },
  { id: 'ENG-P6-002', subject: 'english', level: 6, nameEn: 'PSLE Vocabulary', nameZh: '小六会考词汇', terms: ['vocabulary', 'PSLE vocabulary list', 'MCQ'] },
  { id: 'ENG-P6-003', subject: 'english', level: 6, nameEn: 'PSLE Grammar', nameZh: '小六会考语法', terms: ['grammar', 'edit passages', 'accuracy'] },
  { id: 'ENG-P6-004', subject: 'english', level: 6, nameEn: 'PSLE Composition', nameZh: '小六会考作文', terms: ['composition', 'narrative', 'plot', 'character development', '150-200 words'] },
  { id: 'ENG-P6-005', subject: 'english', level: 6, nameEn: 'PSLE Oral Examination', nameZh: '小六会考口试', terms: ['oral', 'reading aloud', 'stimulus-based conversation'] },
  { id: 'ENG-P6-006', subject: 'english', level: 6, nameEn: 'PSLE Listening Comprehension', nameZh: '小六会考听力理解', terms: ['listening comprehension', 'spoken texts', 'MCQ', 'attitudes'] },
  { id: 'ENG-P6-007', subject: 'english', level: 6, nameEn: 'PSLE Writing (Functional)', nameZh: '小六会考应用文写作', terms: ['functional writing', 'email', 'letter', 'speech', 'report'] },

  // ─── SCIENCE ─────────────────────────────────
  // P1
  { id: 'SCI-P1-001', subject: 'science', level: 1, nameEn: 'All About Me', nameZh: '认识我自己', terms: ['five senses', 'see hear smell taste touch'] },
  { id: 'SCI-P1-002', subject: 'science', level: 1, nameEn: 'Living and Non-Living Things', nameZh: '生物与非生物', terms: ['living', 'non-living', 'classify', 'basic needs'] },
  { id: 'SCI-P1-003', subject: 'science', level: 1, nameEn: 'Materials', nameZh: '材料', terms: ['materials', 'hard', 'soft', 'rough', 'smooth', 'sort'] },

  // P2
  { id: 'SCI-P2-001', subject: 'science', level: 2, nameEn: 'Growing Up', nameZh: '成长', terms: ['life cycle', 'plants', 'animals', 'growth'] },
  { id: 'SCI-P2-002', subject: 'science', level: 2, nameEn: 'Habitats', nameZh: '栖息地', terms: ['habitat', 'match', 'animals', 'plants'] },
  { id: 'SCI-P2-003', subject: 'science', level: 2, nameEn: 'Uses of Materials', nameZh: '材料的用途', terms: ['materials', 'properties', 'uses', 'transparent', 'translucent', 'opaque'] },

  // P3
  { id: 'SCI-P3-001', subject: 'science', level: 3, nameEn: 'Characteristics of Living Things', nameZh: '生物的特征', terms: ['living things', 'characteristics', 'classification key', 'group'] },
  { id: 'SCI-P3-002', subject: 'science', level: 3, nameEn: 'Animals and Plants', nameZh: '动物和植物', terms: ['animals', 'mammals', 'birds', 'fish', 'reptiles', 'insects', 'plants', 'parts of a plant'] },
  { id: 'SCI-P3-003', subject: 'science', level: 3, nameEn: 'Materials and Their Properties', nameZh: '材料及其特性', terms: ['materials', 'properties', 'flexibility', 'strength', 'absorbency', 'flexible', 'absorbent'] },
  { id: 'SCI-P3-004', subject: 'science', level: 3, nameEn: 'Magnets', nameZh: '磁铁', terms: ['magnet', 'magnetic', 'non-magnetic', 'poles', 'attract', 'repel'] },

  // P4
  { id: 'SCI-P4-001', subject: 'science', level: 4, nameEn: 'Heat and Temperature', nameZh: '热和温度', terms: ['heat', 'temperature', 'hotter', 'colder', 'heat flow'] },
  { id: 'SCI-P4-002', subject: 'science', level: 4, nameEn: 'Light and Shadows', nameZh: '光和影子', terms: ['light', 'straight lines', 'shadow'] },
  { id: 'SCI-P4-003', subject: 'science', level: 4, nameEn: 'Sound', nameZh: '声音', terms: ['sound', 'vibration', 'pitch', 'volume'] },
  { id: 'SCI-P4-004', subject: 'science', level: 4, nameEn: 'Digestive System', nameZh: '消化系统', terms: ['digestive system', 'organs', 'path of food'] },
  { id: 'SCI-P4-005', subject: 'science', level: 4, nameEn: 'Circulatory and Respiratory Systems', nameZh: '循环系统和呼吸系统', terms: ['circulatory', 'respiratory', 'heart', 'blood vessels', 'lungs', 'breathing'] },

  // P5
  { id: 'SCI-P5-001', subject: 'science', level: 5, nameEn: 'Cells', nameZh: '细胞', terms: ['cells', 'animal cell', 'plant cell', 'basic unit of life'] },
  { id: 'SCI-P5-002', subject: 'science', level: 5, nameEn: 'Reproduction in Plants', nameZh: '植物的繁殖', terms: ['flower', 'parts of a flower', 'pollination', 'seed dispersal'] },
  { id: 'SCI-P5-003', subject: 'science', level: 5, nameEn: 'Reproduction in Humans', nameZh: '人类的繁殖', terms: ['human reproduction', 'life cycle', 'birth to old age'] },
  { id: 'SCI-P5-004', subject: 'science', level: 5, nameEn: 'Matter', nameZh: '物质', terms: ['matter', 'states of matter', 'solid', 'liquid', 'gas'] },
  { id: 'SCI-P5-005', subject: 'science', level: 5, nameEn: 'Conductors and Insulators', nameZh: '导体和绝缘体', terms: ['conductor', 'insulator', 'heat', 'electricity'] },
  { id: 'SCI-P5-006', subject: 'science', level: 5, nameEn: 'Changes of State', nameZh: '状态变化', terms: ['melting', 'freezing', 'boiling', 'evaporation', 'mass conserved'] },

  // P6
  { id: 'SCI-P6-001', subject: 'science', level: 6, nameEn: 'Food Chains and Food Webs', nameZh: '食物链和食物网', terms: ['food chain', 'food web', 'producer', 'consumer', 'decomposer'] },
  { id: 'SCI-P6-002', subject: 'science', level: 6, nameEn: 'Adaptation to Environment', nameZh: '对环境的适应', terms: ['adaptation', 'structural', 'behavioural', 'habitat', 'survive'] },
  { id: 'SCI-P6-003', subject: 'science', level: 6, nameEn: 'Electric Circuits', nameZh: '电路', terms: ['circuit', 'electric', 'diagram', 'switch', 'series', 'parallel'] },
  { id: 'SCI-P6-004', subject: 'science', level: 6, nameEn: 'Water Cycle', nameZh: '水循环', terms: ['water cycle', 'evaporation', 'condensation', 'precipitation'] },
  { id: 'SCI-P6-005', subject: 'science', level: 6, nameEn: 'Forces', nameZh: '力', terms: ['force', 'friction', 'gravity', 'elastic spring', 'magnetic'] },
  { id: 'SCI-P6-006', subject: 'science', level: 6, nameEn: 'PSLE Science Application', nameZh: '小六会考科学应用', terms: ['fair test', 'variables', 'conclude', 'experimental data', 'apply concepts'] },
  { id: 'SCI-P6-007', subject: 'science', level: 6, nameEn: 'Photosynthesis', nameZh: '光合作用', terms: ['photosynthesis', 'chlorophyll', 'sunlight', 'carbon dioxide', 'oxygen', 'glucose'] },
  { id: 'SCI-P6-008', subject: 'science', level: 6, nameEn: 'Human Body Systems', nameZh: '人体系统', terms: ['body systems', 'nervous system', 'coordinate'] },

  // ─── CHINESE MT ──────────────────────────────
  // P1
  { id: 'CHI-P1-001', subject: 'chinese_mt', level: 1, nameEn: 'Hanyu Pinyin', nameZh: '汉语拼音', terms: ['拼音', '声母', '韵母', '声调', '拼读'] },
  { id: 'CHI-P1-002', subject: 'chinese_mt', level: 1, nameEn: 'Basic Stroke Order', nameZh: '基本笔画和笔顺', terms: ['笔画', '笔顺', '笔画顺序', '基本笔画'] },
  { id: 'CHI-P1-003', subject: 'chinese_mt', level: 1, nameEn: 'Characters and Words', nameZh: '汉字和词语', terms: ['汉字', '词语', '认字', '写字'] },
  { id: 'CHI-P1-004', subject: 'chinese_mt', level: 1, nameEn: 'Simple Sentences', nameZh: '简单句', terms: ['简单句', '标点符号', '是……的'] },
  { id: 'CHI-P1-005', subject: 'chinese_mt', level: 1, nameEn: 'Listening and Speaking', nameZh: '听说', terms: ['听力', '口语', '说话', '短篇'] },
  { id: 'CHI-P1-006', subject: 'chinese_mt', level: 1, nameEn: 'Picture Description', nameZh: '看图说话', terms: ['看图说话', '描述', '有……在……'] },

  // P2
  { id: 'CHI-P2-001', subject: 'chinese_mt', level: 2, nameEn: 'Character Building', nameZh: '识字', terms: ['识字', '部首', '偏旁', 'character', 'radical'] },
  { id: 'CHI-P2-002', subject: 'chinese_mt', level: 2, nameEn: 'Sentence Formation', nameZh: '造句', terms: ['造句', '把字句', '被字句'] },
  { id: 'CHI-P2-003', subject: 'chinese_mt', level: 2, nameEn: 'Reading Comprehension', nameZh: '阅读理解', terms: ['阅读理解', '短文', '主题'] },
  { id: 'CHI-P2-004', subject: 'chinese_mt', level: 2, nameEn: 'Writing', nameZh: '写话', terms: ['写话', '5-8句', '标点'] },
  { id: 'CHI-P2-005', subject: 'chinese_mt', level: 2, nameEn: 'Oral Communication', nameZh: '口语', terms: ['口语', '对话', '描述'] },

  // P3
  { id: 'CHI-P3-001', subject: 'chinese_mt', level: 3, nameEn: 'Vocabulary and Phrases', nameZh: '词汇和短语', terms: ['词汇', '短语', '成语', 'vocabulary', 'phrases', 'idiom'] },
  { id: 'CHI-P3-002', subject: 'chinese_mt', level: 3, nameEn: 'Reading Comprehension (Short Passages)', nameZh: '阅读理解（短文）', terms: ['阅读理解', '短文', '推理'] },
  { id: 'CHI-P3-003', subject: 'chinese_mt', level: 3, nameEn: 'Sentence Construction', nameZh: '造句', terms: ['造句', '不但……而且……', '虽然……但是……', '改写'] },
  { id: 'CHI-P3-004', subject: 'chinese_mt', level: 3, nameEn: 'Composition', nameZh: '作文', terms: ['作文', '看图写作', '看图作文', 'composition'] },
  { id: 'CHI-P3-005', subject: 'chinese_mt', level: 3, nameEn: 'Oral - Reading Aloud', nameZh: '口语 - 朗读', terms: ['朗读', '发音', '标点', '停顿'] },

  // P4
  { id: 'CHI-P4-001', subject: 'chinese_mt', level: 4, nameEn: 'Vocabulary in Context', nameZh: '语境词汇', terms: ['词汇', '语境', '同义词', '反义词'] },
  { id: 'CHI-P4-002', subject: 'chinese_mt', level: 4, nameEn: 'Reading Comprehension', nameZh: '阅读理解', terms: ['阅读理解', '推理', '作者意图'] },
  { id: 'CHI-P4-003', subject: 'chinese_mt', level: 4, nameEn: 'Cloze Passage (综合填空)', nameZh: '综合填空', terms: ['综合填空', '填空', '上下文', '语法'] },
  { id: 'CHI-P4-004', subject: 'chinese_mt', level: 4, nameEn: 'Composition - Narrative', nameZh: '叙事作文', terms: ['叙事作文', '100-150字', '开头', '结尾', '对话'] },
  { id: 'CHI-P4-005', subject: 'chinese_mt', level: 4, nameEn: 'Oral - Conversation', nameZh: '口语 - 会话', terms: ['口语', '会话', '意见', '理由'] },
  { id: 'CHI-P4-006', subject: 'chinese_mt', level: 4, nameEn: 'Grammar', nameZh: '语法', terms: ['语法', '量词', '了', '着', '过'] },

  // P5
  { id: 'CHI-P5-001', subject: 'chinese_mt', level: 5, nameEn: 'Advanced Vocabulary', nameZh: '高级词汇', terms: ['词汇', '成语', 'advanced vocabulary'] },
  { id: 'CHI-P5-002', subject: 'chinese_mt', level: 5, nameEn: 'Reading Comprehension (Advanced)', nameZh: '阅读理解（高级）', terms: ['阅读理解', '开放式', '作者技巧', '角色动机'] },
  { id: 'CHI-P5-003', subject: 'chinese_mt', level: 5, nameEn: 'Cloze Passage (Advanced)', nameZh: '综合填空（高级）', terms: ['综合填空', '近义词', '填空'] },
  { id: 'CHI-P5-004', subject: 'chinese_mt', level: 5, nameEn: 'Composition', nameZh: '作文', terms: ['作文', '修辞手法'] },
  { id: 'CHI-P5-005', subject: 'chinese_mt', level: 5, nameEn: 'Oral Examination Practice', nameZh: '口试备考', terms: ['口试', '朗读', '声调', '会话'] },
  { id: 'CHI-P5-006', subject: 'chinese_mt', level: 5, nameEn: 'Grammar and Sentence Manipulation', nameZh: '语法和句子操作', terms: ['语法', '把字句', '被字句', '改写'] },

  // P6
  { id: 'CHI-P6-001', subject: 'chinese_mt', level: 6, nameEn: 'PSLE Vocabulary', nameZh: '小六会考词汇', terms: ['会考', '词汇', 'PSLE', 'vocabulary'] },
  { id: 'CHI-P6-002', subject: 'chinese_mt', level: 6, nameEn: 'PSLE Reading Comprehension', nameZh: '小六会考阅读理解', terms: ['会考', '阅读理解', '开放式', '作者技巧'] },
  { id: 'CHI-P6-003', subject: 'chinese_mt', level: 6, nameEn: 'PSLE Cloze Passage', nameZh: '小六会考综合填空', terms: ['会考', '综合填空', '近义词', '近音词'] },
  { id: 'CHI-P6-004', subject: 'chinese_mt', level: 6, nameEn: 'PSLE Composition', nameZh: '小六会考作文', terms: ['会考', '作文', '三幅图', '命题作文', '看图作文'] },
  { id: 'CHI-P6-005', subject: 'chinese_mt', level: 6, nameEn: 'PSLE Oral Examination', nameZh: '小六会考口试', terms: ['会考', '口试', '朗读', '会话', '声调'] },
  { id: 'CHI-P6-006', subject: 'chinese_mt', level: 6, nameEn: 'PSLE Listening Comprehension', nameZh: '小六会考听力理解', terms: ['会考', '听力', '理解'] },
  { id: 'CHI-P6-007', subject: 'chinese_mt', level: 6, nameEn: 'PSLE 完成对话', nameZh: '小六会考完成对话', terms: ['会考', '完成对话'] },
];

export function getTopicsBySubject(subject: Subject): TopicEntry[] {
  return TOPICS.filter((t) => t.subject === subject);
}

export function getTopicsBySubjectAndLevel(subject: Subject, level: number): TopicEntry[] {
  return TOPICS.filter((t) => t.subject === subject && t.level === level);
}
