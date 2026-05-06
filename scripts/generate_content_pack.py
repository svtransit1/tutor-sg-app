#!/usr/bin/env python3
"""
Generate MOE-syllabus-aligned question bank for tutor-sg.
Produces 200+ original bilingual (EN + zh-Hans) questions across
Math, English, Science, and Chinese for P1-P6.

All questions are originally authored -- no verbatim reproduction
from textbooks or test papers. Learning outcomes are paraphrased
from MOE syllabus (Crown copyright permits reference/paraphrasing).
"""

import json
import os
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

# ---------------------------------------------------------------------------
# Question templates per subject + level + type
# Each entry: {question_type, stem_en, stem_zh, options?, answer_en, answer_zh, explanation_en, explanation_zh, hints, tags}
# ---------------------------------------------------------------------------

def _hints(step_en, step_zh, step=1):
    return [{"text_en": step_en, "text_zh": step_zh, "step": step}]

def _mc_options(en_list, zh_list, correct_idx=0):
    labels = ["A", "B", "C", "D"]
    opts = []
    for i, (e, z) in enumerate(zip(en_list, zh_list)):
        opts.append({"label": labels[i], "text_en": e, "text_zh": z})
    return opts


def generate_questions():
    questions = []
    qid_counter = 1

    def add_q(topic_id, level, subject, qtype, difficulty,
              stem_en, stem_zh,
              answer_en="", answer_zh="",
              explanation_en="", explanation_zh="",
              options=None, hints=None, tags=None, moed_code=None):
        nonlocal qid_counter
        q = {
            "question_id": f"Q-{subject.upper()[:3]}-P{level}-{qid_counter:04d}",
            "topic_id": topic_id,
            "level": level,
            "subject": subject,
            "question_type": qtype,
            "difficulty": difficulty,
            "stem_en": stem_en,
            "stem_zh": stem_zh,
        }
        if options:
            q["options"] = options
        if answer_en:
            q["answer_en"] = answer_en
        if answer_zh:
            q["answer_zh"] = answer_zh
        if explanation_en:
            q["explanation_en"] = explanation_en
        if explanation_zh:
            q["explanation_zh"] = explanation_zh
        if hints:
            q["hints"] = hints
        if tags:
            q["tags"] = tags
        if moed_code:
            q["moed_code"] = moed_code
        questions.append(q)
        qid_counter += 1

    # =================================================================
    # MATH QUESTIONS
    # =================================================================

    # --- P1 Math ---
    add_q("MAT-P1-001", 1, "math", "multiple_choice", "easy",
          "Which number comes after 7?", "7后面的数字是多少？",
          options=_mc_options(["8", "6", "9", "5"], ["8", "6", "9", "5"], 0),
          answer_en="8", answer_zh="8",
          explanation_en="When we count, the number after 7 is 8.",
          explanation_zh="数数时，7后面的数字是8。",
          hints=_hints("Count: 1, 2, 3, 4, 5, 6, 7... what comes next?", "数一数：1、2、3、4、5、6、7……接下来是什么？"),
          tags=["voice-first"], moed_code="M-P1-N-01")

    add_q("MAT-P1-002", 1, "math", "fill_in_blank", "easy",
          "3 + 4 = ___", "3 + 4 = ___",
          answer_en="7", answer_zh="7",
          explanation_en="3 plus 4 equals 7.",
          explanation_zh="3加4等于7。",
          hints=_hints("Count on from 3: 4, 5, 6, 7.", "从3开始数：4、5、6、7。"),
          tags=["voice-first"], moed_code="M-P1-AS-01")

    add_q("MAT-P1-003", 1, "math", "multiple_choice", "easy",
          "Which is bigger, 5 or 9?", "5和9，哪个更大？",
          options=_mc_options(["5", "9", "They are the same", "Cannot tell"], ["5", "9", "它们一样大", "无法判断"], 1),
          answer_en="9", answer_zh="9",
          explanation_en="9 is greater than 5.",
          explanation_zh="9比5大。",
          hints=_hints("Think: if you have 5 apples and your friend has 9, who has more?", "想一想：如果你有5个苹果，朋友有9个，谁的多？"),
          moed_code="M-P1-N-02")

    add_q("MAT-P1-004", 1, "math", "short_answer", "easy",
          "Mei Ling has 6 stickers. She gives 2 to her brother. How many stickers does she have left?", "美玲有6张贴纸，她给弟弟2张，还剩多少张？",
          answer_en="4", answer_zh="4",
          explanation_en="6 minus 2 equals 4. Mei Ling has 4 stickers left.",
          explanation_zh="6减2等于4。美玲还剩4张贴纸。",
          hints=_hints("Start with 6, take away 2. Count what is left.", "从6开始，拿走2个，数一数剩下多少。"),
          tags=["voice-first"], moed_code="M-P1-AS-02")

    add_q("MAT-P1-005", 1, "math", "multiple_choice", "easy",
          "Which shape has 3 sides?", "哪个图形有3条边？",
          options=_mc_options(["Triangle", "Square", "Circle", "Rectangle"], ["三角形", "正方形", "圆形", "长方形"], 0),
          answer_en="Triangle", answer_zh="三角形",
          explanation_en="A triangle has 3 sides.",
          explanation_zh="三角形有3条边。",
          tags=["voice-first"], moed_code="M-P1-S-01")

    add_q("MAT-P1-006", 1, "math", "short_answer", "medium",
          "What is the missing number? 2, 4, ___, 8, 10", "缺少的数字是多少？2、4、___、8、10",
          answer_en="6", answer_zh="6",
          explanation_en="The pattern increases by 2 each time: 2, 4, 6, 8, 10.",
          explanation_zh="这个模式每次增加2：2、4、6、8、10。",
          hints=_hints("Look at how much the numbers go up each time.", "看看每次数字增加了多少。"),
          moed_code="M-P1-P-01")

    add_q("MAT-P1-007", 1, "math", "multiple_choice", "easy",
          "Which coin is worth the most?", "哪个硬币最值钱？",
          options=_mc_options(["50 cents", "10 cents", "20 cents", "5 cents"], ["50分", "10分", "20分", "5分"], 0),
          answer_en="50 cents", answer_zh="50分",
          explanation_en="50 cents is the highest value.",
          explanation_zh="50分是最高的面值。",
          tags=["voice-first"], moed_code="M-P1-TM-02")

    # --- P2 Math ---
    add_q("MAT-P2-001", 2, "math", "fill_in_blank", "easy",
          "156 + 243 = ___", "156 + 243 = ___",
          answer_en="399", answer_zh="399",
          explanation_en="Add ones: 6+3=9. Add tens: 5+4=9. Add hundreds: 1+2=3. Answer: 399.",
          explanation_zh="个位相加：6+3=9。十位相加：5+4=9。百位相加：1+2=3。答案：399。",
          hints=_hints("Add column by column: ones first, then tens, then hundreds.", "一列一列地加：先个位，再十位，最后百位。"),
          moed_code="M-P2-AS-01")

    add_q("MAT-P2-002", 2, "math", "multiple_choice", "easy",
          "What is 5 × 3?", "5 × 3等于多少？",
          options=_mc_options(["15", "8", "12", "20"], ["15", "8", "12", "20"], 0),
          answer_en="15", answer_zh="15",
          explanation_en="5 times 3 means 5 groups of 3, which equals 15.",
          explanation_zh="5乘3表示5组3，等于15。",
          hints=_hints("Think of 5 groups of 3: 3+3+3+3+3.", "想一想5组3：3+3+3+3+3。"),
          moed_code="M-P2-MD-01")

    add_q("MAT-P2-003", 2, "math", "short_answer", "medium",
          "A pencil costs 80 cents. How much do 3 pencils cost? Give your answer in dollars and cents.", "一支铅笔80分，3支铅笔多少钱？用元和分回答。",
          answer_en="$2.40", answer_zh="2.40元",
          explanation_en="80 cents × 3 = 240 cents = $2.40.",
          explanation_zh="80分×3=240分=2.40元。",
          hints=_hints("First find the total in cents, then convert to dollars.", "先算出总共多少分，再转换成元。"),
          moed_code="M-P2-MO-01")

    add_q("MAT-P2-004", 2, "math", "multiple_choice", "easy",
          "Which fraction is the smallest?", "哪个分数最小？",
          options=_mc_options(["1/4", "1/2", "1/3", "1/5"], ["1/4", "1/2", "1/3", "1/5"], 3),
          answer_en="1/5", answer_zh="1/5",
          explanation_en="When numerators are the same, the larger denominator means the smaller fraction.",
          explanation_zh="分子相同时，分母越大，分数越小。",
          hints=_hints("Imagine cutting a cake. If you cut it into more pieces, each piece is smaller.", "想象切蛋糕。切的份数越多，每份越小。"),
          moed_code="M-P2-F-01")

    add_q("MAT-P2-005", 2, "math", "short_answer", "medium",
          "Ravi starts homework at 4:15 p.m. and finishes at 4:50 p.m. How many minutes did he spend?", "拉维下午4:15开始做作业，4:50完成。他花了多少分钟？",
          answer_en="35 minutes", answer_zh="35分钟",
          explanation_en="50 minus 15 equals 35 minutes.",
          explanation_zh="50减15等于35分钟。",
          hints=_hints("Subtract the start time from the finish time.", "用结束时间减去开始时间。"),
          moed_code="M-P2-T-01")

    add_q("MAT-P2-006", 2, "math", "multiple_choice", "easy",
          "How many sides does a cube have?", "正方体有多少个面？",
          options=_mc_options(["6", "4", "8", "12"], ["6", "4", "8", "12"], 0),
          answer_en="6", answer_zh="6",
          explanation_en="A cube is a 3D shape with 6 flat faces.",
          explanation_zh="正方体是一个有6个面的立体图形。",
          moed_code="M-P2-SG-01")

    add_q("MAT-P2-007", 2, "math", "short_answer", "medium",
          "A rope is 3 m long. Another rope is 150 cm long. What is the total length in cm?", "一根绳子长3米，另一根长150厘米。总长度是多少厘米？",
          answer_en="450 cm", answer_zh="450厘米",
          explanation_en="3 m = 300 cm. 300 + 150 = 450 cm.",
          explanation_zh="3米=300厘米。300+150=450厘米。",
          hints=_hints("First convert 3 m to cm. Remember: 1 m = 100 cm.", "先把3米换算成厘米。记住：1米=100厘米。"),
          moed_code="M-P2-LMV-01")

    add_q("MAT-P2-008", 2, "math", "fill_in_blank", "easy",
          "1000 - 367 = ___", "1000 - 367 = ___",
          answer_en="633", answer_zh="633",
          explanation_en="Subtract column by column with regrouping: 1000 - 367 = 633.",
          explanation_zh="借位逐列相减：1000-367=633。",
          hints=_hints("Start from the ones column. You will need to regroup.", "从个位开始减。需要借位。"),
          moed_code="M-P2-AS-02")

    # --- P3 Math ---
    add_q("MAT-P3-001", 3, "math", "multiple_choice", "easy",
          "Round 4,567 to the nearest hundred.", "把4,567四舍五入到最接近的百位。",
          options=_mc_options(["4,600", "4,500", "4,570", "5,000"], ["4,600", "4,500", "4,570", "5,000"], 0),
          answer_en="4,600", answer_zh="4,600",
          explanation_en="The tens digit is 6, which is 5 or more, so we round up to 4,600.",
          explanation_zh="十位是6，大于等于5，所以进位到4,600。",
          hints=_hints("Look at the tens digit. Is it 5 or more?", "看十位的数字，是5或更大吗？"),
          moed_code="M-P3-N-01")

    add_q("MAT-P3-002", 3, "math", "short_answer", "medium",
          "A box has 24 pencils. How many pencils are in 8 boxes?", "一盒有24支铅笔，8盒有多少支？",
          answer_en="192", answer_zh="192",
          explanation_en="24 × 8 = 192.",
          explanation_zh="24×8=192。",
          hints=_hints("Multiply 24 by 8. Break it into 20×8 + 4×8.", "用24乘8。拆成20×8+4×8。"),
          moed_code="M-P3-MD-01")

    add_q("MAT-P3-003", 3, "math", "multiple_choice", "medium",
          "Which fraction is equivalent to 2/4?", "哪个分数等于2/4？",
          options=_mc_options(["1/2", "3/4", "2/8", "4/6"], ["1/2", "3/4", "2/8", "4/6"], 0),
          answer_en="1/2", answer_zh="1/2",
          explanation_en="Divide both numerator and denominator by 2: 2÷2 / 4÷2 = 1/2.",
          explanation_zh="分子分母同除以2：2÷2 / 4÷2 = 1/2。",
          hints=_hints("Simplify by dividing top and bottom by the same number.", "用相同的数除分子和分母来化简。"),
          moed_code="M-P3-F-01")

    add_q("MAT-P3-004", 3, "math", "short_answer", "medium",
          "A rectangle is 8 cm long and 5 cm wide. What is its perimeter?", "一个长方形长8厘米，宽5厘米。它的周长是多少？",
          answer_en="26 cm", answer_zh="26厘米",
          explanation_en="Perimeter = 2 × (length + width) = 2 × (8 + 5) = 2 × 13 = 26 cm.",
          explanation_zh="周长=2×(长+宽)=2×(8+5)=2×13=26厘米。",
          hints=_hints("Add all four sides: 8 + 5 + 8 + 5.", "把四条边加起来：8+5+8+5。"),
          moed_code="M-P3-PA-01")

    add_q("MAT-P3-005", 3, "math", "multiple_choice", "easy",
          "An angle smaller than a right angle is called:", "小于直角的角叫做：",
          options=_mc_options(["Acute angle", "Obtuse angle", "Reflex angle", "Straight angle"], ["锐角", "钝角", "优角", "平角"], 0),
          answer_en="Acute angle", answer_zh="锐角",
          explanation_en="An acute angle is less than 90 degrees.",
          explanation_zh="锐角小于90度。",
          moed_code="M-P3-A-01")

    add_q("MAT-P3-006", 3, "math", "structured", "hard",
          "A bottle holds 750 ml of juice. Priya drinks 250 ml. How much juice is left? If she drinks another 150 ml, how much is left then?", "一瓶果汁有750毫升。普丽雅喝了250毫升。还剩多少？如果她又喝了150毫升，还剩多少？",
          answer_en="First: 500 ml. Then: 350 ml.", answer_zh="第一次：500毫升。第二次：350毫升。",
          explanation_en="750 - 250 = 500 ml. Then 500 - 150 = 350 ml.",
          explanation_zh="750-250=500毫升。然后500-150=350毫升。",
          hints=_hints("Step 1: Subtract 250 from 750. Step 2: Subtract 150 from the result.", "第一步：750减250。第二步：从结果中减150。", 1),
          tags=["multi-step"], moed_code="M-P3-LMV-01")

    add_q("MAT-P3-007", 3, "math", "fill_in_blank", "easy",
          "7 × 6 = ___", "7 × 6 = ___",
          answer_en="42", answer_zh="42",
          explanation_en="7 times 6 equals 42.",
          explanation_zh="7乘6等于42。",
          moed_code="M-P3-MD-02")

    add_q("MAT-P3-008", 3, "math", "multiple_choice", "medium",
          "Which bar shows the most students? Bar A: 15, Bar B: 22, Bar C: 18, Bar D: 20.", "哪个条形图表示的学生最多？A:15, B:22, C:18, D:20。",
          options=_mc_options(["Bar B", "Bar A", "Bar D", "Bar C"], ["B", "A", "D", "C"], 0),
          answer_en="Bar B", answer_zh="B",
          explanation_en="Bar B shows 22, which is the highest number.",
          explanation_zh="B条形图显示22，是最高的数字。",
          tags=["data-interpretation"], moed_code="M-P3-DG-01")

    # --- P4 Math ---
    add_q("MAT-P4-001", 4, "math", "short_answer", "medium",
          "Write 47,305 in words.", "用文字写出47,305。",
          answer_en="Forty-seven thousand, three hundred and five", answer_zh="四万七千三百零五",
          explanation_en="47 thousand + 3 hundred + 5 = forty-seven thousand, three hundred and five.",
          explanation_zh="4万7千+3百+5=四万七千三百零五。",
          moed_code="M-P4-N-01")

    add_q("MAT-P4-002", 4, "math", "multiple_choice", "medium",
          "Which number is a factor of 24?", "哪个数是24的因数？",
          options=_mc_options(["6", "5", "7", "9"], ["6", "5", "7", "9"], 0),
          answer_en="6", answer_zh="6",
          explanation_en="24 ÷ 6 = 4, so 6 is a factor of 24.",
          explanation_zh="24÷6=4，所以6是24的因数。",
          hints=_hints("Check: does 24 divide evenly by each number?", "检查：24能被哪个数整除？"),
          moed_code="M-P4-FM-01")

    add_q("MAT-P4-003", 4, "math", "structured", "hard",
          "Evaluate: 12 + 3 × (8 - 5)", "计算：12 + 3 × (8 - 5)",
          answer_en="21", answer_zh="21",
          explanation_en="First do the bracket: 8-5=3. Then multiply: 3×3=9. Then add: 12+9=21.",
          explanation_zh="先算括号：8-5=3。再乘：3×3=9。最后加：12+9=21。",
          hints=_hints("Remember the order of operations: brackets first, then multiply, then add.", "记住运算顺序：先括号，再乘，最后加。"),
          tags=["order-of-operations"], moed_code="M-P4-FO-01")

    add_q("MAT-P4-004", 4, "math", "fill_in_blank", "medium",
          "3/4 as a decimal = ___", "3/4写成小数=___",
          answer_en="0.75", answer_zh="0.75",
          explanation_en="3 ÷ 4 = 0.75.",
          explanation_zh="3÷4=0.75。",
          hints=_hints("Divide the numerator by the denominator.", "用分子除以分母。"),
          moed_code="M-P4-FD-01")

    add_q("MAT-P4-005", 4, "math", "short_answer", "medium",
          "A square has a side length of 9 cm. What is its area?", "一个正方形的边长是9厘米。它的面积是多少？",
          answer_en="81 cm²", answer_zh="81平方厘米",
          explanation_en="Area of a square = side × side = 9 × 9 = 81 cm².",
          explanation_zh="正方形面积=边×边=9×9=81平方厘米。",
          moed_code="M-P4-AP-01")

    add_q("MAT-P4-006", 4, "math", "multiple_choice", "easy",
          "Two lines that never meet are called:", "永远不相交的两条线叫做：",
          options=_mc_options(["Parallel lines", "Perpendicular lines", "Intersecting lines", "Curved lines"], ["平行线", "垂直线", "相交线", "曲线"], 0),
          answer_en="Parallel lines", answer_zh="平行线",
          explanation_en="Parallel lines run side by side and never cross.",
          explanation_zh="平行线并排运行，永不相交。",
          moed_code="M-P4-SL-01")

    add_q("MAT-P4-007", 4, "math", "short_answer", "medium",
          "The average of 10, 14, and 18 is:", "10、14和18的平均数是：",
          answer_en="14", answer_zh="14",
          explanation_en="(10 + 14 + 18) ÷ 3 = 42 ÷ 3 = 14.",
          explanation_zh="(10+14+18)÷3=42÷3=14。",
          hints=_hints("Add all numbers, then divide by how many there are.", "把所有数加起来，再除以个数。"),
          moed_code="M-P4-AV-01")

    # --- P5 Math ---
    add_q("MAT-P5-001", 5, "math", "structured", "hard",
          "Express 3/8 as a percentage.", "把3/8写成百分比。",
          answer_en="37.5%", answer_zh="37.5%",
          explanation_en="3 ÷ 8 = 0.375. Multiply by 100: 37.5%.",
          explanation_zh="3÷8=0.375。乘以100：37.5%。",
          hints=_hints("First convert the fraction to a decimal, then multiply by 100.", "先把分数转换成小数，再乘以100。"),
          tags=["psle-format"], moed_code="M-P5-P-01")

    add_q("MAT-P5-002", 5, "math", "short_answer", "medium",
          "The ratio of boys to girls in a class is 3:5. If there are 24 boys, how many girls are there?", "班上男女比例是3:5。如果有24个男生，有多少个女生？",
          answer_en="40", answer_zh="40",
          explanation_en="3 parts = 24, so 1 part = 8. Girls = 5 parts = 5 × 8 = 40.",
          explanation_zh="3份=24，所以1份=8。女生=5份=5×8=40。",
          hints=_hints("Find what 1 part represents, then multiply by 5.", "先求出1份是多少，再乘以5。"),
          tags=["psle-format"], moed_code="M-P5-R-01")

    add_q("MAT-P5-003", 5, "math", "multiple_choice", "hard",
          "A cuboid measures 5 cm × 3 cm × 4 cm. What is its volume?", "一个长方体长5厘米、宽3厘米、高4厘米。它的体积是多少？",
          options=_mc_options(["60 cm³", "12 cm³", "35 cm³", "45 cm³"], ["60立方厘米", "12立方厘米", "35立方厘米", "45立方厘米"], 0),
          answer_en="60 cm³", answer_zh="60立方厘米",
          explanation_en="Volume = length × width × height = 5 × 3 × 4 = 60 cm³.",
          explanation_zh="体积=长×宽×高=5×3×4=60立方厘米。",
          tags=["psle-format"], moed_code="M-P5-V-01")

    add_q("MAT-P5-004", 5, "math", "structured", "hard",
          "A shop sells a bag for $45 during a sale. The original price was $60. What is the percentage discount?", "一个包原价60元，促销价45元。折扣百分比是多少？",
          answer_en="25%", answer_zh="25%",
          explanation_en="Discount = $60 - $45 = $15. Percentage = (15/60) × 100 = 25%.",
          explanation_zh="折扣=60-45=15元。百分比=(15/60)×100=25%。",
          hints=_hints("Find the difference, then express it as a fraction of the original price.", "先算出差价，再表示成原价的分数。"),
          tags=["psle-format", "real-world"], moed_code="M-P5-P-02")

    add_q("MAT-P5-005", 5, "math", "short_answer", "medium",
          "Solve: 2x + 6 = 20. What is x?", "解方程：2x + 6 = 20。x等于多少？",
          answer_en="x = 7", answer_zh="x = 7",
          explanation_en="2x = 20 - 6 = 14. x = 14 ÷ 2 = 7.",
          explanation_zh="2x=20-6=14。x=14÷2=7。",
          hints=_hints("First subtract 6 from both sides, then divide by 2.", "先两边都减6，再除以2。"),
          tags=["psle-format"], moed_code="M-P5-A-01")

    add_q("MAT-P5-006", 5, "math", "multiple_choice", "medium",
          "If a car travels at 60 km/h, how far does it travel in 2.5 hours?", "一辆车以60公里/小时的速度行驶，2.5小时行驶多远？",
          options=_mc_options(["150 km", "120 km", "180 km", "90 km"], ["150公里", "120公里", "180公里", "90公里"], 0),
          answer_en="150 km", answer_zh="150公里",
          explanation_en="Distance = speed × time = 60 × 2.5 = 150 km.",
          explanation_zh="距离=速度×时间=60×2.5=150公里。",
          tags=["psle-format"], moed_code="M-P5-R-02")

    # --- P6 Math ---
    add_q("MAT-P6-001", 6, "math", "structured", "hard",
          "A shop offers 20% off all items. After the discount, a jacket costs $96. What was the original price?", "商店所有商品打8折。打折后一件夹克96元。原价是多少？",
          answer_en="$120", answer_zh="120元",
          explanation_en="80% of original = $96. Original = $96 ÷ 0.8 = $120.",
          explanation_zh="原价的80%=96元。原价=96÷0.8=120元。",
          hints=_hints("If the sale price is 80% of the original, divide by 0.8 to find the original.", "如果售价是原价的80%，除以0.8就能找到原价。"),
          tags=["psle-format", "working-backwards"], moed_code="M-P6-RP-01")

    add_q("MAT-P6-002", 6, "math", "structured", "hard",
          "The sum of three consecutive even numbers is 78. What is the largest number?", "三个连续偶数的和是78。最大的数是多少？",
          answer_en="28", answer_zh="28",
          explanation_en="Let the numbers be x, x+2, x+4. x + (x+2) + (x+4) = 78. 3x + 6 = 78. 3x = 72. x = 24. Largest = 24 + 4 = 28.",
          explanation_zh="设三个数为x, x+2, x+4。x+(x+2)+(x+4)=78。3x+6=78。3x=72。x=24。最大=24+4=28。",
          hints=_hints("Use algebra: let the smallest number be x.", "用代数：设最小的数为x。"),
          tags=["psle-format", "heuristic"], moed_code="M-P6-A-01")

    add_q("MAT-P6-003", 6, "math", "multiple_choice", "hard",
          "In a pie chart, if 40% of students chose Math, what angle represents Math?", "在饼图中，如果40%的学生选了数学，数学对应的角度是多少？",
          options=_mc_options(["144°", "40°", "120°", "160°"], ["144°", "40°", "120°", "160°"], 0),
          answer_en="144°", answer_zh="144°",
          explanation_en="40% of 360° = 0.4 × 360 = 144°.",
          explanation_zh="360°的40%=0.4×360=144°。",
          tags=["psle-format"], moed_code="M-P6-DA-01")

    add_q("MAT-P6-004", 6, "math", "structured", "hard",
          "Ali cycles from home to school at 12 km/h and takes 20 minutes. How far is the school from his home?", "阿里以12公里/小时的速度骑车到学校用了20分钟。学校离家多远？",
          answer_en="4 km", answer_zh="4公里",
          explanation_en="20 minutes = 1/3 hour. Distance = 12 × (1/3) = 4 km.",
          explanation_zh="20分钟=1/3小时。距离=12×(1/3)=4公里。",
          hints=_hints("Convert minutes to hours first.", "先把分钟换算成小时。"),
          tags=["psle-format", "real-world"], moed_code="M-P6-SP-01")

    add_q("MAT-P6-005", 6, "math", "short_answer", "medium",
          "A triangle has angles 50° and 70°. What is the third angle?", "一个三角形有两个角分别是50°和70°。第三个角是多少？",
          answer_en="60°", answer_zh="60°",
          explanation_en="Angles in a triangle add up to 180°. 180 - 50 - 70 = 60°.",
          explanation_zh="三角形内角和是180°。180-50-70=60°。",
          moed_code="M-P6-G-01")

    add_q("MAT-P6-006", 6, "math", "structured", "hard",
          "There are some chickens and goats on a farm. There are 20 heads and 56 legs in total. How many goats are there?", "农场有一些鸡和山羊。总共有20个头和56条腿。有多少只山羊？",
          answer_en="8 goats", answer_zh="8只山羊",
          explanation_en="Let c = chickens, g = goats. c + g = 20 and 2c + 4g = 56. From first: c = 20 - g. Substitute: 2(20-g) + 4g = 56. 40 - 2g + 4g = 56. 2g = 16. g = 8.",
          explanation_zh="设鸡=c，山羊=g。c+g=20且2c+4g=56。由第一个：c=20-g。代入：2(20-g)+4g=56。40-2g+4g=56。2g=16。g=8。",
          hints=_hints("Use the guess-and-check method or set up equations. Each chicken has 2 legs, each goat has 4.", "用猜一猜法或者列方程。每只鸡2条腿，每只山羊4条腿。"),
          tags=["psle-format", "heuristic", "guess-and-check"], moed_code="M-P6-PS-01")

    # --- More Math questions to reach 200+ target ---
    # P1
    add_q("MAT-P1-001", 1, "math", "fill_in_blank", "easy",
          "9 - 3 = ___", "9 - 3 = ___",
          answer_en="6", answer_zh="6",
          explanation_en="9 minus 3 equals 6.",
          explanation_zh="9减3等于6。",
          tags=["voice-first"], moed_code="M-P1-AS-03")

    add_q("MAT-P1-002", 1, "math", "multiple_choice", "easy",
          "Which number is between 11 and 13?", "哪个数字在11和13之间？",
          options=_mc_options(["12", "10", "14", "15"], ["12", "10", "14", "15"], 0),
          answer_en="12", answer_zh="12",
          explanation_en="12 comes after 11 and before 13.",
          explanation_zh="12在11之后，13之前。",
          tags=["voice-first"], moed_code="M-P1-N-03")

    # P2
    add_q("MAT-P2-003", 2, "math", "multiple_choice", "easy",
          "What is 18 divided by 2?", "18除以2等于多少？",
          options=_mc_options(["9", "6", "8", "12"], ["9", "6", "8", "12"], 0),
          answer_en="9", answer_zh="9",
          explanation_en="18 ÷ 2 = 9 because 2 × 9 = 18.",
          explanation_zh="18÷2=9，因为2×9=18。",
          moed_code="M-P2-MD-02")

    add_q("MAT-P2-006", 2, "math", "short_answer", "medium",
          "A bus arrives every 15 minutes. How many buses arrive in 1 hour?", "公交车每15分钟到一班。1小时内有多少班车？",
          answer_en="4", answer_zh="4",
          explanation_en="1 hour = 60 minutes. 60 ÷ 15 = 4 buses.",
          explanation_zh="1小时=60分钟。60÷15=4班车。",
          moed_code="M-P2-T-02")

    # P3
    add_q("MAT-P3-006", 3, "math", "multiple_choice", "medium",
          "Which is heavier: 2 kg or 1,500 g?", "哪个更重：2公斤还是1,500克？",
          options=_mc_options(["2 kg", "1,500 g", "They are the same", "Cannot compare"], ["2公斤", "1,500克", "一样重", "无法比较"], 0),
          answer_en="2 kg", answer_zh="2公斤",
          explanation_en="2 kg = 2,000 g which is more than 1,500 g.",
          explanation_zh="2公斤=2,000克，大于1,500克。",
          moed_code="M-P3-LMV-02")

    add_q("MAT-P3-003", 3, "math", "fill_in_blank", "easy",
          "81 ÷ 9 = ___", "81 ÷ 9 = ___",
          answer_en="9", answer_zh="9",
          explanation_en="9 × 9 = 81, so 81 ÷ 9 = 9.",
          explanation_zh="9×9=81，所以81÷9=9。",
          moed_code="M-P3-MD-03")

    # P4
    add_q("MAT-P4-002", 4, "math", "short_answer", "medium",
          "Find the LCM of 4 and 6.", "求4和6的最小公倍数。",
          answer_en="12", answer_zh="12",
          explanation_en="Multiples of 4: 4, 8, 12, 16... Multiples of 6: 6, 12, 18... LCM = 12.",
          explanation_zh="4的倍数：4、8、12、16……6的倍数：6、12、18……最小公倍数=12。",
          moed_code="M-P4-FM-02")

    add_q("MAT-P4-006", 4, "math", "multiple_choice", "hard",
          "A rectangle has area 48 cm² and width 6 cm. What is its length?", "一个长方形面积48平方厘米，宽6厘米。它的长是多少？",
          options=_mc_options(["8 cm", "6 cm", "12 cm", "4 cm"], ["8厘米", "6厘米", "12厘米", "4厘米"], 0),
          answer_en="8 cm", answer_zh="8厘米",
          explanation_en="Area = length × width. 48 = length × 6. Length = 48 ÷ 6 = 8 cm.",
          explanation_zh="面积=长×宽。48=长×6。长=48÷6=8厘米。",
          moed_code="M-P4-AP-02")

    # P5
    add_q("MAT-P5-004", 5, "math", "short_answer", "medium",
          "Convert 0.6 to a fraction in simplest form.", "把0.6化成最简分数。",
          answer_en="3/5", answer_zh="3/5",
          explanation_en="0.6 = 6/10 = 3/5 (divide numerator and denominator by 2).",
          explanation_zh="0.6=6/10=3/5（分子分母同除以2）。",
          moed_code="M-P5-D-01")

    add_q("MAT-P5-003", 5, "math", "multiple_choice", "hard",
          "A tank is 3/4 full. After using 10 litres, it is 1/2 full. What is the capacity of the tank?", "一个水箱有3/4满。用了10升后是1/2满。水箱的容量是多少？",
          options=_mc_options(["40 litres", "30 litres", "20 litres", "50 litres"], ["40升", "30升", "20升", "50升"], 0),
          answer_en="40 litres", answer_zh="40升",
          explanation_en="3/4 - 1/2 = 1/4. So 1/4 of the tank = 10 litres. Capacity = 10 × 4 = 40 litres.",
          explanation_zh="3/4-1/2=1/4。所以1/4箱=10升。容量=10×4=40升。",
          tags=["psle-format"], moed_code="M-P5-F-01")

    # P6
    add_q("MAT-P6-002", 6, "math", "short_answer", "hard",
          "A shirt is sold at a 15% discount. The sale price is $68. What was the original price?", "一件衬衫打85折。售价68元。原价是多少？",
          answer_en="$80", answer_zh="80元",
          explanation_en="85% of original = $68. Original = $68 ÷ 0.85 = $80.",
          explanation_zh="原价的85%=68元。原价=68÷0.85=80元。",
          tags=["psle-format"], moed_code="M-P6-RP-02")

    add_q("MAT-P6-004", 6, "math", "multiple_choice", "medium",
          "What is the sum of interior angles of a triangle?", "三角形内角和是多少？",
          options=_mc_options(["180°", "360°", "90°", "270°"], ["180°", "360°", "90°", "270°"], 0),
          answer_en="180°", answer_zh="180°",
          explanation_en="The sum of interior angles of any triangle is always 180°.",
          explanation_zh="任何三角形的内角和始终是180°。",
          moed_code="M-P6-G-02")

    add_q("MAT-P6-008", 6, "math", "structured", "hard",
          "Amy and Ben share $120 in the ratio 2:3. How much more does Ben get than Amy?", "艾米和本按2:3的比例分摊120元。本比艾米多拿多少？",
          answer_en="$24", answer_zh="24元",
          explanation_en="Total parts = 2 + 3 = 5. 1 part = $120 ÷ 5 = $24. Ben gets 3 parts = $72. Amy gets 2 parts = $48. Difference = $72 - $48 = $24.",
          explanation_zh="总份数=2+3=5。1份=120÷5=24元。本得3份=72元。艾米得2份=48元。差=72-48=24元。",
          hints=_hints("Find the value of 1 part first.", "先求出1份的价值。"),
          tags=["psle-format"], moed_code="M-P6-RP-03")

    add_q("MAT-P6-003", 6, "math", "fill_in_blank", "medium",
          "Simplify: 3a + 2b - a + 4b = ___", "化简：3a + 2b - a + 4b = ___",
          answer_en="2a + 6b", answer_zh="2a + 6b",
          explanation_en="Combine like terms: 3a - a = 2a and 2b + 4b = 6b.",
          explanation_zh="合并同类项：3a-a=2a，2b+4b=6b。",
          tags=["psle-format"], moed_code="M-P6-A-02")

    # =================================================================
    # ENGLISH QUESTIONS
    # =================================================================

    # --- P1 English ---
    add_q("ENG-P1-001", 1, "english", "multiple_choice", "easy",
          "Which word starts with the sound /b/?", "哪个单词以/b/音开头？",
          options=_mc_options(["ball", "cat", "dog", "egg"], ["ball（球）", "cat（猫）", "dog（狗）", "egg（蛋）"], 0),
          answer_en="ball", answer_zh="ball（球）",
          explanation_en="The word 'ball' starts with the /b/ sound.",
          explanation_zh="'ball'这个词以/b/音开头。",
          tags=["voice-first", "phonics"], moed_code="E-P1-PW-01")

    add_q("ENG-P1-002", 1, "english", "fill_in_blank", "easy",
          "The cat is ___ the table. (under / on / in)", "猫在桌子___。（下面/上面/里面）",
          answer_en="under", answer_zh="下面",
          explanation_en="The preposition 'under' shows position below something.",
          explanation_zh="介词'under'表示在某物下面。",
          tags=["voice-first"], moed_code="E-P1-GB-01")

    add_q("ENG-P1-003", 1, "english", "short_answer", "easy",
          "Write a sentence about your favourite toy.", "写一个关于你最喜欢的玩具的句子。",
          answer_en="(Open-ended — example: My favourite toy is a red car.)",
          answer_zh="（开放式——例如：我最喜欢的玩具是一辆红色的汽车。）",
          explanation_en="A good sentence has a capital letter at the start, a full stop at the end, and makes sense.",
          explanation_zh="一个好句子开头要大写字母，结尾有句号，意思要通顺。",
          tags=["voice-first", "creative"], moed_code="E-P1-SS-01")

    add_q("ENG-P1-004", 1, "english", "multiple_choice", "easy",
          "Which is the correct sentence?", "哪个句子是正确的？",
          options=_mc_options(
              ["She is happy.", "she is happy", "She is happy", "she Is Happy."],
              ["She is happy.", "she is happy", "She is happy", "she Is Happy."],
              0),
          answer_en="She is happy.", answer_zh="She is happy.",
          explanation_en="Sentences start with a capital letter and end with a full stop.",
          explanation_zh="句子开头要大写字母，结尾要有句号。",
          moed_code="E-P1-SS-02")

    add_q("ENG-P1-005", 1, "english", "short_answer", "easy",
          "Look at the picture: A boy is flying a kite in the park. Write one sentence.", "看图：一个男孩在公园放风筝。写一个句子。",
          answer_en="(Open-ended — example: The boy flies a kite in the park.)",
          answer_zh="（开放式——例如：男孩在公园放风筝。）",
          explanation_en="Describe what you see in a complete sentence.",
          explanation_zh="用完整的句子描述你看到的内容。",
          tags=["picture-description", "voice-first"], moed_code="E-P1-PC-01")

    add_q("ENG-P1-006", 1, "english", "multiple_choice", "easy",
          "Which word is a plural noun?", "哪个是复数名词？",
          options=_mc_options(["cats", "cat", "run", "big"], ["cats（猫，复数）", "cat（猫）", "run（跑）", "big（大）"], 0),
          answer_en="cats", answer_zh="cats（猫，复数）",
          explanation_en="'Cats' has an 's' at the end, showing there is more than one.",
          explanation_zh="'cats'结尾有's'，表示不止一只。",
          moed_code="E-P1-GB-02")

    add_q("ENG-P1-006", 1, "english", "fill_in_blank", "easy",
          "I ___ to school every day. (go / goes / going)", "我每天___去学校。（go/goes/going）",
          answer_en="go", answer_zh="go",
          explanation_en="'I' takes the base form of the verb: 'I go'.",
          explanation_zh="'I'后面用动词原形：'I go'。",
          moed_code="E-P1-GB-03")

    # --- P2 English ---
    add_q("ENG-P2-001", 2, "english", "comprehension", "medium",
          "Read: 'Tom has a pet dog named Max. Max is brown and fluffy. Every evening, Tom takes Max to the park. They play fetch with a red ball.' What is the dog's name?", "阅读：'汤姆有一只叫麦克斯的宠物狗。麦克斯是棕色的，毛茸茸的。每天晚上，汤姆带麦克斯去公园。他们用红色的球玩接球游戏。'狗叫什么名字？",
          answer_en="Max", answer_zh="Max（麦克斯）",
          explanation_en="The passage says 'a pet dog named Max'.",
          explanation_zh="文章说'一只叫麦克斯的宠物狗'。",
          tags=["reading-comprehension"], moed_code="E-P2-RC-01")

    add_q("ENG-P2-002", 2, "english", "multiple_choice", "easy",
          "What is the opposite of 'happy'?", "'happy'（高兴）的反义词是什么？",
          options=_mc_options(["sad", "tall", "fast", "hot"], ["sad（伤心）", "tall（高）", "fast（快）", "hot（热）"], 0),
          answer_en="sad", answer_zh="sad（伤心）",
          explanation_en="'Sad' means the opposite of 'happy'.",
          explanation_zh="'sad'是'happy'的反义词。",
          moed_code="E-P2-VB-01")

    add_q("ENG-P2-003", 2, "english", "short_answer", "medium",
          "Rewrite using 'and': 'Sara likes apples. Sara likes oranges.'", "用'and'重写：'萨拉喜欢苹果。萨拉喜欢橙子。'",
          answer_en="Sara likes apples and oranges.", answer_zh="萨拉喜欢苹果和橙子。",
          explanation_en="We can combine two sentences about the same person using 'and'.",
          explanation_zh="我们可以用'and'把关于同一个人的两个句子合并。",
          moed_code="E-P2-SC-01")

    add_q("ENG-P2-004", 2, "english", "fill_in_blank", "medium",
          "Yesterday, I ___ to the zoo with my family. (go / went / goes)", "昨天，我和家人___动物园。（go/went/goes）",
          answer_en="went", answer_zh="went",
          explanation_en="'Yesterday' tells us the action is in the past, so we use 'went' (past tense of 'go').",
          explanation_zh="'昨天'告诉我们动作发生在过去，所以用'went'（go的过去式）。",
          moed_code="E-P2-GT-01")

    add_q("ENG-P2-005", 2, "english", "short_answer", "medium",
          "Write 3 sentences about what you did last weekend.", "写3个句子说说你上个周末做了什么。",
          answer_en="(Open-ended — example: Last weekend, I visited my grandmother. We ate lunch together. Then I played games with my cousin.)",
          answer_zh="（开放式——例如：上个周末，我去看了奶奶。我们一起吃了午饭。然后我和表弟玩游戏。）",
          explanation_en="Use past tense verbs and sequence words like 'first', 'then', 'after that'.",
          explanation_zh="用过去式动词和顺序词，如'首先'、'然后'、'之后'。",
          tags=["writing", "creative"], moed_code="E-P2-W-01")

    add_q("ENG-P2-006", 2, "english", "multiple_choice", "easy",
          "Which sentence uses 'a' correctly?", "哪个句子正确使用了'a'？",
          options=_mc_options(
              ["I saw a elephant.", "I saw a dog.", "I saw a apple.", "I saw a umbrella."],
              ["I saw a elephant.", "I saw a dog.", "I saw a apple.", "I saw a umbrella."],
              1),
          answer_en="I saw a dog.", answer_zh="I saw a dog.",
          explanation_en="'A' is used before words starting with a consonant sound. 'Dog' starts with /d/.",
          explanation_zh="'a'用于以辅音音素开头的单词前。'dog'以/d/开头。",
          moed_code="E-P2-GT-02")

    # --- P3 English ---
    add_q("ENG-P3-001", 3, "english", "comprehension", "medium",
          "Read: 'The rain poured down all morning. Maya looked out the window and sighed. She had planned a picnic with her friends at East Coast Park. Now, the sky was grey and the wind was strong.' Why did Maya sigh?", "阅读：'雨下了整整一个上午。玛雅望着窗外叹了口气。她原本计划和朋友们在东海岸公园野餐。现在，天空灰蒙蒙的，风也很大。'玛雅为什么叹气？",
          answer_en="She sighed because the rain ruined her picnic plans.",
          answer_zh="她叹气是因为下雨破坏了她的野餐计划。",
          explanation_en="The passage shows Maya had plans that the weather disrupted. She sighed out of disappointment.",
          explanation_zh="文章显示玛雅有计划，但天气打乱了。她因为失望而叹气。",
          tags=["reading-comprehension", "inferential"], moed_code="E-P3-RC-01")

    add_q("ENG-P3-002", 3, "english", "cloze", "medium",
          "Fill in the blank: 'The teacher asked the students to ___ their books and turn to page 25.'", "填空：'老师让学生们___书本，翻到第25页。'",
          answer_en="open", answer_zh="打开",
          explanation_en="'Open' makes sense because you open a book before turning to a page.",
          explanation_zh="'打开'合理，因为翻到某一页前要先打开书。",
          tags=["cloze-passage"], moed_code="E-P3-CP-01")

    add_q("ENG-P3-003", 3, "english", "multiple_choice", "medium",
          "Which pair are homophones?", "哪一对是同音词？",
          options=_mc_options(
              ["flower / flour", "big / small", "run / ran", "happy / glad"],
              ["flower（花）/ flour（面粉）", "big（大）/ small（小）", "run（跑）/ ran（跑了）", "happy（高兴）/ glad（高兴）"],
              0),
          answer_en="flower / flour", answer_zh="flower（花）/ flour（面粉）",
          explanation_en="Homophones sound the same but have different meanings and spellings.",
          explanation_zh="同音词发音相同，但意思和拼写不同。",
          moed_code="E-P3-VG-01")

    add_q("ENG-P3-004", 3, "english", "composition", "hard",
          "Write a short story (80-100 words) about 'A Surprise in the Garden'.", "写一篇关于'花园里的惊喜'的短故事（80-100字）。",
          answer_en="(Open-ended — assessed on: clear beginning, middle, end; appropriate vocabulary; correct grammar and spelling)",
          answer_zh="（开放式——评估标准：开头、中间、结尾清晰；词汇恰当；语法和拼写正确）",
          explanation_en="A good narrative has a clear plot, interesting details, and correct language.",
          explanation_zh="好的叙事要有清晰的情节、有趣的细节和正确的语言。",
          tags=["composition", "narrative"], moed_code="E-P3-CW-01")

    add_q("ENG-P3-005", 3, "english", "fill_in_blank", "medium",
          "She has ___ living in Singapore since 2020. (live / lived / lives / living)", "她自2020年以来一直___在新加坡。（live/lived/lives/living）",
          answer_en="lived", answer_zh="lived",
          explanation_en="'Has' + past participle = present perfect tense. 'Lived' is the past participle of 'live'.",
          explanation_zh="'has'+过去分词=现在完成时。'lived'是'live'的过去分词。",
          moed_code="E-P3-GT-01")

    add_q("ENG-P3-006", 3, "english", "multiple_choice", "easy",
          "Which word means the same as 'enormous'?", "哪个词和'enormous'（巨大的）意思相同？",
          options=_mc_options(["huge", "tiny", "light", "soft"], ["huge（巨大的）", "tiny（微小的）", "light（轻的）", "soft（柔软的）"], 0),
          answer_en="huge", answer_zh="huge（巨大的）",
          explanation_en="'Enormous' and 'huge' both mean very large.",
          explanation_zh="'enormous'和'huge'都表示非常大。",
          moed_code="E-P3-VB-01")

    # --- P4 English ---
    add_q("ENG-P4-001", 4, "english", "comprehension", "hard",
          "Read: 'Mr Tan adjusted his glasses and stared at the letter. The words 'Congratulations!' seemed to dance on the page. Twenty years of teaching, and now this — Teacher of the Year. His hands trembled as he held it.' What does 'the words seemed to dance' suggest about Mr Tan's feelings?", "阅读：'谭老师推了推眼镜，盯着那封信。'恭喜！'这几个字仿佛在纸上跳舞。教书二十年，现在得到了这个——年度教师。他拿着信的手在颤抖。''字仿佛在跳舞'暗示谭老师什么心情？",
          answer_en="It suggests Mr Tan is overwhelmed with joy and excitement.",
          answer_zh="这暗示谭老师欣喜若狂，非常兴奋。",
          explanation_en="'Dancing words' is figurative language showing the reader is so happy the words seem to move with excitement.",
          explanation_zh="'跳舞的字'是比喻手法，表示读者太高兴了，字似乎都兴奋地动起来了。",
          tags=["reading-comprehension", "figurative-language", "inferential"], moed_code="E-P4-RC-01")

    add_q("ENG-P4-002", 4, "english", "multiple_choice", "medium",
          "Choose the correct relative clause: 'The boy ___ won the race is my brother.'", "选择正确的关系从句：'___赢得比赛的男孩是我弟弟。'",
          options=_mc_options(["who", "which", "whose", "whom"], ["who", "which", "whose", "whom"], 0),
          answer_en="who", answer_zh="who",
          explanation_en="'Who' is used for people. The boy is a person.",
          explanation_zh="'who'用于指人。男孩是人。",
          moed_code="E-P4-GC-01")

    add_q("ENG-P4-003", 4, "english", "fill_in_blank", "medium",
          "If it ___ tomorrow, we will stay indoors. (rain / rains / rained / raining)", "如果明天___，我们就待在室内。（下雨）",
          answer_en="rains", answer_zh="rains",
          explanation_en="This is a Type 1 conditional: if + present simple, will + base verb.",
          explanation_zh="这是第一类条件句：if+一般现在时，will+动词原形。",
          tags=["conditional"], moed_code="E-P4-GC-02")

    add_q("ENG-P4-004", 4, "english", "composition", "hard",
          "Write a narrative (100-150 words) about a time you helped someone. Include dialogue.", "写一篇关于你帮助别人的故事（100-150字）。要包含对话。",
          answer_en="(Open-ended — assessed on: plot development, use of dialogue, emotional expression, varied sentence structures)",
          answer_zh="（开放式——评估标准：情节发展、对话运用、情感表达、句式多样）",
          explanation_en="Include what happened, how you helped, how the person reacted, and what you learned.",
          explanation_zh="包括发生了什么、你如何帮助、对方的反应以及你学到了什么。",
          tags=["composition", "narrative", "dialogue"], moed_code="E-P4-CW-01")

    add_q("ENG-P4-005", 4, "english", "short_answer", "medium",
          "Summarise in 2 sentences: 'The school organised a recycling programme. Students collected plastic bottles, paper and cans from the canteen every day. The materials were sent to a recycling centre. Within a month, the school reduced its waste by 30 percent.'", "用2个句子总结：'学校组织了一个回收计划。学生每天从食堂收集塑料瓶、纸和易拉罐。这些材料被送到回收中心。一个月内，学校的垃圾减少了30%。'",
          answer_en="The school started a recycling programme where students collected recyclable items daily. This reduced waste by 30% in one month.",
          answer_zh="学校开展了回收计划，学生每天收集可回收物品。一个月内垃圾减少了30%。",
          explanation_en="A good summary captures the main points without details.",
          explanation_zh="好的总结要抓住要点，省略细节。",
          tags=["summary"], moed_code="E-P4-SW-01")

    # --- P5 English ---
    add_q("ENG-P5-001", 5, "english", "comprehension", "hard",
          "Read: 'The old lighthouse had stood on the rocky cliff for over a century. Its white paint was peeling, and the iron door groaned when the wind pushed against it. Yet every night, without fail, its beam cut through the darkness, guiding ships safely to shore.' What does the lighthouse symbolise?", "阅读：'这座古老的灯塔在岩石悬崖上矗立了一个多世纪。白漆剥落，铁门在风的吹动下嘎吱作响。但每天晚上，它的光束都毫不例外地划破黑暗，引导船只安全靠岸。'灯塔象征什么？",
          answer_en="The lighthouse symbolises reliability, steadfastness and hope in difficult times.",
          answer_zh="灯塔象征可靠、坚定和困难时期的希望。",
          explanation_en="Despite its worn appearance, the lighthouse continues its duty every night — showing perseverance and reliability.",
          explanation_zh="尽管外表破旧，灯塔每晚仍履行职责——表现出坚韧和可靠。",
          tags=["reading-comprehension", "symbolism", "inferential"], moed_code="E-P5-RC-01")

    add_q("ENG-P5-002", 5, "english", "multiple_choice", "hard",
          "Which sentence uses the passive voice correctly?", "哪个句子正确使用了被动语态？",
          options=_mc_options(
              ["The cake was baked by my mother.", "The cake baked by my mother.", "My mother was baked the cake.", "The cake is bake by my mother."],
              ["The cake was baked by my mother.", "The cake baked by my mother.", "My mother was baked the cake.", "The cake is bake by my mother."],
              0),
          answer_en="The cake was baked by my mother.", answer_zh="The cake was baked by my mother.",
          explanation_en="Passive voice: object + was/were + past participle + by + agent.",
          explanation_zh="被动语态：宾语+was/were+过去分词+by+施事者。",
          moed_code="E-P5-GA-01")

    add_q("ENG-P5-003", 5, "english", "fill_in_blank", "hard",
          "If I ___ more time, I would have finished the project. (have / had / has / having)", "如果我有更多时间，我本可以完成这个项目。",
          answer_en="had had", answer_zh="had had",
          explanation_en="Type 3 conditional: if + past perfect, would have + past participle.",
          explanation_zh="第三类条件句：if+过去完成时，would have+过去分词。",
          tags=["conditional", "psle-format"], moed_code="E-P5-GA-02")

    add_q("ENG-P5-004", 5, "english", "composition", "hard",
          "Write a descriptive composition (100-150 words) about 'A Stormy Night'. Use sensory details.", "写一篇描写性作文（100-150字），题目是'暴风雨之夜'。运用感官细节。",
          answer_en="(Open-ended — assessed on: sensory details (sight, sound, smell, touch), mood/tone, vocabulary choice, sentence variety)",
          answer_zh="（开放式——评估标准：感官细节、情绪/基调、词汇选择、句式多样）",
          explanation_en="Use all five senses: what you saw, heard, smelled, felt and tasted during the storm.",
          explanation_zh="运用五感：暴风雨中你看到、听到、闻到、感觉到和尝到的。",
          tags=["composition", "descriptive", "sensory"], moed_code="E-P5-CW-01")

    add_q("ENG-P5-005", 5, "english", "multiple_choice", "medium",
          "What does 'break the ice' mean?", "'break the ice'（破冰）是什么意思？",
          options=_mc_options(
              ["Start a conversation in a social situation", "Smash frozen water", "End a friendship", "Cook something quickly"],
              ["在社交场合开始交谈", "打破冰冻的水", "结束友谊", "快速烹饪"],
              0),
          answer_en="Start a conversation in a social situation", answer_zh="在社交场合开始交谈",
          explanation_en="'Break the ice' is an idiom meaning to relieve tension or start conversation in an awkward situation.",
          explanation_zh="'break the ice'是一个习语，意思是在尴尬的情况下缓解紧张气氛或开始交谈。",
          tags=["idioms", "figurative-language"], moed_code="E-P5-VW-01")

    add_q("ENG-P5-006", 5, "english", "short_answer", "medium",
          "Rewrite in reported speech: Sarah said, 'I am going to the library after school.'", "改写成间接引语：Sarah说：'放学后我要去图书馆。'",
          answer_en="Sarah said that she was going to the library after school.",
          answer_zh="Sarah说她放学后要去图书馆。",
          explanation_en="In reported speech, change 'I' to 'she', 'am' to 'was' (tense backshift).",
          explanation_zh="在间接引语中，把'I'改为'she'，'am'改为'was'（时态后移）。",
          tags=["reported-speech"], moed_code="E-P5-GA-03")

    # --- P6 English ---
    add_q("ENG-P6-001", 6, "english", "comprehension", "hard",
          "Read: 'The photograph was faded, its edges curling like autumn leaves. In it, a young woman stood on the steps of a shophouse, her hand resting on the shoulder of a little boy. The boy wore a uniform too big for him, and his smile was uncertain. It was the only picture Mei Ling had of her mother as a child.' What can you infer about the relationship between Mei Ling and the people in the photograph?", "阅读：'照片已经褪色，边缘像秋叶一样卷曲。照片中，一个年轻女人站在店屋的台阶上，手放在一个小男孩的肩膀上。男孩穿着太大的校服，笑容有些不确定。这是美玲拥有的她母亲童年时唯一的照片。'你能推断出美玲和照片中人物的关系吗？",
          answer_en="The young woman is Mei Ling's mother as a child, and the boy is likely her mother's brother (Mei Ling's uncle). Mei Ling never knew her mother as a child, suggesting her mother may have passed away or been separated from the family.",
          answer_zh="年轻女人是童年时期的美玲妈妈，男孩可能是她妈妈的弟弟（美玲的舅舅）。美玲从未见过妈妈小时候的样子，说明妈妈可能已经去世或与家人分离。",
          explanation_en="The passage says 'the only picture Mei Ling had of her mother as a child', implying she never knew that time of her mother's life.",
          explanation_zh="文章说'这是美玲拥有的她母亲童年时唯一的照片'，暗示她从不了解妈妈的那段时光。",
          tags=["reading-comprehension", "inferential", "psle-format"], moed_code="E-P6-RC-01")

    add_q("ENG-P6-002", 6, "english", "multiple_choice", "hard",
          "'Despite the torrential rain, the determined runner ___ forward, her eyes fixed on the finish line.' Which word best fits?", "'尽管下着倾盆大雨，坚定的跑步者___前进，眼睛盯着终点线。'哪个词最合适？",
          options=_mc_options(["pressed", "stopped", "glanced", "wandered"], ["pressed（奋力前进）", "stopped（停止）", "glanced（瞥一眼）", "wandered（漫步）"], 0),
          answer_en="pressed", answer_zh="pressed（奋力前进）",
          explanation_en="'Pressed forward' means continued moving with determination, which fits the context of a determined runner.",
          explanation_zh="'pressed forward'表示坚定地继续前进，符合坚定跑步者的语境。",
          tags=["vocabulary-in-context", "psle-format"], moed_code="E-P6-VC-01")

    add_q("ENG-P6-003", 6, "english", "composition", "hard",
          "Write a narrative (150-200 words) based on this prompt: 'The door creaked open slowly. Inside, the room was not what she expected.' Develop the plot, characters and include a resolution.", "根据这个提示写一个故事（150-200字）：'门嘎吱一声慢慢打开了。里面，房间和她想象的不一样。'发展情节、人物，并包含结局。",
          answer_en="(Open-ended — assessed on: plot development, characterisation, resolution, varied sentence structures, rich vocabulary, appropriate tone)",
          answer_zh="（开放式——评估标准：情节发展、人物塑造、结局、句式多样、词汇丰富、基调恰当）",
          explanation_en="Build suspense from the unexpected room, develop a clear plot with conflict and resolution.",
          explanation_zh="从意想不到的房间制造悬念，发展有冲突和结局的清晰情节。",
          tags=["composition", "narrative", "psle-format"], moed_code="E-P6-CW-01")

    add_q("ENG-P6-004", 6, "english", "short_answer", "hard",
          "Write a formal email to your principal requesting a recycling programme for the school. Use appropriate format.", "写一封正式邮件给校长，请求为学校开展回收计划。使用适当格式。",
          answer_en="(Open-ended — assessed on: formal register, clear structure (greeting, purpose, request, sign-off), persuasive arguments, correct format)",
          answer_zh="（开放式——评估标准：正式语气、清晰结构、有说服力的论点、正确格式）",
          explanation_en="A formal email should include: Dear [Title/Name], clear purpose, polite request, formal closing.",
          explanation_zh="正式邮件应包括：尊敬的[称呼]、明确目的、礼貌请求、正式结尾。",
          tags=["functional-writing", "email", "psle-format"], moed_code="E-P6-WF-01")

    add_q("ENG-P6-005", 6, "english", "multiple_choice", "hard",
          "Which sentence has the correct subject-verb agreement?", "哪个句子的主谓一致是正确的？",
          options=_mc_options(
              ["Neither the teacher nor the students were aware.", "Neither the teacher nor the students was aware.", "Neither the teacher nor the students is aware.", "Neither the teacher nor the students being aware."],
              ["Neither the teacher nor the students were aware.", "Neither the teacher nor the students was aware.", "Neither the teacher nor the students is aware.", "Neither the teacher nor the students being aware."],
              0),
          answer_en="Neither the teacher nor the students were aware.",
          answer_zh="Neither the teacher nor the students were aware.",
          explanation_en="With 'neither...nor', the verb agrees with the subject closest to it. 'Students' is plural, so 'were'.",
          explanation_zh="'neither...nor'结构中，动词与最近的主语一致。'students'是复数，所以用'were'。",
          tags=["psle-format", "grammar"], moed_code="E-P6-GA-01")

    add_q("ENG-P6-006", 6, "english", "fill_in_blank", "hard",
          "The scientist, ___ research was published in Nature, received an award. (who / whom / whose / which)", "这位科学家___研究发表在《自然》杂志上，获得了一个奖项。",
          answer_en="whose", answer_zh="whose",
          explanation_en="'Whose' shows possession. The research belongs to the scientist.",
          explanation_zh="'whose'表示所有格。研究属于这位科学家。",
          tags=["psle-format", "grammar"], moed_code="E-P6-GA-02")

    # --- More English questions ---
    # P1
    add_q("ENG-P1-006", 1, "english", "multiple_choice", "easy",
          "Which word rhymes with 'cat'?", "哪个单词和'cat'押韵？",
          options=_mc_options(["hat", "dog", "cup", "pen"], ["hat（帽子）", "dog（狗）", "cup（杯子）", "pen（笔）"], 0),
          answer_en="hat", answer_zh="hat（帽子）",
          explanation_en="'hat' and 'cat' both end with the '-at' sound.",
          explanation_zh="'hat'和'cat'都以'-at'音结尾。",
          tags=["voice-first", "phonics"], moed_code="E-P1-PW-02")

    add_q("ENG-P1-006", 1, "english", "fill_in_blank", "easy",
          "The bird can ___. (fly / flies / flying)", "鸟会___。（fly/flies/flying）",
          answer_en="fly", answer_zh="fly",
          explanation_en="'Can' is followed by the base form of the verb.",
          explanation_zh="'can'后面用动词原形。",
          tags=["voice-first"], moed_code="E-P1-GB-04")

    # P2
    add_q("ENG-P2-006", 2, "english", "multiple_choice", "easy",
          "Which word means 'not hard'?", "哪个词的意思是'不难'？",
          options=_mc_options(["easy", "fast", "slow", "heavy"], ["easy（容易的）", "fast（快的）", "slow（慢的）", "heavy（重的）"], 0),
          answer_en="easy", answer_zh="easy（容易的）",
          explanation_en="'Easy' is the opposite of 'hard'.",
          explanation_zh="'easy'是'hard'的反义词。",
          moed_code="E-P2-VB-02")

    add_q("ENG-P2-006", 2, "english", "short_answer", "medium",
          "Rewrite as a question: 'The cat is sleeping.'", "改写成疑问句：'The cat is sleeping.'",
          answer_en="Is the cat sleeping?", answer_zh="猫在睡觉吗？",
          explanation_en="To make a question, move 'is' to the front and add a question mark.",
          explanation_zh="变成疑问句时，把'is'移到前面，加问号。",
          moed_code="E-P2-SC-02")

    # P3
    add_q("ENG-P3-006", 3, "english", "multiple_choice", "medium",
          "'She sings ___ than her sister.' Which word fits?", "'她唱得比她姐姐___。'哪个词合适？",
          options=_mc_options(["better", "good", "best", "well"], ["better（更好）", "good（好）", "best（最好）", "well（好）"], 0),
          answer_en="better", answer_zh="better（更好）",
          explanation_en="When comparing two people, use the comparative form: 'better'.",
          explanation_zh="比较两个人时，用比较级：'better'。",
          moed_code="E-P3-GT-02")

    add_q("ENG-P3-006", 3, "english", "fill_in_blank", "medium",
          "The children ___ playing in the park. (is / are / am / be)", "孩子们___在公园里玩。（is/are/am/be）",
          answer_en="are", answer_zh="are",
          explanation_en="'Children' is plural, so it takes 'are'.",
          explanation_zh="'children'是复数，所以用'are'。",
          moed_code="E-P3-GT-03")

    # P4
    add_q("ENG-P4-006", 4, "english", "multiple_choice", "medium",
          "Which sentence uses a simile?", "哪个句子使用了明喻？",
          options=_mc_options(
              ["He is as brave as a lion.", "He is very brave.", "He runs quickly.", "He is the bravest boy."],
              ["He is as brave as a lion.", "He is very brave.", "He runs quickly.", "He is the bravest boy."],
              0),
          answer_en="He is as brave as a lion.", answer_zh="He is as brave as a lion.",
          explanation_en="A simile uses 'like' or 'as' to compare two things.",
          explanation_zh="明喻使用'like'或'as'来比较两个事物。",
          tags=["figurative-language"], moed_code="E-P4-RC-02")

    add_q("ENG-P4-006", 4, "english", "short_answer", "hard",
          "Rewrite using 'unless': 'If you do not study, you will fail.'", "用'unless'重写：'If you do not study, you will fail.'",
          answer_en="Unless you study, you will fail.", answer_zh="除非你学习，否则你会失败。",
          explanation_en="'Unless' means 'if not'. So 'unless you study' = 'if you do not study'.",
          explanation_zh="'unless'意思是'如果不'。所以'unless you study'='if you do not study'。",
          tags=["conditional"], moed_code="E-P4-GC-03")

    # P5
    add_q("ENG-P5-006", 5, "english", "multiple_choice", "hard",
          "What is the tone of this sentence: 'After years of struggle, the nation finally achieved independence.'", "'经过多年的奋斗，这个国家终于实现了独立。'这句话的基调是什么？",
          options=_mc_options(["Triumphant", "Humorous", "Sarcastic", "Fearful"], ["胜利的", "幽默的", "讽刺的", "恐惧的"], 0),
          answer_en="Triumphant", answer_zh="胜利的",
          explanation_en="'Finally achieved independence' conveys a sense of triumph and victory.",
          explanation_zh="'终于实现了独立'传达了胜利和成功的感觉。",
          tags=["tone-analysis"], moed_code="E-P5-RC-02")

    add_q("ENG-P5-006", 5, "english", "fill_in_blank", "hard",
          "The book ___ I borrowed from the library is very interesting. (who / which / whose / whom)", "我从图书馆借的那本书很有趣。",
          answer_en="which", answer_zh="which",
          explanation_en="'Which' is used for things. The book is a thing.",
          explanation_zh="'which'用于指物。书是物。",
          moed_code="E-P5-GA-04")

    # P6
    add_q("ENG-P6-007", 6, "english", "short_answer", "hard",
          "Identify the literary device: 'The wind whispered through the trees.'", "识别修辞手法：'The wind whispered through the trees.'",
          answer_en="Personification", answer_zh="拟人",
          explanation_en="Personification gives human qualities (whispering) to non-human things (the wind).",
          explanation_zh="拟人赋予非人类事物（风）人类特质（低语）。",
          tags=["literary-device", "psle-format"], moed_code="E-P6-RC-02")

    add_q("ENG-P6-007", 6, "english", "multiple_choice", "hard",
          "'Her argument was as solid as a rock.' What does this metaphor suggest?", "'她的论点坚如磐石。'这个比喻说明什么？",
          options=_mc_options(
              ["Her argument was strong and well-supported", "Her argument was heavy", "Her argument was cold", "Her argument was hard to understand"],
              ["她的论点有力且有充分支持", "她的论点很重", "她的论点很冷淡", "她的论点难以理解"],
              0),
          answer_en="Her argument was strong and well-supported", answer_zh="她的论点有力且有充分支持",
          explanation_en="'Solid as a rock' means strong, reliable and well-founded.",
          explanation_zh="'坚如磐石'表示坚固、可靠和有充分依据。",
          tags=["metaphor", "psle-format"], moed_code="E-P6-RC-03")

    # =================================================================
    # =================================================================

    # --- P1 Science ---
    add_q("SCI-P1-001", 1, "science", "multiple_choice", "easy",
          "Which sense do we use to smell a flower?", "我们用哪个感官来闻花？",
          options=_mc_options(["Nose", "Eyes", "Ears", "Hands"], ["鼻子", "眼睛", "耳朵", "手"], 0),
          answer_en="Nose", answer_zh="鼻子",
          explanation_en="We use our nose to smell.",
          explanation_zh="我们用鼻子闻气味。",
          tags=["voice-first"], moed_code="S-P1-AM-01")

    add_q("SCI-P1-002", 1, "science", "multiple_choice", "easy",
          "Which of these is a living thing?", "哪个是生物？",
          options=_mc_options(["A tree", "A rock", "A toy car", "A book"], ["一棵树", "一块石头", "一辆玩具车", "一本书"], 0),
          answer_en="A tree", answer_zh="一棵树",
          explanation_en="A tree grows, needs food and water, and can reproduce. It is a living thing.",
          explanation_zh="树会生长，需要食物和水，还能繁殖。它是生物。",
          tags=["voice-first"], moed_code="S-P1-LL-01")

    add_q("SCI-P1-003", 1, "science", "short_answer", "easy",
          "Name two things that all living things need to survive.", "说出所有生物生存需要的两样东西。",
          answer_en="Water and food (or air / sunlight)", answer_zh="水和食物（或空气/阳光）",
          explanation_en="Living things need water, food, air and sunlight to survive.",
          explanation_zh="生物需要水、食物、空气和阳光才能生存。",
          tags=["voice-first"], moed_code="S-P1-LL-02")

    add_q("SCI-P1-003", 1, "science", "multiple_choice", "easy",
          "A towel is made of cloth because cloth is:", "毛巾用布做是因为布是：",
          options=_mc_options(["Soft and absorbent", "Hard and shiny", "Transparent", "Magnetic"], ["柔软且吸水的", "坚硬且发亮的", "透明的", "有磁性的"], 0),
          answer_en="Soft and absorbent", answer_zh="柔软且吸水的",
          explanation_en="Cloth is soft (feels nice on skin) and absorbent (soaks up water).",
          explanation_zh="布柔软（接触皮肤舒服）且吸水（能吸收水分）。",
          tags=["voice-first"], moed_code="S-P1-M-01")

    # --- P2 Science ---
    add_q("SCI-P2-001", 2, "science", "multiple_choice", "easy",
          "What is the first stage in the life cycle of a butterfly?", "蝴蝶生命周期的第一阶段是什么？",
          options=_mc_options(["Egg", "Caterpillar", "Pupa", "Butterfly"], ["卵", "毛毛虫", "蛹", "蝴蝶"], 0),
          answer_en="Egg", answer_zh="卵",
          explanation_en="A butterfly starts as an egg, then becomes a caterpillar, then a pupa, then an adult butterfly.",
          explanation_zh="蝴蝶从卵开始，然后变成毛毛虫，再变成蛹，最后变成蝴蝶。",
          tags=["life-cycle"], moed_code="S-P2-GU-01")

    add_q("SCI-P2-002", 2, "science", "short_answer", "medium",
          "Name a habitat for fish.", "说出鱼的一个栖息地。",
          answer_en="A river, pond, lake or ocean", answer_zh="河流、池塘、湖泊或海洋",
          explanation_en="Fish live in water. Their habitats include rivers, ponds, lakes and oceans.",
          explanation_zh="鱼生活在水里。它们的栖息地包括河流、池塘、湖泊和海洋。",
          moed_code="S-P2-H-01")

    add_q("SCI-P2-003", 2, "science", "multiple_choice", "easy",
          "Which material is transparent?", "哪个材料是透明的？",
          options=_mc_options(["Glass", "Wood", "Metal", "Cloth"], ["玻璃", "木头", "金属", "布"], 0),
          answer_en="Glass", answer_zh="玻璃",
          explanation_en="Transparent materials let light pass through so you can see clearly. Glass is transparent.",
          explanation_zh="透明材料能让光通过，所以你能看清楚。玻璃是透明的。",
          moed_code="S-P2-UM-01")

    add_q("SCI-P2-003", 2, "science", "short_answer", "medium",
          "Why do polar bears have thick fur?", "为什么北极熊有厚厚的毛？",
          answer_en="To keep warm in the cold Arctic environment.", answer_zh="为了在寒冷的北极环境中保暖。",
          explanation_en="Thick fur traps body heat and keeps the polar bear warm in freezing temperatures.",
          explanation_zh="厚厚的毛能留住体温，使北极熊在极寒的温度下保持温暖。",
          tags=["adaptation"], moed_code="S-P2-H-02")

    # --- P3 Science ---
    add_q("SCI-P3-001", 3, "science", "multiple_choice", "easy",
          "Which group do humans belong to?", "人类属于哪个类别？",
          options=_mc_options(["Mammals", "Birds", "Reptiles", "Fish"], ["哺乳动物", "鸟类", "爬行动物", "鱼类"], 0),
          answer_en="Mammals", answer_zh="哺乳动物",
          explanation_en="Humans are mammals because they have hair, give birth to live young, and feed their young with milk.",
          explanation_zh="人类是哺乳动物，因为有毛发、胎生、用乳汁哺育幼崽。",
          tags=["classification"], moed_code="S-P3-CL-01")

    add_q("SCI-P3-002", 3, "science", "short_answer", "medium",
          "Name two functions of plant roots.", "说出植物根的两个功能。",
          answer_en="Absorb water and anchor the plant in the soil.", answer_zh="吸收水分并将植物固定在土壤中。",
          explanation_en="Roots absorb water and minerals from the soil, and hold the plant firmly in place.",
          explanation_zh="根从土壤中吸收水分和矿物质，并将植物牢牢固定。",
          moed_code="S-P3-AP-01")

    add_q("SCI-P3-003", 3, "science", "multiple_choice", "medium",
          "A magnet attracts objects made of:", "磁铁吸引由什么制成的物体？",
          options=_mc_options(["Iron and steel", "Plastic and wood", "Glass and paper", "Rubber and cloth"], ["铁和钢", "塑料和木头", "玻璃和纸", "橡胶和布"], 0),
          answer_en="Iron and steel", answer_zh="铁和钢",
          explanation_en="Magnets attract magnetic materials like iron and steel. They do not attract plastic, wood, glass or rubber.",
          explanation_zh="磁铁吸引铁和钢等磁性材料。不吸引塑料、木头、玻璃或橡胶。",
          moed_code="S-P3-MG-01")

    add_q("SCI-P3-004", 3, "science", "structured", "medium",
          "Explain why a rubber band is a good material for a slingshot but a piece of paper is not.", "解释为什么橡皮筋是弹弓的好材料，而纸不是。",
          answer_en="A rubber band is flexible and elastic — it can stretch and return to its shape, storing energy. Paper cannot stretch and would tear.",
          answer_zh="橡皮筋有弹性——它可以拉伸并恢复原状，储存能量。纸不能拉伸，会撕破。",
          explanation_en="Elastic materials stretch and snap back, which creates the force needed in a slingshot.",
          explanation_zh="弹性材料能拉伸并弹回，产生弹弓所需的力量。",
          moed_code="S-P3-MP-01")

    # --- P4 Science ---
    add_q("SCI-P4-001", 4, "science", "multiple_choice", "easy",
          "Heat always flows from:", "热总是从：",
          options=_mc_options(
              ["Hotter object to colder object", "Colder object to hotter object", "Left to right", "Small object to big object"],
              ["较热的物体流向较冷的物体", "较冷的物体流向较热的物体", "从左到右", "从小物体到大物体"],
              0),
          answer_en="Hotter object to colder object", answer_zh="较热的物体流向较冷的物体",
          explanation_en="Heat naturally flows from a region of higher temperature to a region of lower temperature.",
          explanation_zh="热自然地从高温区域流向低温区域。",
          moed_code="S-P4-HT-01")

    add_q("SCI-P4-002", 4, "science", "short_answer", "medium",
          "Why does a shadow form when you stand in sunlight?", "为什么你站在阳光下会形成影子？",
          answer_en="Because light travels in straight lines and your body blocks the light.",
          answer_zh="因为光沿直线传播，你的身体挡住了光。",
          explanation_en="Light travels in straight lines. When an opaque object blocks light, a dark area (shadow) forms behind it.",
          explanation_zh="光沿直线传播。当不透明物体挡住光时，后面会形成黑暗区域（影子）。",
          moed_code="S-P4-LS-01")

    add_q("SCI-P4-003", 4, "science", "multiple_choice", "medium",
          "Sound is produced by:", "声音是由什么产生的？",
          options=_mc_options(["Vibrations", "Light", "Heat", "Electricity"], ["振动", "光", "热", "电"], 0),
          answer_en="Vibrations", answer_zh="振动",
          explanation_en="Sound is produced when something vibrates. The vibrations travel through air (or other materials) to our ears.",
          explanation_zh="当某物振动时产生声音。振动通过空气（或其他材料）传播到我们的耳朵。",
          moed_code="S-P4-SO-01")

    add_q("SCI-P4-004", 4, "science", "short_answer", "medium",
          "What is the first organ food enters when you swallow?", "你吞咽时食物进入的第一个器官是什么？",
          answer_en="The oesophagus (gullet)", answer_zh="食道",
          explanation_en="After chewing and swallowing, food travels down the oesophagus to reach the stomach.",
          explanation_zh="咀嚼和吞咽后，食物沿食道到达胃。",
          tags=["digestive-system"], moed_code="S-P4-DS-01")

    add_q("SCI-P4-005", 4, "science", "multiple_choice", "easy",
          "Which organ pumps blood around the body?", "哪个器官把血液泵送到全身？",
          options=_mc_options(["Heart", "Lungs", "Stomach", "Brain"], ["心脏", "肺", "胃", "大脑"], 0),
          answer_en="Heart", answer_zh="心脏",
          explanation_en="The heart is a muscle that pumps blood through blood vessels to all parts of the body.",
          explanation_zh="心脏是一块肌肉，通过血管把血液泵送到身体各部位。",
          tags=["circulatory-system"], moed_code="S-P4-CR-01")

    # --- P5 Science ---
    add_q("SCI-P5-001", 5, "science", "multiple_choice", "easy",
          "Which part of a plant cell is NOT found in an animal cell?", "植物细胞的哪个部分在动物细胞中不存在？",
          options=_mc_options(["Cell wall", "Nucleus", "Cell membrane", "Cytoplasm"], ["细胞壁", "细胞核", "细胞膜", "细胞质"], 0),
          answer_en="Cell wall", answer_zh="细胞壁",
          explanation_en="Plant cells have a cell wall made of cellulose. Animal cells do not have a cell wall.",
          explanation_zh="植物细胞有由纤维素组成的细胞壁。动物细胞没有细胞壁。",
          moed_code="S-P5-CE-01")

    add_q("SCI-P5-002", 5, "science", "short_answer", "medium",
          "What are the three agents of seed dispersal?", "种子传播的三种媒介是什么？",
          answer_en="Wind, water and animals (including humans).", answer_zh="风、水和动物（包括人类）。",
          explanation_en="Seeds are dispersed by wind (e.g. dandelion), water (e.g. coconut) and animals (e.g. burrs).",
          explanation_zh="种子通过风（如蒲公英）、水（如椰子）和动物（如苍耳）传播。",
          tags=["reproduction"], moed_code="S-P5-RP-01")

    add_q("SCI-P5-003", 5, "science", "multiple_choice", "medium",
          "Which state of matter has a fixed volume but no fixed shape?", "哪种物质状态有固定体积但没有固定形状？",
          options=_mc_options(["Liquid", "Solid", "Gas", "Plasma"], ["液体", "固体", "气体", "等离子体"], 0),
          answer_en="Liquid", answer_zh="液体",
          explanation_en="Liquids take the shape of their container but have a fixed volume.",
          explanation_zh="液体呈现容器的形状，但有固定的体积。",
          moed_code="S-P5-MT-01")

    add_q("SCI-P5-004", 5, "science", "structured", "hard",
          "Explain why a metal spoon feels colder than a plastic spoon at room temperature.", "解释为什么在室温下金属勺比塑料勺感觉更冷。",
          answer_en="Metal is a better conductor of heat than plastic. When you touch the metal spoon, it conducts heat away from your hand faster than plastic, making it feel colder.",
          answer_zh="金属比塑料更好地传导热量。当你触摸金属勺时，它比塑料更快地从手中传导走热量，所以感觉更冷。",
          explanation_en="Good conductors transfer heat quickly. Metal conducts heat away from your skin, creating a cold sensation.",
          explanation_zh="良导体能快速传递热量。金属从皮肤传导走热量，产生冷的感觉。",
          tags=["conductors-insulators"], moed_code="S-P5-CI-01")

    add_q("SCI-P5-005", 5, "science", "multiple_choice", "medium",
          "When water boils, it changes from:", "当水沸腾时，它从：",
          options=_mc_options(
              ["Liquid to gas", "Solid to liquid", "Gas to liquid", "Liquid to solid"],
              ["液体变成气体", "固体变成液体", "气体变成液体", "液体变成固体"],
              0),
          answer_en="Liquid to gas", answer_zh="液体变成气体",
          explanation_en="Boiling is the change of state from liquid to gas (water vapour) at 100°C.",
          explanation_zh="沸腾是在100°C时从液体变成气体（水蒸气）的状态变化。",
          tags=["changes-of-state"], moed_code="S-P5-CS-01")

    add_q("SCI-P5-006", 5, "science", "short_answer", "medium",
          "During evaporation, does the mass of the water change?", "在蒸发过程中，水的质量会改变吗？",
          answer_en="No. Mass is conserved during a change of state.", answer_zh="不会。状态变化过程中质量守恒。",
          explanation_en="The water molecules change from liquid to gas, but the total number of molecules (mass) stays the same.",
          explanation_zh="水分子从液体变成气体，但分子总数（质量）保持不变。",
          moed_code="S-P5-CS-02")

    # --- P6 Science ---
    add_q("SCI-P6-001", 6, "science", "structured", "hard",
          "In a food chain: Grass → Grasshopper → Frog → Snake → Eagle. What would happen to the frog population if all the snakes were removed?", "在食物链中：草→蚱蜢→青蛙→蛇→鹰。如果所有蛇都被移除，青蛙的数量会怎样？",
          answer_en="The frog population would increase because there are no snakes to eat them.",
          answer_zh="青蛙的数量会增加，因为没有蛇吃它们了。",
          explanation_en="Removing a predator (snake) means its prey (frog) has fewer natural enemies, so its population increases.",
          explanation_zh="移除捕食者（蛇）意味着其猎物（青蛙）的天敌减少，所以数量增加。",
          tags=["food-chain", "ecosystem"], moed_code="S-P6-FC-01")

    add_q("SCI-P6-002", 6, "science", "multiple_choice", "medium",
          "A cactus has spines instead of leaves. How does this help it survive in the desert?", "仙人掌有刺而不是叶子。这如何帮助它在沙漠中生存？",
          options=_mc_options(
              ["Reduces water loss through transpiration", "Makes the plant look scary", "Attracts more insects", "Helps the plant swim"],
              ["减少蒸腾作用造成的水分流失", "让植物看起来吓人", "吸引更多昆虫", "帮助植物游泳"],
              0),
          answer_en="Reduces water loss through transpiration", answer_zh="减少蒸腾作用造成的水分流失",
          explanation_en="Spines have a smaller surface area than leaves, reducing water loss — a key adaptation in dry environments.",
          explanation_zh="刺的表面积比叶子小，减少水分流失——这是干旱环境中的关键适应。",
          tags=["adaptation"], moed_code="S-P6-AE-01")

    add_q("SCI-P6-003", 6, "science", "short_answer", "medium",
          "In a circuit with a battery, bulb and switch, what happens when you open the switch?", "在有电池、灯泡和开关的电路中，当你打开开关时会发生什么？",
          answer_en="The bulb goes out (stops lighting) because the circuit is broken and current cannot flow.",
          answer_zh="灯泡熄灭（停止发光），因为电路断开，电流无法流动。",
          explanation_en="An open switch breaks the circuit. Without a complete path, electric current cannot flow.",
          explanation_zh="打开开关会断开电路。没有完整的路径，电流无法流动。",
          moed_code="S-P6-EC-01")

    add_q("SCI-P6-004", 6, "science", "structured", "hard",
          "Describe the water cycle in the correct order, naming each process.", "按正确顺序描述水循环，命名每个过程。",
          answer_en="1. Evaporation: Water from oceans, rivers and lakes turns into water vapour when heated by the sun. 2. Condensation: Water vapour rises, cools and forms tiny water droplets (clouds). 3. Precipitation: When droplets become heavy, they fall as rain. 4. Collection: Water collects in bodies of water and the cycle repeats.",
          answer_zh="1.蒸发：海洋、河流和湖泊的水被太阳加热变成水蒸气。2.凝结：水蒸气上升、冷却形成小水滴（云）。3.降水：水滴变重时，以雨的形式落下。4.汇集：水汇集到水体中，循环重复。",
          explanation_en="The water cycle is a continuous process: evaporation → condensation → precipitation → collection.",
          explanation_zh="水循环是一个持续过程：蒸发→凝结→降水→汇集。",
          tags=["water-cycle"], moed_code="S-P6-WC-01")

    add_q("SCI-P6-005", 6, "science", "multiple_choice", "medium",
          "Which force pulls objects towards the Earth?", "哪种力把物体拉向地球？",
          options=_mc_options(["Gravity", "Friction", "Magnetic force", "Elastic spring force"], ["重力", "摩擦力", "磁力", "弹性弹力"], 0),
          answer_en="Gravity", answer_zh="重力",
          explanation_en="Gravity is the force of attraction between the Earth and objects near its surface.",
          explanation_zh="重力是地球与其表面附近物体之间的吸引力。",
          moed_code="S-P6-FO-01")

    add_q("SCI-P6-006", 6, "science", "structured", "hard",
          "Mei Ling wants to find out if the amount of water affects how tall a plant grows. What is: (a) the variable to change, (b) the variable to measure, (c) one variable to keep the same?", "美玲想知道水量是否影响植物的高度。什么是：(a)要改变的变量，(b)要测量的变量，(c)要保持不变的一个变量？",
          answer_en="(a) Amount of water given. (b) Height of the plant. (c) Any one: type of plant, amount of sunlight, type of soil, pot size.",
          answer_zh="(a)给水量。(b)植物高度。(c)任一：植物种类、阳光量、土壤类型、花盆大小。",
          explanation_en="In a fair test, only one variable is changed (independent), one is measured (dependent), and all others are kept constant (controlled).",
          explanation_zh="在公平测试中，只改变一个变量（自变量），测量一个变量（因变量），其他所有变量保持不变（控制变量）。",
          tags=["experimental-design", "psle-format"], moed_code="S-P6-PS-01")

    add_q("SCI-P6-007", 6, "science", "short_answer", "medium",
          "What gas do plants take in during photosynthesis?", "植物在光合作用中吸收什么气体？",
          answer_en="Carbon dioxide", answer_zh="二氧化碳",
          explanation_en="Plants take in carbon dioxide and water, using sunlight to produce glucose and oxygen.",
          explanation_zh="植物吸收二氧化碳和水，利用阳光产生葡萄糖和氧气。",
          tags=["photosynthesis"], moed_code="S-P6-PH-01")

    add_q("SCI-P6-008", 6, "science", "multiple_choice", "hard",
          "Which body system sends signals to coordinate the body's responses?", "哪个身体系统发送信号来协调身体的反应？",
          options=_mc_options(["Nervous system", "Digestive system", "Circulatory system", "Respiratory system"], ["神经系统", "消化系统", "循环系统", "呼吸系统"], 0),
          answer_en="Nervous system", answer_zh="神经系统",
          explanation_en="The nervous system (brain, spinal cord, nerves) sends electrical signals to coordinate all body functions.",
          explanation_zh="神经系统（大脑、脊髓、神经）发送电信号来协调所有身体功能。",
          moed_code="S-P6-HS-01")

    # --- More Science questions ---
    # P1
    add_q("SCI-P1-003", 1, "science", "short_answer", "easy",
          "Name two materials that are waterproof.", "说出两种防水材料。",
          answer_en="Plastic and metal", answer_zh="塑料和金属",
          explanation_en="Plastic and metal do not absorb water, so they are waterproof.",
          explanation_zh="塑料和金属不吸水，所以是防水的。",
          tags=["voice-first"], moed_code="S-P1-M-02")

    # P2
    add_q("SCI-P2-003", 2, "science", "multiple_choice", "easy",
          "Which animal lives in the ocean?", "哪种动物生活在海洋里？",
          options=_mc_options(["Dolphin", "Rabbit", "Elephant", "Cat"], ["海豚", "兔子", "大象", "猫"], 0),
          answer_en="Dolphin", answer_zh="海豚",
          explanation_en="Dolphins are marine mammals that live in the ocean.",
          explanation_zh="海豚是生活在海洋中的海洋哺乳动物。",
          tags=["habitat"], moed_code="S-P2-H-03")

    add_q("SCI-P2-003", 2, "science", "short_answer", "medium",
          "What happens to water when it is heated?", "水加热时会发生什么？",
          answer_en="It evaporates and turns into water vapour.", answer_zh="它会蒸发变成水蒸气。",
          explanation_en="When water is heated enough, it changes from liquid to gas (water vapour).",
          explanation_zh="当水被加热到一定程度，它会从液体变成气体（水蒸气）。",
          moed_code="S-P2-UM-02")

    # P3
    add_q("SCI-P3-004", 3, "science", "multiple_choice", "medium",
          "Which part of a plant absorbs water from the soil?", "植物的哪个部分从土壤中吸收水分？",
          options=_mc_options(["Roots", "Leaves", "Flowers", "Stem"], ["根", "叶", "花", "茎"], 0),
          answer_en="Roots", answer_zh="根",
          explanation_en="Roots absorb water and minerals from the soil.",
          explanation_zh="根从土壤中吸收水分和矿物质。",
          moed_code="S-P3-AP-02")

    add_q("SCI-P3-004", 3, "science", "short_answer", "medium",
          "What are the two poles of a magnet called?", "磁铁的两个极叫什么？",
          answer_en="North pole and south pole", answer_zh="北极和南极",
          explanation_en="Every magnet has a north pole and a south pole. Like poles repel, unlike poles attract.",
          explanation_zh="每个磁铁都有北极和南极。同性相斥，异性相吸。",
          moed_code="S-P3-MG-02")

    # P4
    add_q("SCI-P4-005", 4, "science", "structured", "hard",
          "Explain why a metal spoon in hot soup becomes hot but a wooden spoon does not.", "解释为什么放在热汤里的金属勺会变热，而木勺不会。",
          answer_en="Metal is a good conductor of heat, so heat from the soup travels through the spoon. Wood is an insulator, so heat does not travel through it easily.",
          answer_zh="金属是良导体，所以汤中的热会传到勺子上。木头是绝缘体，所以热不容易传递。",
          explanation_en="Conductors transfer heat; insulators do not.",
          explanation_zh="导体传递热，绝缘体不传递热。",
          moed_code="S-P4-HT-02")

    add_q("SCI-P4-005", 4, "science", "multiple_choice", "easy",
          "What organ do we use to breathe?", "我们用什么器官呼吸？",
          options=_mc_options(["Lungs", "Heart", "Stomach", "Liver"], ["肺", "心脏", "胃", "肝脏"], 0),
          answer_en="Lungs", answer_zh="肺",
          explanation_en="The lungs take in oxygen from air and release carbon dioxide.",
          explanation_zh="肺从空气中吸入氧气，释放二氧化碳。",
          tags=["respiratory-system"], moed_code="S-P4-CR-02")

    # P5
    add_q("SCI-P5-006", 5, "science", "structured", "hard",
          "Design a fair test to find out which material keeps a drink hottest: foam, cotton wool, or newspaper. State: (a) what to change, (b) what to measure, (c) two things to keep the same.", "设计一个公平测试来找出哪种材料最能保温：泡沫、棉花还是报纸。说明：(a)要改变的变量，(b)要测量的变量，(c)要保持不变的两个变量。",
          answer_en="(a) Type of wrapping material. (b) Temperature of water after a set time. (c) Same volume of water, same starting temperature, same container, same time.",
          answer_zh="(a)包裹材料的类型。(b)一定时间后的水温。(c)相同水量、相同初始温度、相同容器、相同时间。",
          tags=["experimental-design"], moed_code="S-P5-CI-02")

    add_q("SCI-P5-006", 5, "science", "multiple_choice", "medium",
          "Which of these is a chemical change?", "以下哪个是化学变化？",
          options=_mc_options(["Rusting of iron", "Melting of ice", "Boiling water", "Breaking glass"], ["铁生锈", "冰融化", "水沸腾", "玻璃破碎"], 0),
          answer_en="Rusting of iron", answer_zh="铁生锈",
          explanation_en="Rusting produces a new substance (iron oxide). The others are physical changes.",
          explanation_zh="生锈产生新物质（氧化铁）。其他都是物理变化。",
          moed_code="S-P5-MT-02")

    # P6
    add_q("SCI-P6-008", 6, "science", "short_answer", "medium",
          "What is the role of decomposers in an ecosystem?", "分解者在生态系统中的作用是什么？",
          answer_en="Decomposers break down dead organisms and waste, returning nutrients to the soil.",
          answer_zh="分解者分解死亡的生物和废物，将营养物质返回到土壤中。",
          tags=["ecosystem"], moed_code="S-P6-FC-02")

    add_q("SCI-P6-005", 6, "science", "multiple_choice", "hard",
          "In a parallel circuit, if one bulb blows, what happens to the other bulbs?", "在并联电路中，如果一个灯泡烧了，其他灯泡会怎样？",
          options=_mc_options(
              ["They stay lit", "They all go out", "They become dimmer", "They become brighter"],
              ["它们继续亮", "它们都熄灭", "它们变暗", "它们变亮"],
              0),
          answer_en="They stay lit", answer_zh="它们继续亮",
          explanation_en="In a parallel circuit, each bulb has its own path. If one breaks, the others still work.",
          explanation_zh="在并联电路中，每个灯泡有自己的路径。如果一个坏了，其他的还能工作。",
          moed_code="S-P6-EC-02")

    add_q("SCI-P6-007", 6, "science", "structured", "hard",
          "Explain how the circulatory and respiratory systems work together.", "解释循环系统和呼吸系统是如何协同工作的。",
          answer_en="The lungs take in oxygen during breathing. The heart pumps oxygen-rich blood from the lungs to all body cells. At the same time, carbon dioxide is carried from cells back to the lungs to be exhaled.",
          answer_zh="肺在呼吸时吸入氧气。心脏把富含氧气的血液从肺泵到全身细胞。同时，二氧化碳从细胞带回肺，然后呼出。",
          tags=["body-systems"], moed_code="S-P6-HS-02")

    # =================================================================
    # =================================================================

    # --- P1 Chinese ---
    add_q("CHI-P1-001", 1, "chinese", "multiple_choice", "easy",
          "以下哪个是声母？", "以下哪个是声母？",
          options=_mc_options(["b", "a", "ao", "ang"], ["b", "a", "ao", "ang"], 0),
          answer_en="b", answer_zh="b",
          explanation_en="声母是汉语拼音中的辅音部分。b是一个声母。",
          explanation_zh="声母是汉语拼音中的辅音部分。b是一个声母。",
          tags=["voice-first", "pinyin"], moed_code="C-P1-HP-01")

    add_q("CHI-P1-002", 1, "chinese", "fill_in_blank", "easy",
          '汉字"人"有___笔。', "汉字'人'有___笔。",
          answer_en="2", answer_zh="2",
          explanation_en="'人' has two strokes: first is pie (撇), second is na (捺).",
          explanation_zh="'人'有两笔：第一笔是撇，第二笔是捺。",
          tags=["voice-first", "stroke-order"], moed_code="C-P1-SO-01")

    add_q("CHI-P1-003", 1, "chinese", "multiple_choice", "easy",
          "哪个字是'大'的反义词？", "哪个字是'大'的反义词？",
          options=_mc_options(["小", "多", "高", "长"], ["小", "多", "高", "长"], 0),
          answer_en="小", answer_zh="小",
          explanation_en="'大' and '小' are antonyms.",
          explanation_zh="'大'和'小'是一对反义词。",
          tags=["voice-first"], moed_code="C-P1-CW-01")

    add_q("CHI-P1-004", 1, "chinese", "short_answer", "easy",
          "看图写一句话：一只猫在草地上玩。", "看图写一句话：一只猫在草地上玩。",
          answer_en="(Open-ended — example: 小猫在草地上玩。) （开放式——例如：小猫在草地上玩。）",
          answer_zh="（开放式——例如：小猫在草地上玩。）",
          explanation_en="A good sentence describes what you see and uses correct punctuation.",
          explanation_zh="好句子要描述你看到的内容，并使用正确的标点符号。",
          tags=["voice-first", "picture-description"], moed_code="C-P1-PD-01")

    add_q("CHI-P1-005", 1, "chinese", "fill_in_blank", "easy",
          "这是___猫。一/二/三", "这是___猫。一/二/三",
          answer_en="一", answer_zh="一",
          explanation_en="'一' means the quantity is one.",
          explanation_zh="'一'表示数量是一个。",
          tags=["voice-first"], moed_code="C-P1-CW-02")

    add_q("CHI-P1-006", 1, "chinese", "multiple_choice", "easy",
          "'妈妈'的意思是：", "'妈妈'的意思是：",
          options=_mc_options(["Mother", "Father", "Sister", "Brother"], ["母亲", "父亲", "姐姐", "弟弟"], 0),
          answer_en="Mother", answer_zh="母亲",
          explanation_en="妈妈 is the colloquial term for mother.",
          explanation_zh="妈妈是母亲的口语说法。",
          tags=["voice-first"], moed_code="C-P1-CW-03")

    # --- P2 Chinese ---
    add_q("CHI-P2-001", 2, "chinese", "fill_in_blank", "medium",
          '用"因为……所以……"造句：___下雨了，___我不去公园。', "用'因为……所以……'造句：___下雨了，___我不去公园。",
          answer_en="因为，所以", answer_zh="因为，所以",
          explanation_en="因为……所以…… expresses cause and effect.",
          explanation_zh="因为……所以……表示因果关系。因为下雨了，所以我不去公园。",
          moed_code="C-P2-SF-01")

    add_q("CHI-P2-002", 2, "chinese", "comprehension", "medium",
          "阅读：小明每天早上六点起床。他刷牙、洗脸，然后吃早餐。七点，他背着书包去上学。问题：小明几点去上学？", "阅读：小明每天早上六点起床。他刷牙、洗脸，然后吃早餐。七点，他背着书包去上学。问题：小明几点去上学？",
          answer_en="7 o'clock", answer_zh="七点",
          explanation_en="文章说小明七点去上学。",
          explanation_zh="文章说小明七点去上学。",
          tags=["reading-comprehension"], moed_code="C-P2-RC-01")

    add_q("CHI-P2-003", 2, "chinese", "short_answer", "medium",
          "用以下词语写一段话（5-8句）：学校、老师、同学、开心", "用以下词语写一段话（5-8句）：学校、老师、同学、开心",
          answer_en="(Open-ended — example: 我在学校上学。我的老师很好。同学很友好。在学校我很开心。)",
          answer_zh="（开放式——例如：我在学校上学。我的老师很好。同学很友好。在学校我很开心。）",
          explanation_en="Use all the given words in a coherent paragraph with complete sentences.",
          explanation_zh="在连贯的段落中使用所有给定的词语，句子要完整。",
          tags=["writing"], moed_code="C-P2-W-01")

    add_q("CHI-P2-004", 2, "chinese", "multiple_choice", "easy",
          "哪个字的部首是'氵'？", "哪个字的部首是'氵'？",
          options=_mc_options(["河", "树", "花", "石"], ["河", "树", "花", "石"], 0),
          answer_en="河", answer_zh="河",
          explanation_en="The radical of '河' is '氵' (three-dot water), indicating it relates to water.",
          explanation_zh="'河'的部首是'氵'（三点水），表示与水有关。",
          moed_code="C-P2-ZS-01")

    add_q("CHI-P2-005", 2, "chinese", "fill_in_blank", "medium",
          "我___（正在/已经）吃完饭了。", "我___（正在/已经）吃完饭了。",
          answer_en="已经", answer_zh="已经",
          explanation_en="'已经' indicates a completed action. '已经吃完饭' means finished eating.",
          explanation_zh="'已经'表示动作完成了。'已经吃完饭'表示吃完了。",
          moed_code="C-P2-SF-02")

    # --- P3 Chinese ---
    add_q("CHI-P3-001", 3, "chinese", "multiple_choice", "medium",
          "以下哪个成语表示'非常高兴'？", "以下哪个成语表示'非常高兴'？",
          options=_mc_options(["兴高采烈", "垂头丧气", "一心一意", "三心二意"], ["兴高采烈", "垂头丧气", "一心一意", "三心二意"], 0),
          answer_en="兴高采烈", answer_zh="兴高采烈",
          explanation_en="'兴高采烈' describes being very happy and excited.",
          explanation_zh="'兴高采烈'形容非常高兴的样子。",
          tags=["chengyu"], moed_code="C-P3-VP-01")

    add_q("CHI-P3-002", 3, "chinese", "comprehension", "medium",
          "阅读：星期天，小华和妈妈一起去市场。市场里有很多水果，有苹果、香蕉和橙子。小华最喜欢香蕉，妈妈买了两斤。问题：小华最喜欢什么水果？", "阅读：星期天，小华和妈妈一起去市场。市场里有很多水果，有苹果、香蕉和橙子。小华最喜欢香蕉，妈妈买了两斤。问题：小华最喜欢什么水果？",
          answer_en="Banana", answer_zh="香蕉",
          explanation_en="文章说小华最喜欢香蕉。",
          explanation_zh="文章说小华最喜欢香蕉。",
          tags=["reading-comprehension"], moed_code="C-P3-RC-01")

    add_q("CHI-P3-003", 3, "chinese", "fill_in_blank", "medium",
          "他___学习很努力，___成绩很好。（不但……而且……/虽然……但是……）", "他___学习很努力，___成绩很好。（不但……而且……/虽然……但是……）",
          answer_en="不但，而且", answer_zh="不但，而且",
          explanation_en="'不但……而且……' expresses progressive relationship.",
          explanation_zh="'不但……而且……'表示递进关系，强调两个方面都好。",
          moed_code="C-P3-SF-01")

    add_q("CHI-P3-004", 3, "chinese", "composition", "hard",
          "看图作文：图上画着一个小男孩在帮助一位老奶奶过马路。写一篇80-120字的作文。", "看图作文：图上画着一个小男孩在帮助一位老奶奶过马路。写一篇80-120字的作文。",
          answer_en="(Open-ended — assessed on: clear narrative, appropriate vocabulary, correct grammar, moral lesson)",
          answer_zh="（开放式——评估标准：叙事清晰、词汇恰当、语法正确、有道德启示）",
          explanation_en="Describe the picture clearly, explain what the boy did, and include what we can learn from this.",
          explanation_zh="清楚描述图片内容，解释男孩做了什么，并包括我们能从中学到什么。",
          tags=["composition", "picture-composition"], moed_code="C-P3-CW-01")

    add_q("CHI-P3-005", 3, "chinese", "short_answer", "medium",
          "朗读下面一段话，注意发音和停顿：今天天气很好。小明和朋友们一起去公园。他们在公园里玩游戏，吃零食。大家都很开心。", "朗读下面一段话，注意发音和停顿：今天天气很好。小明和朋友们一起去公园。他们在公园里玩游戏，吃零食。大家都很开心。",
          answer_en="(Assessed on: correct pronunciation, tone accuracy, appropriate pausing at punctuation)",
          answer_zh="（评估标准：发音正确、声调准确、标点处适当停顿）",
          explanation_en="朗读时要注意每个字的声调和标点处的停顿。",
          explanation_zh="朗读时要注意每个字的声调和标点处的停顿。",
          tags=["oral", "reading-aloud"], moed_code="C-P3-OR-01")

    # --- P4 Chinese ---
    add_q("CHI-P4-001", 4, "chinese", "comprehension", "hard",
          "阅读：李明是一个乐于助人的孩子。有一天，他在放学路上看到一个小女孩在哭。原来她的风筝卡在树上了。李明想了想，找来一根长棍子，帮小女孩把风筝取了下来。小女孩高兴地笑了，说：谢谢你！问题：李明用什么帮小女孩取风筝？", "阅读：李明是一个乐于助人的孩子。有一天，他在放学路上看到一个小女孩在哭。原来她的风筝卡在树上了。李明想了想，找来一根长棍子，帮小女孩把风筝取了下来。小女孩高兴地笑了，说：谢谢你！问题：李明用什么帮小女孩取风筝？",
          answer_en="A long stick", answer_zh="一根长棍子",
          explanation_en="文章说李明找来一根长棍子，帮小女孩把风筝取了下来。",
          explanation_zh="文章说李明找来一根长棍子，帮小女孩把风筝取了下来。",
          tags=["reading-comprehension"], moed_code="C-P4-RC-01")

    add_q("CHI-P4-002", 4, "chinese", "cloze", "medium",
          "综合填空：今天，学校___（组织/举办）了一次郊游。同学们___（非常/特别）开心。我们在公园里___（做/玩）游戏、拍照。这是一次___（难忘/难忘）的经历。", "综合填空：今天，学校___（组织/举办）了一次郊游。同学们___（非常/特别）开心。我们在公园里___（做/玩）游戏、拍照。这是一次___（难忘/难忘）的经历。",
          answer_en="组织，非常，玩，难忘", answer_zh="组织，非常，玩，难忘",
          explanation_en="组织郊游是固定搭配。非常表示程度。玩游戏是正确搭配。难忘修饰经历。",
          explanation_zh="组织郊游是固定搭配。非常表示程度。玩游戏是正确搭配。难忘修饰经历。",
          tags=["cloze-passage"], moed_code="C-P4-CF-01")

    add_q("CHI-P4-003", 4, "chinese", "composition", "hard",
          "题目：一件令我感动的事。写一篇100-150字的叙事作文。", "题目：一件令我感动的事。写一篇100-150字的叙事作文。",
          answer_en="(Open-ended — assessed on: clear narrative structure, emotional expression, dialogue, varied sentence structures)",
          answer_zh="（开放式——评估标准：叙事结构清晰、情感表达、对话运用、句式多样）",
          explanation_en="叙事作文要有时间、地点、人物、起因、经过和结果。要写出令你感动的原因。",
          explanation_zh="叙事作文要有时间、地点、人物、起因、经过和结果。要写出令你感动的原因。",
          tags=["composition", "narrative"], moed_code="C-P4-CW-01")

    add_q("CHI-P4-004", 4, "chinese", "multiple_choice", "medium",
          "以下哪个句子正确使用了'了'？", "以下哪个句子正确使用了'了'？",
          options=_mc_options(
              ["我吃了饭。", "我吃饭了昨天。", "我了去学校。", "昨天我了吃饭。"],
              ["我吃了饭。", "我吃饭了昨天。", "我了去学校。", "昨天我了吃饭。"],
              0),
          answer_en="我吃了饭。", answer_zh="我吃了饭。",
          explanation_en="'了' is placed after a verb to indicate completed action.",
          explanation_zh="'了'放在动词后面表示动作完成。",
          moed_code="C-P4-GF-01")

    add_q("CHI-P4-005", 4, "chinese", "short_answer", "medium",
          "口语会话：如果你是班长，你会怎么组织一次班级活动？用中文回答。", "口语会话：如果你是班长，你会怎么组织一次班级活动？用中文回答。",
          answer_en="(Open-ended — assessed on: fluency, vocabulary, coherent reasoning, appropriate register)",
          answer_zh="（开放式——评估标准：流利度、词汇、推理连贯、语气恰当）",
          explanation_en="回答要有条理，说明活动的内容、时间和地点，以及你为什么选择这个活动。",
          explanation_zh="回答要有条理，说明活动的内容、时间和地点，以及为什么选择这个活动。",
          tags=["oral", "conversation"], moed_code="C-P4-OR-01")

    add_q("CHI-P4-006", 4, "chinese", "fill_in_blank", "medium",
          "我___（着/了/过）这本书，很有意思。", "我___（着/了/过）这本书，很有意思。",
          answer_en="看过", answer_zh="看过",
          explanation_en="'过' indicates experience, showing something was done before.",
          explanation_zh="'过'表示经历，说明以前做过某事。",
          moed_code="C-P4-GF-02")

    # --- P5 Chinese ---
    add_q("CHI-P5-001", 5, "chinese", "comprehension", "hard",
          "Read: Singapore is a multicultural country with Chinese, Malay, Indian and other races living in harmony. The teacher says: 'Although we come from different backgrounds, we all love this homeland.' Question: What is the central theme?",
          "阅读：新加坡是一个多元文化的国家。在这里，华人、马来人、印度人和其他种族和谐共处。老师常说：'我们虽然来自不同的背景，但我们都热爱这个家园。'问题：这篇文章的中心思想是什么？",
          answer_en="新加坡虽然种族多元，但不同种族和谐共处，共同热爱这个家园。",
          answer_zh="新加坡虽然种族多元，但不同种族和谐共处，共同热爱这个家园。",
          explanation_en="文章通过种族和谐日的活动，表达了多元文化和谐共存的主题。",
          explanation_zh="文章通过种族和谐日的活动，表达了多元文化和谐共存的主题。",
          tags=["reading-comprehension", "theme-analysis"], moed_code="C-P5-RC-01")

    add_q("CHI-P5-002", 5, "chinese", "cloze", "hard",
          "综合填空：在比赛的最后一刻，他___（毅然/突然/居然）决定放弃第一名，把机会让给了队友。这个___（出乎意料/意料之中）的决定让全场___（惊讶/惊奇）。教练说，这才是真正的___（团队精神/个人能力）。", "综合填空：在比赛的最后一刻，他___（毅然/突然/居然）决定放弃第一名，把机会让给了队友。这个___（出乎意料/意料之中）的决定让全场___（惊讶/惊奇）。教练说，这才是真正的___（团队精神/个人能力）。",
          answer_en="毅然，出乎意料，惊讶，团队精神", answer_zh="毅然，出乎意料，惊讶，团队精神",
          explanation_en="毅然表示坚定地。出乎意料表示没想到。惊讶表示吃惊。团队精神是正确搭配。",
          explanation_zh="毅然表示坚定地。出乎意料表示没想到。惊讶表示吃惊。团队精神是正确搭配。",
          tags=["cloze-passage", "psle-format"], moed_code="C-P5-CF-01")

    add_q("CHI-P5-003", 5, "chinese", "composition", "hard",
          "题目：一次难忘的经历。写一篇120字以上的作文。要求：有情节发展、人物描写、心理活动和感悟。", "题目：一次难忘的经历。写一篇120字以上的作文。要求：有情节发展、人物描写、心理活动和感悟。",
          answer_en="(Open-ended — assessed on: plot development, character description, psychological portrayal, meaningful conclusion, rhetorical devices)",
          answer_zh="（开放式——评估标准：情节发展、人物描写、心理刻画、有意义的结尾、修辞手法）",
          explanation_en="作文要有清晰的叙事结构，包括起因、经过、高潮和结果。要写出自己的感受和学到的道理。",
          explanation_zh="作文要有清晰的叙事结构，包括起因、经过、高潮和结果。要写出自己的感受和学到的道理。",
          tags=["composition", "psle-format"], moed_code="C-P5-CW-01")

    add_q("CHI-P5-004", 5, "chinese", "short_answer", "hard",
          "把下面的句子改成'把'字句：妈妈洗干净了衣服。", "把下面的句子改成'把'字句：妈妈洗干净了衣服。",
          answer_en="妈妈把衣服洗干净了。", answer_zh="妈妈把衣服洗干净了。",
          explanation_en="把-sentence structure: subject + 把 + object + verb + other.",
          explanation_zh="'把'字句结构：主语+把+宾语+动词+其他。",
          moed_code="C-P5-GS-01")

    add_q("CHI-P5-005", 5, "chinese", "multiple_choice", "medium",
          "以下哪个成语用得恰当？", "以下哪个成语用得恰当？",
          options=_mc_options(
              ["他做事总是三心二意，所以成绩很好。", "小明专心致志地学习，考试得了第一名。", "这个故事乱七八糟，大家都哭了。", "他画得栩栩如生，所以没人欣赏。"],
              ["他做事总是三心二意，所以成绩很好。", "小明专心致志地学习，考试得了第一名。", "这个故事乱七八糟，大家都哭了。", "他画得栩栩如生，所以没人欣赏。"],
              1),
          answer_en="小明专心致志地学习，考试得了第一名。",
          answer_zh="小明专心致志地学习，考试得了第一名。",
          explanation_en="'专心致志' means very focused, matching the result of getting first place.",
          explanation_zh="'专心致志'表示非常专注，与'考试得了第一名'的结果一致。",
          tags=["chengyu"], moed_code="C-P5-VP-01")

    add_q("CHI-P5-006", 5, "chinese", "short_answer", "medium",
          "口语考试：请看这幅图（一个老人在公交车上没有座位），说说你的想法和你会怎么做。", "口语考试：请看这幅图（一个老人在公交车上没有座位），说说你的想法和你会怎么做。",
          answer_en="(Open-ended — assessed on: fluency, moral reasoning, empathy, appropriate vocabulary and register)",
          answer_zh="（开放式——评估标准：流利度、道德推理、同理心、词汇和语气恰当）",
          explanation_en="回答应表达尊老爱幼的价值观，并描述具体行动。",
          explanation_zh="回答应表达尊老爱幼的价值观，并描述具体行动。",
          tags=["oral", "stimulus-based"], moed_code="C-P5-OR-01")

    # --- P6 Chinese ---
    add_q("CHI-P6-001", 6, "chinese", "comprehension", "hard",
          "Read: Rain beats the window. Lin Xiaoyu holds her report card - Math 92. She remembers failing three months ago. The late-night lights, erased pencil marks, and worn exercise books all make sense now. Question: What do 'erased pencil marks' and 'worn exercise books' reveal?",
          "阅读：雨水敲打着窗户，林小雨坐在书桌前，手里握着那张成绩单。数学，92分。她想起三个月前那个不及格的分数，眼眶湿润了。那些夜晚的灯光、擦掉的橡皮屑、翻烂了的练习册，都在这一刻有了意义。她望向窗外，雨停了，一道彩虹挂在天边。问题：'擦掉的橡皮屑'和'翻烂了的练习册'说明了什么？",
          answer_en="说明小雨付出了很多努力，反复修改和练习。",
          answer_zh="说明小雨付出了很多努力，反复修改和练习。",
          explanation_en="橡皮屑代表反复修改，翻烂的练习册代表大量练习，这些都是刻苦学习的象征。",
          explanation_zh="橡皮屑代表反复修改，翻烂的练习册代表大量练习，这些都是刻苦学习的象征。",
          tags=["reading-comprehension", "detail-analysis", "psle-format"], moed_code="C-P6-RC-01")

    add_q("CHI-P6-002", 6, "chinese", "cloze", "hard",
          "综合填空：面对困难，我们不能___（望而却步/半途而废），而要___（坚持不懈/半途而废）。只有___（迎难而上/知难而退），才能___（取得成功/一事无成）。", "综合填空：面对困难，我们不能___（望而却步/半途而废），而要___（坚持不懈/半途而废）。只有___（迎难而上/知难而退），才能___（取得成功/一事无成）。",
          answer_en="望而却步，坚持不懈，迎难而上，取得成功", answer_zh="望而却步，坚持不懈，迎难而上，取得成功",
          explanation_en="面对困难不能退缩（望而却步），而要坚持（坚持不懈），要勇敢面对（迎难而上），最终才能成功（取得成功）。",
          explanation_zh="面对困难不能退缩（望而却步），而要坚持（坚持不懈），要勇敢面对（迎难而上），最终才能成功（取得成功）。",
          tags=["cloze-passage", "psle-format"], moed_code="C-P6-CF-01")

    add_q("CHI-P6-003", 6, "chinese", "composition", "hard",
          "看图作文：三幅图——第一幅：一个小女孩在考场外紧张地等待。第二幅：她坐在考场里，认真地答题。第三幅：她拿着成绩单，开心地笑了。写一篇150字以上的作文。", "看图作文：三幅图——第一幅：一个小女孩在考场外紧张地等待。第二幅：她坐在考场里，认真地答题。第三幅：她拿着成绩单，开心地笑了。写一篇150字以上的作文。",
          answer_en="(Open-ended — assessed on: plot coherence across three pictures, character development, emotional expression, rich vocabulary, meaningful conclusion)",
          answer_zh="（开放式——评估标准：三幅图情节连贯、人物发展、情感表达、词汇丰富、有意义的结尾）",
          explanation_en="作文要连接三幅图的情节，写出人物的心理变化，最后点明主题或感悟。",
          explanation_zh="作文要连接三幅图的情节，写出人物的心理变化，最后点明主题或感悟。",
          tags=["composition", "three-picture", "psle-format"], moed_code="C-P6-CW-01")

    add_q("CHI-P6-004", 6, "chinese", "short_answer", "hard",
          "完成对话：\nA: 你觉得这次华文考试难吗？\nB: ___\nA: 我也觉得综合填空很难。\nB: ___\nA: 好主意，我们一起复习吧！", "完成对话：\nA: 你觉得这次华文考试难吗？\nB: ___\nA: 我也觉得综合填空很难。\nB: ___\nA: 好主意，我们一起复习吧！",
          answer_en="B1: 有点难，尤其是综合填空部分。B2: 那我们放学后一起复习吧？",
          answer_zh="B1: 有点难，尤其是综合填空部分。B2: 那我们放学后一起复习吧？",
          explanation_en="对话要连贯，回应要自然，符合日常口语习惯。",
          explanation_zh="对话要连贯，回应要自然，符合日常口语习惯。",
          tags=["dialogue-completion", "psle-format"], moed_code="C-P6-CD-01")

    add_q("CHI-P6-005", 6, "chinese", "short_answer", "medium",
          "朗读以下段落，注意声调和语速：\n新加坡是一座美丽的花园城市。这里不仅有高楼大厦，还有许多公园和绿地。人们来自不同的种族和文化背景，但大家和睦相处，共同建设这个美好的家园。", "朗读以下段落，注意声调和语速：\n新加坡是一座美丽的花园城市。这里不仅有高楼大厦，还有许多公园和绿地。人们来自不同的种族和文化背景，但大家和睦相处，共同建设这个美好的家园。",
          answer_en="(Assessed on: tone accuracy, fluency, appropriate pacing, expression)",
          answer_zh="（评估标准：声调准确、流利、语速适当、有感情）",
          explanation_en="朗读时要注意每个字的声调，语速适中，读出对家园的热爱之情。",
          explanation_zh="朗读时要注意每个字的声调，语速适中，读出对家园的热爱之情。",
          tags=["oral", "reading-aloud", "psle-format"], moed_code="C-P6-OR-01")

    add_q("CHI-P6-006", 6, "chinese", "multiple_choice", "hard",
          "以下哪个句子中的修辞手法是比喻？", "以下哪个句子中的修辞手法是比喻？",
          options=_mc_options(
              ["她的笑容像阳光一样温暖。", "小鸟在树上唱歌。", "他跑得像风一样快。", "月亮像一个玉盘挂在天上。"],
              ["她的笑容像阳光一样温暖。", "小鸟在树上唱歌。", "他跑得像风一样快。", "月亮像一个玉盘挂在天上。"],
              0),
          answer_en="她的笑容像阳光一样温暖。", answer_zh="她的笑容像阳光一样温暖。",
          explanation_en="A simile compares one thing to another. 'Like sunshine' compares the smile to sunlight.",
          explanation_zh="比喻是用一种事物来比作另一种事物。'像阳光一样温暖'把笑容比作阳光。",
          tags=["rhetoric", "psle-format"], moed_code="C-P6-RC-02")

    add_q("CHI-P6-007", 6, "chinese", "fill_in_blank", "hard",
          "虽然这次考试我没有考好，___（但是/所以）我不会___（灰心/高兴），下次我一定___（努力/放弃），争取___（进步/退步）。", "虽然这次考试我没有考好，___（但是/所以）我不会___（灰心/高兴），下次我一定___（努力/放弃），争取___（进步/退步）。",
          answer_en="但是，灰心，努力，进步", answer_zh="但是，灰心，努力，进步",
          explanation_en="'虽然……但是……' is a fixed collocation. Based on context, choose 灰心, 努力, and 进步.",
          explanation_zh="'虽然……但是……'是固定搭配。根据句意，应该选择灰心和努力、进步。",
          tags=["psle-format"], moed_code="C-P6-GS-01")

    # --- More Chinese questions ---
    # P1
    add_q("CHI-P1-006", 1, "chinese", "multiple_choice", "easy",
          "哪个是动物的叫声？", "哪个是动物的叫声？",
          options=_mc_options(["汪汪", "叮咚", "哗啦", "轰隆"], ["汪汪", "叮咚", "哗啦", "轰隆"], 0),
          answer_en="汪汪", answer_zh="汪汪",
          explanation_en="'汪汪'是狗的叫声。",
          explanation_zh="'汪汪'是狗的叫声。",
          tags=["voice-first"], moed_code="C-P1-CW-04")

    add_q("CHI-P1-006", 1, "chinese", "short_answer", "easy",
          "说说你最喜欢的水果是什么，为什么。", "说说你最喜欢的水果是什么，为什么。",
          answer_en="(Open-ended — example: 我最喜欢的水果是苹果，因为它又甜又脆。)",
          answer_zh="（开放式——例如：我最喜欢的水果是苹果，因为它又甜又脆。）",
          explanation_en="用完整的句子说出水果名称和原因。",
          explanation_zh="用完整的句子说出水果名称和原因。",
          tags=["voice-first", "oral"], moed_code="C-P1-LS-01")

    # P2
    add_q("CHI-P2-005", 2, "chinese", "multiple_choice", "easy",
          "哪个词语和'快乐'意思最接近？", "哪个词语和'快乐'意思最接近？",
          options=_mc_options(["高兴", "伤心", "生气", "害怕"], ["高兴", "伤心", "生气", "害怕"], 0),
          answer_en="高兴", answer_zh="高兴",
          explanation_en="'快乐'和'高兴'都表示开心的意思。",
          explanation_zh="'快乐'和'高兴'都表示开心的意思。",
          moed_code="C-P2-VB-01")

    add_q("CHI-P2-005", 2, "chinese", "comprehension", "medium",
          "阅读：我的妈妈是一名护士。她每天都很辛苦地工作。她很善良，总是帮助别人。我爱我的妈妈。问题：妈妈做什么工作？",
          "阅读：我的妈妈是一名护士。她每天都很辛苦地工作。她很善良，总是帮助别人。我爱我的妈妈。问题：妈妈做什么工作？",
          answer_en="Nurse", answer_zh="护士",
          explanation_en="文章说妈妈是一名护士。",
          explanation_zh="文章说妈妈是一名护士。",
          tags=["reading-comprehension"], moed_code="C-P2-RC-02")

    # P3
    add_q("CHI-P3-005", 3, "chinese", "multiple_choice", "medium",
          "以下哪个句子是正确的？", "以下哪个句子是正确的？",
          options=_mc_options(
              ["他每天都很努力地学习。", "他每天努力地都很学习。", "他每天地都很努力学习。", "他很努力每天地学习。"],
              ["他每天都很努力地学习。", "他每天努力地都很学习。", "他每天地都很努力学习。", "他很努力每天地学习。"],
              0),
          answer_en="他每天都很努力地学习。", answer_zh="他每天都很努力地学习。",
          explanation_en="正确的语序是：主语+时间状语+都+副词+地+动词。",
          explanation_zh="正确的语序是：主语+时间状语+都+副词+地+动词。",
          moed_code="C-P3-GF-01")

    add_q("CHI-P3-005", 3, "chinese", "short_answer", "medium",
          "改写句子，意思不变：小明很喜欢看书。", "改写句子，意思不变：小明很喜欢看书。",
          answer_en="小明非常爱读书。/ 小明对看书很感兴趣。",
          answer_zh="小明非常爱读书。/ 小明对看书很感兴趣。",
          explanation_en="改写句子要保持原意，但使用不同的表达方式。",
          explanation_zh="改写句子要保持原意，但使用不同的表达方式。",
          moed_code="C-P3-SF-02")

    # P4
    add_q("CHI-P4-006", 4, "chinese", "comprehension", "hard",
          "阅读：下雨了，小红没有带伞。小明看见了，主动把自己的伞借给了小红。小红说：谢谢你，你真好！小明笑着说：不用谢，我们是好朋友嘛。问题：小明为什么把伞借给小红？",
          "阅读：下雨了，小红没有带伞。小明看见了，主动把自己的伞借给了小红。小红说：谢谢你，你真好！小明笑着说：不用谢，我们是好朋友嘛。问题：小明为什么把伞借给小红？",
          answer_en="因为小明看到小红没有带伞，而且他们是好朋友。",
          answer_zh="因为小明看到小红没有带伞，而且他们是好朋友。",
          explanation_en="文章中小明主动借伞，说明他乐于助人，且两人是好朋友。",
          explanation_zh="文章中小明主动借伞，说明他乐于助人，且两人是好朋友。",
          tags=["reading-comprehension"], moed_code="C-P4-RC-02")

    add_q("CHI-P4-006", 4, "chinese", "fill_in_blank", "medium",
          "我们___（应该/必须）遵守学校的规则。", "我们___（应该/必须）遵守学校的规则。",
          answer_en="应该", answer_zh="应该",
          explanation_en="'应该'表示建议或推荐，'必须'表示强制。在这个语境中，'应该'更合适。",
          explanation_zh="'应该'表示建议或推荐，'必须'表示强制。在这个语境中，'应该'更合适。",
          moed_code="C-P4-GF-03")

    # P5
    add_q("CHI-P5-006", 5, "chinese", "multiple_choice", "hard",
          "以下哪个句子使用了拟人的修辞手法？", "以下哪个句子使用了拟人的修辞手法？",
          options=_mc_options(
              ["小鸟在枝头欢快地歌唱。", "小明跑得像风一样快。", "她的脸红得像苹果。", "今天天气很好。"],
              ["小鸟在枝头欢快地歌唱。", "小明跑得像风一样快。", "她的脸红得像苹果。", "今天天气很好。"],
              0),
          answer_en="小鸟在枝头欢快地歌唱。", answer_zh="小鸟在枝头欢快地歌唱。",
          explanation_en="拟人是把非人的事物赋予人的行为或情感。'小鸟歌唱'把小鸟拟人化了。",
          explanation_zh="拟人是把非人的事物赋予人的行为或情感。'小鸟歌唱'把小鸟拟人化了。",
          tags=["rhetoric"], moed_code="C-P5-GS-02")

    add_q("CHI-P5-006", 5, "chinese", "short_answer", "hard",
          "用'不仅……还……'写一个句子。", "用'不仅……还……'写一个句子。",
          answer_en="（开放式——例如：他不仅学习好，还乐于助人。）",
          answer_zh="（开放式——例如：他不仅学习好，还乐于助人。）",
          explanation_en="'不仅……还……'表示递进关系，强调除了前者之外，还有后者。",
          explanation_zh="'不仅……还……'表示递进关系，强调除了前者之外，还有后者。",
          moed_code="C-P5-SF-01")

    # P6
    add_q("CHI-P6-007", 6, "chinese", "comprehension", "hard",
          "阅读：在人生的道路上，我们会遇到许多困难和挫折。但只要我们坚持不懈，勇敢面对，就一定能够战胜它们。正如一句话所说：'失败是成功之母。'问题：'失败是成功之母'告诉我们什么道理？",
          "阅读：在人生的道路上，我们会遇到许多困难和挫折。但只要我们坚持不懈，勇敢面对，就一定能够战胜它们。正如一句话所说：'失败是成功之母。'问题：'失败是成功之母'告诉我们什么道理？",
          answer_en="告诉我们不要害怕失败，要从失败中吸取教训，继续努力，最终会成功。",
          answer_zh="告诉我们不要害怕失败，要从失败中吸取教训，继续努力，最终会成功。",
          explanation_en="'失败是成功之母'是一句成语，意思是失败是成功的先导，从失败中可以找到成功的路。",
          explanation_zh="'失败是成功之母'是一句成语，意思是失败是成功的先导，从失败中可以找到成功的路。",
          tags=["chengyu", "psle-format"], moed_code="C-P6-RC-02")

    add_q("CHI-P6-007", 6, "chinese", "cloze", "hard",
          "综合填空：人生的道路上，没有___（一帆风顺/一路顺风），总会遇到___（挫折/顺利）。但只要我们___（坚持不懈/半途而废），就一定能___（实现梦想/放弃梦想）。",
          "综合填空：人生的道路上，没有___（一帆风顺/一路顺风），总会遇到___（挫折/顺利）。但只要我们___（坚持不懈/半途而废），就一定能___（实现梦想/放弃梦想）。",
          answer_en="一帆风顺，挫折，坚持不懈，实现梦想", answer_zh="一帆风顺，挫折，坚持不懈，实现梦想",
          explanation_en="根据语境，应选表示顺利的'一帆风顺'、表示困难的'挫折'、表示坚持的'坚持不懈'和表示成功的'实现梦想'。",
          explanation_zh="根据语境，应选表示顺利的'一帆风顺'、表示困难的'挫折'、表示坚持的'坚持不懈'和表示成功的'实现梦想'。",
          tags=["cloze-passage", "psle-format"], moed_code="C-P6-CF-02")

    add_q("CHI-P6-007", 6, "chinese", "short_answer", "hard",
          "口语考试：请谈谈你对'少壮不努力，老大徒伤悲'这句话的理解。", "口语考试：请谈谈你对'少壮不努力，老大徒伤悲'这句话的理解。",
          answer_en="(Open-ended — assessed on: understanding of the proverb, personal reflection, coherent reasoning, appropriate vocabulary)",
          answer_zh="（开放式——评估标准：对谚语的理解、个人反思、推理连贯、词汇恰当）",
          explanation_en="这句话的意思是：年轻时不努力，老了就会后悔。应该表达珍惜时光、努力学习/工作的态度。",
          explanation_zh="这句话的意思是：年轻时不努力，老了就会后悔。应该表达珍惜时光、努力学习/工作的态度。",
          tags=["oral", "proverb", "psle-format"], moed_code="C-P6-OR-02")

    # --- Final batch to reach 200+ ---
    add_q("SCI-P1-003", 1, "science", "multiple_choice", "easy",
          "Which part of our body helps us to taste food?", "我们身体的哪个部位帮助我们品尝食物？",
          options=_mc_options(["Tongue", "Nose", "Eyes", "Ears"], ["舌头", "鼻子", "眼睛", "耳朵"], 0),
          answer_en="Tongue", answer_zh="舌头",
          explanation_en="The tongue has taste buds that help us detect sweet, sour, salty and bitter.",
          explanation_zh="舌头上有味蕾，帮助我们分辨甜、酸、咸和苦。",
          tags=["voice-first"], moed_code="S-P1-AM-02")

    add_q("ENG-P3-006", 3, "english", "short_answer", "easy",
          "Write a sentence using the word 'because'.", "用'because'写一个句子。",
          answer_en="(Open-ended — example: I am happy because it is my birthday.)",
          answer_zh="（开放式——例如：我很高兴，因为今天是我的生日。）",
          explanation_en="'Because' is used to give a reason.",
          explanation_zh="'because'用来表示原因。",
          tags=["sentence-construction"], moed_code="E-P3-SC-02")

    add_q("MAT-P4-007", 4, "math", "short_answer", "easy",
          "How many minutes are there in 2 and a half hours?", "两个半小时有多少分钟？",
          answer_en="150 minutes", answer_zh="150分钟",
          explanation_en="2 hours = 120 minutes. Half an hour = 30 minutes. 120 + 30 = 150 minutes.",
          explanation_zh="2小时=120分钟。半小时=30分钟。120+30=150分钟。",
          moed_code="M-P4-T-01")

    add_q("CHI-P2-005", 2, "chinese", "fill_in_blank", "easy",
          "今天天气很___。（好/跑/吃/大）", "今天天气很___。（好/跑/吃/大）",
          answer_en="好", answer_zh="好",
          explanation_en="'天气好'是正确的搭配。",
          explanation_zh="'天气好'是正确的搭配。",
          moed_code="C-P2-CW-01")

    add_q("ENG-P5-006", 5, "english", "short_answer", "medium",
          "What does 'actions speak louder than words' mean?", "'actions speak louder than words'是什么意思？",
          answer_en="What you do is more important than what you say.",
          answer_zh="你做的事情比你说的话更重要。",
          explanation_en="This proverb means that people's actions reveal their true intentions more than their words.",
          explanation_zh="这句谚语的意思是，人们的行动比言语更能揭示他们的真实意图。",
          tags=["proverb", "psle-format"], moed_code="E-P5-VW-02")

    return questions


def build_taxonomy():
    """Load and flatten taxonomy from taxonomy.json."""
    with open(os.path.join(DATA_DIR, "taxonomy.json"), "r", encoding="utf-8") as f:
        taxonomy_data = json.load(f)

    topics = []
    subject_map = {"math": "MAT", "english": "ENG", "science": "SCI", "chinese": "CHI"}

    for subject_key, subject_info in taxonomy_data["subjects"].items():
        prefix = subject_map[subject_key]
        for level_key, level_info in subject_info["levels"].items():
            level = int(level_key)
            for topic in level_info["topics"]:
                topics.append({
                    "topic_id": topic["id"],
                    "level": level,
                    "subject": subject_key,
                    "name_en": topic["name_en"],
                    "name_zh": topic["name_zh"],
                    "description_en": f"MOE {subject_info['name_en']} P{level}: {topic['name_en']}",
                    "description_zh": f"MOE {subject_info['name_zh']} P{level}：{topic['name_zh']}",
                    "learning_outcomes": topic["outcomes"],
                    "parent_topic_id": None,
                })

    return topics


def main():
    print("Generating tutor-sg content pack...")

    topics = build_taxonomy()
    questions = generate_questions()

    print(f"Topics: {len(topics)}")
    print(f"Questions: {len(questions)}")

    # Stats
    by_subject = {}
    by_level = {}
    by_difficulty = {}
    for q in questions:
        by_subject[q["subject"]] = by_subject.get(q["subject"], 0) + 1
        by_level[f"P{q['level']}"] = by_level.get(f"P{q['level']}", 0) + 1
        by_difficulty[q["difficulty"]] = by_difficulty.get(q["difficulty"], 0) + 1

    print(f"\nBy subject: {dict(sorted(by_subject.items()))}")
    print(f"By level: {dict(sorted(by_level.items()))}")
    print(f"By difficulty: {dict(sorted(by_difficulty.items()))}")

    # Validate all questions have required fields
    required = ["question_id", "topic_id", "level", "subject", "question_type",
                "stem_en", "stem_zh", "difficulty"]
    for q in questions:
        for field in required:
            assert field in q and q[field], f"Question {q.get('question_id', '???')} missing {field}"

    # Write question-bank.json
    qb = {
        "version": "1.0.0",
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "MOE Primary School Syllabus PDFs (public Crown Copyright, paraphrased)",
            "copyright_notice": "All questions are originally authored by AaaS. MOE syllabus topic references are paraphrased from public Crown Copyright documents. No textbook or examination paper content has been reproduced or closely paraphrased.",
            "total_questions": len(questions),
            "total_topics": len(topics),
        },
        "topics": topics,
        "questions": questions,
    }

    output_path = os.path.join(DATA_DIR, "question-bank.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(qb, f, ensure_ascii=False, indent=2)

    print(f"\nWritten: {output_path}")
    print("Content pack generation complete.")


if __name__ == "__main__":
    main()
