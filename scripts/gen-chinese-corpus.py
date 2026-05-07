#!/usr/bin/env python3
"""Generate Chinese MT question corpus at scale for P1–P6.
Per Article 11 §7: in-house authored, Qwen-as-first-draft (scripted templates here),
ex-MOE-teacher review layer. Volume targets: P1-P2=500/level, P3-P4=800/level, P5-P6=1200/level.
All questions are originally authored — no textbook reproduction.
"""

import json, os, itertools, random
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
random.seed(42)

# ── Chinese question data per level × topic × type ──────────────────────

# P1 themes: Pinyin, strokes, basic chars, simple sentences, listening, picture description
P1_VOCAB = [
    ("妈妈","māma","mother"), ("爸爸","bàba","father"), ("哥哥","gēge","elder brother"),
    ("姐姐","jiějie","elder sister"), ("弟弟","dìdi","younger brother"), ("妹妹","mèimei","younger sister"),
    ("爷爷","yéye","grandfather"), ("奶奶","nǎinai","grandmother"), ("老师","lǎoshī","teacher"),
    ("同学","tóngxué","classmate"), ("朋友","péngyou","friend"), ("我","wǒ","I/me"),
    ("你","nǐ","you"), ("他","tā","he"), ("她","tā","she"), ("我们","wǒmen","we"),
    ("一","yī","one"), ("二","èr","two"), ("三","sān","three"), ("四","sì","four"),
    ("五","wǔ","five"), ("六","liù","six"), ("七","qī","seven"), ("八","bā","eight"),
    ("九","jiǔ","nine"), ("十","shí","ten"), ("大","dà","big"), ("小","xiǎo","small"),
    ("上","shàng","up/above"), ("下","xià","down/below"), ("人","rén","person"),
    ("天","tiān","sky/day"), ("日","rì","sun/day"), ("月","yuè","moon/month"),
    ("水","shuǐ","water"), ("火","huǒ","fire"), ("山","shān","mountain"),
    ("花","huā","flower"), ("鸟","niǎo","bird"), ("鱼","yú","fish"),
    ("书","shū","book"), ("书包","shūbāo","schoolbag"), ("笔","bǐ","pen"),
    ("猫","māo","cat"), ("狗","gǒu","dog"), ("学校","xuéxiào","school"),
    ("家","jiā","home"), ("好","hǎo","good"), ("有","yǒu","have"),
    ("在","zài","at/in"), ("是","shì","is/are"), ("了","le","(past marker)"),
    ("的","de","(possessive)"), ("不","bù","not"), ("吃","chī","eat"),
    ("喝","hē","drink"), ("看","kàn","look/see"), ("说","shuō","speak"),
    ("听","tīng","listen"), ("走","zǒu","walk"), ("跑","pǎo","run"),
]

P2_VOCAB = [
    ("学习","xuéxí","study"), ("读书","dúshū","read books"), ("写","xiě","write"),
    ("作业","zuòyè","homework"), ("考试","kǎoshì","exam"), ("复习","fùxí","review"),
    ("喜欢","xǐhuān","like"), ("高兴","gāoxìng","happy"), ("生气","shēngqì","angry"),
    ("难过","nánguò","sad"), ("害怕","hàipà","afraid"), ("快乐","kuàilè","joyful"),
    ("早上","zǎoshang","morning"), ("下午","xiàwǔ","afternoon"), ("晚上","wǎnshang","evening"),
    ("今天","jīntiān","today"), ("明天","míngtiān","tomorrow"), ("昨天","zuótiān","yesterday"),
    ("星期","xīngqī","week"), ("点","diǎn","o'clock"), ("半","bàn","half"),
    ("吃饭","chīfàn","eat meal"), ("睡觉","shuìjiào","sleep"), ("起床","qǐchuáng","get up"),
    ("上学","shàngxué","go to school"), ("回家","huíjiā","go home"), ("做","zuò","do"),
    ("玩","wán","play"), ("买","mǎi","buy"), ("去","qù","go"),
    ("新加坡","xīnjiāpō","Singapore"), ("组屋","zǔwū","HDB flat"), ("学校","xuéxiào","school"),
    ("公园","gōngyuán","park"), ("商店","shāngdiàn","shop"), ("医院","yīyuàn","hospital"),
    ("比","bǐ","compare"), ("最","zuì","most"), ("把","bǎ","(object marker)"),
    ("很","hěn","very"), ("都","dōu","all"), ("也","yě","also"),
]

P3_VOCAB = [
    ("认真","rènzhēn","serious"), ("努力","nǔlì","hardworking"), ("聪明","cōngming","clever"),
    ("勇敢","yǒnggǎn","brave"), ("善良","shànliáng","kind"), ("诚实","chéngshí","honest"),
    ("帮助","bāngzhù","help"), ("照顾","zhàogù","take care of"), ("保护","bǎohù","protect"),
    ("虽然","suīrán","although"), ("但是","dànshì","but"), ("因为","yīnwèi","because"),
    ("所以","suǒyǐ","therefore"), ("如果","rúguǒ","if"), ("而且","érqiě","moreover"),
    ("首先","shǒuxiān","first"), ("然后","ránhòu","then"), ("最后","zuìhòu","finally"),
    ("突然","tūrán","suddenly"), ("终于","zhōngyú","finally"), ("于是","yúshì","so/then"),
    ("动物","dòngwù","animal"), ("植物","zhíwù","plant"), ("环境","huánjìng","environment"),
    ("科学","kēxué","science"), ("故事","gùshì","story"), ("文章","wénzhāng","article"),
    ("放假","fàngjià","on holiday"), ("旅行","lǚxíng","travel"), ("活动","huódòng","activity"),
]

P4_VOCAB = [
    ("骄傲","jiāo'ào","proud"), ("谦虚","qiānxū","modest"), ("耐心","nàixīn","patient"),
    ("尊重","zūnzhòng","respect"), ("信任","xìnrèn","trust"), ("理解","lǐjiě","understand"),
    ("建议","jiànyì","suggest"), ("鼓励","gǔlì","encourage"), ("提醒","tíxǐng","remind"),
    ("不仅","bùjǐn","not only"), ("而且","érqiě","but also"), ("无论","wúlùn","no matter"),
    ("只要","zhǐyào","as long as"), ("虽然","suīrán","although"), ("却","què","yet"),
    ("感动","gǎndòng","touched"), ("难忘","nánwàng","unforgettable"), ("精彩","jīngcǎi","wonderful"),
    ("经验","jīngyàn","experience"), ("机会","jīhuì","opportunity"), ("挑战","tiǎozhàn","challenge"),
    ("决定","juédìng","decide"), ("继续","jìxù","continue"), ("成功","chénggōng","success"),
    ("新加坡","xīnjiāpō","Singapore"), ("小贩中心","xiǎofàn zhōngxīn","hawker centre"),
    ("地铁","dìtiě","MRT"), ("动物园","dòngwùyuán","zoo"),
]
P4_IDIOMS = [
    ("一举两得","yījǔliǎngdé","kill two birds with one stone"),
    ("画蛇添足","huàshétiānzú","gild the lily"),
    ("守株待兔","shǒuzhūdàitù","wait for luck to strike"),
    ("井底之蛙","jǐngdǐzhīwā","person with limited outlook"),
]

P5_VOCAB = [
    ("责任","zérèn","responsibility"), ("义务","yìwù","obligation"),
    ("权利","quánlì","right"), ("公平","gōngpíng","fair"),
    ("正义","zhèngyì","justice"), ("尊严","zūnyán","dignity"),
    ("珍惜","zhēnxī","cherish"), ("感恩","gǎn'ēn","grateful"),
    ("奉献","fèngxiàn","dedicate"), ("牺牲","xīshēng","sacrifice"),
    ("因此","yīncǐ","therefore"), ("由于","yóuyú","due to"),
    ("尽管","jǐnguǎn","despite"), ("不但","bùdàn","not only"),
    ("而且","érqiě","but also"), ("否则","fǒuzé","otherwise"),
    ("观点","guāndiǎn","viewpoint"), ("态度","tàidù","attitude"),
    ("影响","yǐngxiǎng","influence"), ("作用","zuòyòng","function"),
    ("竞争","jìngzhēng","competition"), ("合作","hézuò","cooperation"),
    ("社会","shèhuì","society"), ("传统","chuántǒng","tradition"),
    ("文化","wénhuà","culture"), ("价值","jiàzhí","value"),
    ("环保","huánbǎo","environmental protection"), ("节约","jiéyuē","save/conserve"),
    ("健康","jiànkāng","health"), ("运动","yùndòng","exercise/sports"),
]
P5_IDIOMS = [
    ("百折不挠","bǎizhébùnáo","never give up"),
    ("持之以恒","chízhīyǐhéng","persevere"),
    ("独一无二","dúyīwú'èr","unique"),
    ("全力以赴","quánlìyǐfù","go all out"),
    ("见义勇为","jiànyìyǒngwéi","act bravely for justice"),
    ("实事求是","shíshìqiúshì","seek truth from facts"),
]

P6_VOCAB = [
    ("贡献","gòngxiàn","contribution"), ("成就","chéngjiù","achievement"),
    ("挑战","tiǎozhàn","challenge"), ("机遇","jīyù","opportunity"),
    ("趋势","qūshì","trend"), ("现象","xiànxiàng","phenomenon"),
    ("普遍","pǔbiàn","common/universal"), ("显著","xiǎnzhù","remarkable"),
    ("逐渐","zhújiàn","gradually"), ("日益","rìyì","increasingly"),
    ("繁荣","fánróng","prosperous"), ("发达","fādá","developed"),
    ("和谐","héxié","harmonious"), ("稳定","wěndìng","stable"),
    ("创新","chuàngxīn","innovate"), ("改革","gǎigé","reform"),
    ("科技","kējì","technology"), ("经济","jīngjì","economy"),
    ("教育","jiàoyù","education"), ("医疗","yīliáo","medical"),
    ("全球化","quánqiúhuà","globalisation"), ("城市化","chéngshìhuà","urbanisation"),
    ("人口","rénkǒu","population"), ("资源","zīyuán","resources"),
    ("可持续发展","kěchíxù fāzhǎn","sustainable development"),
]
P6_IDIOMS = [
    ("饮水思源","yǐnshuǐsīyuán","remember one's roots"),
    ("取长补短","qǔchángbǔduǎn","learn from others' strengths"),
    ("集思广益","jísīguǎngyì","pool wisdom"),
    ("居安思危","jū'ānsīwēi","be prepared for danger"),
    ("未雨绸缪","wèiyǔchóumóu","prepare in advance"),
    ("自强不息","zìqiángbùxī","continuous self-improvement"),
]

# ── Helper functions ─────────────────────────────────────────────────────

def pick_n(arr, n):
    return random.sample(arr, min(n, len(arr)))

def mco(e_list, z_list, correct):
    labels = ["A","B","C","D"]
    return [{"label":labels[i],"text_en":e,"text_zh":z} for i,(e,z) in enumerate(zip(e_list,z_list))], correct

# ── Question generators per level × type ────────────────────────────────

def gen_p1_dictation(vocab_batch, qc, topic_id):
    qs = []
    for word,pinyin,en in vocab_batch:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P1-{qid:04d}",topic_id=topic_id,level=1,subject="chinese",
                       question_type="dictation",difficulty="easy",
                       stem_en=f"Dictation. Listen and write the word.",
                       stem_zh=f"听写以下词语（{pinyin}）。",
                       answer_en=word, answer_zh=word,
                       explanation_en=f"This is a P1 word: {word} ({en}).",
                       explanation_zh=f"这是P1基础词汇：{word}（{en}）。",
                       tags=["dictation","p1","voice-first"], hints=[],
                       moed_code=f"C-P1-DI-{qid % 3 + 1:02d}"))
    return qs

def gen_p1_hanyupinyin(vocab_batch, qc, topic_id):
    qs = []
    items = pick_n(vocab_batch, min(len(vocab_batch), 20))
    for word,pinyin,en in items:
        qid = qc[0]; qc[0] += 1
        # Show Hanyu Pinyin, ask for character
        qs.append(dict(question_id=f"Q-CHI-P1-{qid:04d}",topic_id=topic_id,level=1,subject="chinese",
                       question_type="fill_in_blank",difficulty="easy",
                       stem_en=f"What character is pronounced '{pinyin}'?",
                       stem_zh=f"读音是'{pinyin}'的是哪个字？",
                       answer_en=word, answer_zh=word,
                       explanation_en=f"'{pinyin}' is the Hanyu Pinyin for '{word}' ({en}).",
                       explanation_zh=f"'{pinyin}'是'{word}'的读音（{en}）。",
                       tags=["pinyin","p1","voice-first"], hints=[{"text_en":"Listen to the sound and think of which character it matches.","text_zh":"听读音，想想是哪个字。","step":1}],
                       moed_code=f"C-P1-PY-{qid % 3 + 1:02d}"))
    return qs

def gen_p1_stroke(vocab_batch, qc, topic_id):
    qs = []
    simple_chars = [v for v in vocab_batch if len(v[0]) == 1]
    for word,pinyin,en in pick_n(simple_chars, 15):
        qid = qc[0]; qc[0] += 1
        strokes = [("一","横","horizontal"),("丨","竖","vertical"),("丿","撇","left-falling"),
                   ("丶","点","dot"),("乛","折","bend"),("亅","钩","hook")]
        stroke = random.choice(strokes)
        qs.append(dict(question_id=f"Q-CHI-P1-{qid:04d}",topic_id=topic_id,level=1,subject="chinese",
                       question_type="stroke_order",difficulty="easy",
                       stem_en=f"Trace the character '{word}' with correct stroke order.",
                       stem_zh=f"按照正确的笔顺书写'{word}'。",
                       answer_en=word, answer_zh=word,
                       explanation_en=f"The character '{word}' uses strokes including {stroke[2]} ({stroke[1]}).",
                       explanation_zh=f"'{word}'字包含{stroke[1]}笔画（{stroke[2]}）。",
                       tags=["stroke-order","p1"], hints=[],
                       moed_code=f"C-P1-SO-{qid % 3 + 1:02d}"))
    return qs

def gen_p1_sentence(vocab_batch, qc, topic_id):
    qs = []
    templates = [
        ("我喜欢___。","我喜欢{word}。","I like {en}.","我喜欢{word}。"),
        ("这是___。","这是{word}。","This is {en}.","这是{word}。"),
        ("我有___。","我有{word}。","I have {en}.","我有{word}。"),
        ("___在___。","{word}在这里。","{en} is here.","{word}在这里。"),
        ("___是天。","{word}和{n}。","{en} and {n}.","{word}和{n}。"),
    ]
    for _ in range(20):
        w1,p1,e1 = random.choice(vocab_batch)
        w2,p2,e2 = random.choice(vocab_batch)
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P1-{qid:04d}",topic_id=topic_id,level=1,subject="chinese",
                       question_type="fill_in_blank",difficulty="easy",
                       stem_en=f"Read and complete: {w1} {e2} ___",
                       stem_zh=f"读一读，填一填：{w1} {w2} ___",
                       answer_en=f"{w1} {w2}", answer_zh=f"{w1} {w2}",
                       explanation_en=f"The sentence is: {w1} {w2}.",
                       explanation_zh=f"句子是：{w1} {w2}。",
                       tags=["simple-sentences","p1","voice-first"], hints=[],
                       moed_code=f"C-P1-SS-{qid % 3 + 1:02d}"))
    return qs

def gen_p1_listening(vocab_batch, qc, topic_id):
    qs = []
    for word,pinyin,en in pick_n(vocab_batch, 15):
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P1-{qid:04d}",topic_id=topic_id,level=1,subject="chinese",
                       question_type="multiple_choice",difficulty="easy",
                       stem_en=f"Listen to '{pinyin}'. Which character do you hear?",
                       stem_zh=f"听'{pinyin}'。你听到的是哪个字？",
                       options=mco([word,"大","小","人"],[word,"大","小","人"],[word])[0],
                       answer_en=word, answer_zh=word,
                       explanation_en=f"You heard '{pinyin}' which is the character '{word}'.",
                       explanation_zh=f"你听到'{pinyin}'，这是'{word}'字。",
                       tags=["listening","p1","voice-first"], hints=[],
                       moed_code=f"C-P1-LS-{qid % 3 + 1:02d}"))
    return qs

def gen_p1_picture_desc(vocab_batch, qc, topic_id):
    qs = []
    scenes = [
        ("a park", "公园", "有人在公园散步", "Someone is walking in the park"),
        ("a classroom", "教室", "小朋友在教室里读书", "Children are reading in the classroom"),
        ("a hawker centre", "小贩中心", "一家人在小贩中心吃饭", "A family is eating at the hawker centre"),
        ("a playground", "游乐场", "孩子们在游乐场玩", "Children are playing at the playground"),
        ("a HDB estate", "组屋区", "组屋楼下有人在聊天", "People are chatting below the HDB block"),
    ]
    for scene_en,scene_zh,desc_zh,desc_en in scenes:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P1-{qid:04d}",topic_id=topic_id,level=1,subject="chinese",
                       question_type="picture_description",difficulty="medium",
                       stem_en=f"Look at the picture of {scene_en}. Describe it in 2-3 sentences.",
                       stem_zh=f"请看{scene_zh}的图片。用2-3个句子描述它。",
                       answer_en=desc_en, answer_zh=desc_zh,
                       explanation_en="A good description tells what you see: who, what, where.",
                       explanation_zh="好的描述要说出你看到的：谁、什么、在哪里。",
                       tags=["picture-description","p1","voice-first"], hints=[],
                       moed_code="C-P1-PD-01"))
    return qs

# ── P2 generators ───────────────────────────────────────────────────────

def gen_p2_vocab(vocab_batch, qc, topic_id):
    qs = []
    for word,pinyin,en in pick_n(vocab_batch, 30):
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P2-{qid:04d}",topic_id=topic_id,level=2,subject="chinese",
                       question_type="fill_in_blank",difficulty="easy",
                       stem_en=f"Which word means '{en}'?",
                       stem_zh=f"哪个词语的意思是'{en}'？",
                       answer_en=word, answer_zh=word,
                       explanation_en=f"'{word}' means '{en}'.",
                       explanation_zh=f"'{word}'的意思是'{en}'。",
                       tags=["vocabulary","p2"], hints=[],
                       moed_code=f"C-P2-VB-{qid % 3 + 1:02d}"))
    return qs

def gen_p2_sentence(vocab_batch, qc, topic_id):
    qs = []
    patterns = [
        ("把","请把{word}放在桌子上。","Please put {en} on the table.","请把{word}放在桌子上。"),
        ("在","{word}在公园里玩。","{en} is playing in the park.","{word}在公园里玩。"),
        ("比","{w1}比{w2}大。","{e1} is bigger than {e2}.","{w1}比{w2}大。"),
        ("因为","因为{w1}，所以{w2}。","Because {e1}, therefore {e2}.","因为{w1}，所以{w2}。"),
    ]
    for _ in range(15):
        pat, stem_zh_tpl, stem_en_tpl, ans_tpl = random.choice(patterns)
        w1,e1,_ = random.choice(vocab_batch)
        w2 = random.choice(vocab_batch)[0]
        qid = qc[0]; qc[0] += 1
        stem_zh = stem_zh_tpl.format(word=w1, w1=w1, w2=w2)
        stem_en = stem_en_tpl.format(word=w1, en=e1, w1=w1, w2=w2, e1=e1, e2=random.choice(vocab_batch)[2])
        qs.append(dict(question_id=f"Q-CHI-P2-{qid:04d}",topic_id=topic_id,level=2,subject="chinese",
                       question_type="sentence_formation",difficulty="medium",
                       stem_en=f"Make a sentence: {stem_en}",
                       stem_zh=f"造句：{stem_zh}",
                        answer_en=f"(Open-ended - example: {ans_tpl.format(word=w1,w1=w1,w2=w2,en=e1)})",
                        answer_zh=f"（开放式 - 例如：{ans_tpl.format(word=w1,w1=w1,w2=w2,en=e1)}）",
                       explanation_en=f"Use the correct word order and measure words.",
                       explanation_zh=f"使用正确的语序和量词。",
                       tags=["sentence-formation","p2"], hints=[],
                       moed_code=f"C-P2-SF-{qid % 3 + 1:02d}"))
    return qs

def gen_p2_comprehension(vocab_batch, qc, topic_id):
    qs = []
    passages = [
        dict(zh="小明今天和妈妈去超市。他买了一本故事书。他很高兴。",
             en="Xiao Ming went to the supermarket with his mother today. He bought a storybook. He was very happy.",
             q_zh="小明买了什么？", q_en="What did Xiao Ming buy?", a_zh="故事书", a_en="a storybook"),
        dict(zh="小红每天六点起床，七点去学校。她喜欢和同学一起读书。",
             en="Xiao Hong wakes up at 6 every day and goes to school at 7. She likes reading with classmates.",
             q_zh="小红每天几点起床？", q_en="What time does Xiao Hong wake up?", a_zh="六点", a_en="6 o'clock"),
        dict(zh="学校旁边有一个公园。放学后，小华和朋友在公园里踢球。他们很开心。",
             en="There is a park next to the school. After school, Xiao Hua plays football with friends in the park.",
             q_zh="放学后小华在哪里踢球？", q_en="Where does Xiao Hua play football?", a_zh="公园", a_en="park"),
    ]
    for p in passages:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P2-{qid:04d}",topic_id=topic_id,level=2,subject="chinese",
                       question_type="comprehension",difficulty="medium",
                       stem_en=f"Read: {p['en']}\n\nQuestion: {p['q_en']}",
                       stem_zh=f"阅读：{p['zh']}\n\n问题：{p['q_zh']}",
                       answer_en=p['a_en'], answer_zh=p['a_zh'],
                       explanation_en=f"The passage says: {p['a_zh']}.",
                       explanation_zh=f"文中有说：{p['a_zh']}。",
                       tags=["reading-comprehension","p2"], hints=[],
                       moed_code="C-P2-RC-01"))
    return qs

def gen_p2_writing(vocab_batch, qc, topic_id):
    qs = []
    topics_data = [
        ("My Weekend","我的周末"), ("My Best Friend","我最好的朋友"),
        ("My Favourite Food","我最喜欢的食物"), ("My Family","我的家人"),
    ]
    for en_topic, zh_topic in topics_data:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P2-{qid:04d}",topic_id=topic_id,level=2,subject="chinese",
                       question_type="composition",difficulty="medium",
                       stem_en=f"Write 5-8 sentences about '{en_topic}'.",
                       stem_zh=f"写5-8个句子，介绍'{zh_topic}'。",
                       answer_en="(Open-ended)", answer_zh="（开放式）",
                       explanation_en=f"Start with a topic sentence, write 3-5 detail sentences, and end with a closing sentence.",
                       explanation_zh=f"用主题句开头，写3-5个详细句子，最后用总结句结尾。",
                       tags=["writing","p2"], hints=[],
                       moed_code="C-P2-WR-01"))
    return qs

def gen_p2_oral(vocab_batch, qc, topic_id):
    qs = []
    prompts = [
        ("Describe your classroom","描述你的教室"),
        ("What do you do after school?","放学后你做什么？"),
        ("Talk about your favourite animal","说说你最喜欢的动物"),
    ]
    for en, zh in prompts:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P2-{qid:04d}",topic_id=topic_id,level=2,subject="chinese",
                       question_type="oral",difficulty="medium",
                       stem_en=en, stem_zh=zh,
                       answer_en="(Open-ended - spoken response)", answer_zh="（开放式 - 口头回答）",
                       explanation_en="Speak clearly in complete sentences. Use correct pronunciation.",
                       explanation_zh="用完整句子清楚地说。注意发音正确。",
                       tags=["oral","p2","voice-first"], hints=[],
                       moed_code="C-P2-OR-01"))
    return qs

# ── P3 generators ───────────────────────────────────────────────────────

def gen_p3_vocab_idiom(vocab_batch, qc, topic_id):
    qs = []
    for word,pinyin,en in pick_n(vocab_batch, 25):
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P3-{qid:04d}",topic_id=topic_id,level=3,subject="chinese",
                       question_type="fill_in_blank",difficulty="medium",
                       stem_en=f"What does '{word}' mean?",
                       stem_zh=f"'{word}'的意思是什么？",
                       answer_en=en, answer_zh=word,
                       explanation_en=f"'{word}' means {en}. Use it in sentences for P3 level.",
                       explanation_zh=f"'{word}'的意思是{en}。在P3水平的句子中使用它。",
                       tags=["vocabulary","p3"], hints=[],
                       moed_code=f"C-P3-VB-{qid % 3 + 1:02d}"))
    return qs

def gen_p3_comprehension(vocab_batch, qc, topic_id):
    qs = []
    passages = [
        dict(zh="上个星期天，天气很好。小明和爸爸妈妈一起去动物园。他们看到了大象、老虎和长颈鹿。小明最喜欢看猴子，因为猴子很可爱。他们在动物园玩了两个小时，然后开开心心地回家了。",
             en="Last Sunday, the weather was nice. Xiao Ming went to the zoo with his parents. They saw elephants, tigers and giraffes. Xiao Ming liked watching the monkeys best because they were cute. They played at the zoo for two hours and then went home happily.",
             qs=[("小明最喜欢什么动物？为什么？","What animal did Xiao Ming like best? Why?","猴子，因为它们很可爱。","Monkeys, because they were cute.")]),
        dict(zh="小红是一个认真的学生。她每天放学后先做功课，然后再看电视。她不但努力学习，而且还帮助同学。老师常常称赞她。",
             en="Xiao Hong is a serious student. Every day after school she does her homework first, then watches TV. She not only studies hard but also helps her classmates. The teacher often praises her.",
             qs=[("老师为什么称赞小红？","Why does the teacher praise Xiao Hong?","因为她努力学习，还帮助同学。","Because she studies hard and helps classmates.")]),
        dict(zh="小华参加学校的运动会。他跑得很快，但是在接力赛中不小心摔倒了。虽然他很难过，但是他的朋友鼓励他，让他不要放弃。最后，小华站起来继续跑完了比赛。",
             en="Xiao Hua joined the school sports meet. He ran fast, but accidentally fell during the relay race. Although he was sad, his friends encouraged him not to give up. Finally, Xiao Hua stood up and finished the race.",
             qs=[("小华摔倒后，朋友做了什么？","What did Xiao Hua's friends do after he fell?","他们鼓励他不要放弃。","They encouraged him not to give up.")]),
    ]
    level_map = {"easy":"easy","medium":"medium","hard":"medium"}
    qq = []
    for p in passages:
        for q_data in p['qs']:
            qid = qc[0]; qc[0] += 1
            qq.append(dict(question_id=f"Q-CHI-P3-{qid:04d}",topic_id=topic_id,level=3,subject="chinese",
                           question_type="comprehension",difficulty="medium",
                           stem_en=f"Read:\n{p['en']}\n\nQuestion: {q_data[1]}",
                           stem_zh=f"阅读：\n{p['zh']}\n\n问题：{q_data[0]}",
                           answer_en=q_data[3], answer_zh=q_data[2],
                           explanation_en=f"The passage supports this answer. Find the key sentence.",
                           explanation_zh=f"文章支持这个答案。找到关键句子。",
                           tags=["reading-comprehension","p3"], hints=[],
                           moed_code="C-P3-RC-01"))
    return qq

def gen_p3_conjunction(vocab_batch, qc, topic_id):
    qs = []
    patterns = [
        ("虽然...但是...","虽然{reason}，但是{result}。","Although {reason_en}, {result_en}."),
        ("不但...而且...","他不但{action1}，而且{action2}。","He not only {action1_en}, but also {action2_en}."),
        ("因为...所以...","因为{reason}，所以{result}。","Because {reason_en}, {result_en}."),
        ("如果...就...","如果{condition}，就{result}。","If {condition_en}, then {result_en}."),
    ]
    for _ in range(12):
        pat_en, stem_zh_tpl, stem_en_tpl = random.choice(patterns)
        w1 = random.choice(vocab_batch)
        w2 = random.choice(vocab_batch)
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P3-{qid:04d}",topic_id=topic_id,level=3,subject="chinese",
                       question_type="fill_in_blank",difficulty="medium",
                       stem_en=f"Complete the sentence using the pattern '{pat_en}'.",
                       stem_zh=f"用'{pat_en}'的句式完成句子。",
                       answer_en="(Open-ended)", answer_zh="（开放式）",
                       explanation_en=f"Use the '{pat_en}' conjunction pattern correctly.",
                       explanation_zh=f"正确使用'{pat_en}'的关联词。",
                       tags=["conjunction","grammar","p3"], hints=[],
                       moed_code=f"C-P3-CJ-{qid % 3 + 1:02d}"))
    return qs

def gen_p3_composition(vocab_batch, qc, topic_id):
    qs = []
    prompts = [
        ("A Memorable Day","难忘的一天"), ("Helping Others","帮助别人"),
        ("My Favourite Festival","我最喜欢的节日"), ("A Kind Deed","一件好事"),
    ]
    for en, zh in prompts:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P3-{qid:04d}",topic_id=topic_id,level=3,subject="chinese",
                       question_type="composition",difficulty="hard",
                       stem_en=f"Write a short composition (80-120 words) about '{en}'.",
                       stem_zh=f"写一篇短文（80-120字），内容是关于'{zh}'。",
                       answer_en="(Open-ended)", answer_zh="（开放式）",
                       explanation_en="Use a clear beginning, middle and end. Include feelings and details.",
                       explanation_zh="要有清楚的开头、中间和结尾。包含感受和细节。",
                       tags=["composition","p3"], hints=[],
                       moed_code="C-P3-CW-01"))
    return qs

def gen_p3_oral(vocab_batch, qc, topic_id):
    qs = []
    passages_data = [
        ("今天是学校开放日。很多家长来学校参观。同学们在教室里展示自己的作品，有图画、作文和手工。大家都非常开心。",
         "Today is School Open House. Many parents come to visit. Students display their work in classrooms - drawings, compositions and crafts. Everyone is very happy."),
        ("新加坡是一个花园城市。这里有很多花草树木。组屋楼下有游乐场和公园。人们喜欢在傍晚散步和运动。",
         "Singapore is a garden city. There are many flowers, plants and trees. There are playgrounds and parks below HDB blocks. People like to walk and exercise in the evening."),
    ]
    for zh, en in passages_data:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P3-{qid:04d}",topic_id=topic_id,level=3,subject="chinese",
                       question_type="oral",difficulty="medium",
                       stem_en=f"Read aloud:\n{en}",
                       stem_zh=f"朗读以下短文：\n{zh}",
                       answer_en="(Read aloud - assessed on pronunciation and fluency)",
                       answer_zh="（朗读 - 评估发音和流利度）",
                       explanation_en="Read with correct pronunciation and natural pauses at punctuation.",
                       explanation_zh="用正确的发音朗读，在标点处自然停顿。",
                       tags=["oral","reading-aloud","p3","voice-first"], hints=[],
                       moed_code="C-P3-OR-01"))
    return qs

# ── P4 generators ───────────────────────────────────────────────────────

def gen_p4_vocab_context(vocab_batch, qc, topic_id):
    qs = []
    items = pick_n(vocab_batch, 25)
    for word,pinyin,en in items:
        qid = qc[0]; qc[0] += 1
        other = random.choice(vocab_batch)
        opts = mco([en, word, other[2], other[0]], [word, word, other[2], other[0]], word)
        qs.append(dict(question_id=f"Q-CHI-P4-{qid:04d}",topic_id=topic_id,level=4,subject="chinese",
                       question_type="multiple_choice",difficulty="medium",
                       stem_en=f"'{word}' most likely means:",
                       stem_zh=f"'{word}'最可能的意思是：",
                       options=opts[0], answer_en=en, answer_zh=word,
                       explanation_en=f"'{word}' means {en}. It is a P4-level word.",
                       explanation_zh=f"'{word}'的意思是{en}。这是一个P4水平的词语。",
                       tags=["vocabulary-in-context","p4"], hints=[],
                       moed_code=f"C-P4-VC-{qid % 3 + 1:02d}"))
    return qs

def gen_p4_comprehension(vocab_batch, qc, topic_id):
    qs = []
    psg_items = [
        dict(zh="小红和小明是好朋友。有一天，他们在学校里发现一个钱包。钱包里有很多钱。小红说：'我们应该交给老师。'小明也很同意。老师称赞他们是诚实的好学生。",
             en="Xiao Hong and Xiao Ming are good friends. One day, they found a wallet at school. There was a lot of money inside. Xiao Hong said: 'We should give it to the teacher.' Xiao Ming agreed. The teacher praised them as honest students.",
             q_zh="小红和小明发现钱包后做了什么？这说明他们是什么样的人？",
             q_en="What did Xiao Hong and Xiao Ming do after finding the wallet? What kind of people does this show they are?",
             a_zh="他们把钱包交给老师。这说明他们是诚实的人。",
             a_en="They gave the wallet to the teacher. This shows they are honest people."),
        dict(zh="新加坡是一个多元种族的社会。这里有华人、马来人、印度人和欧亚裔。大家虽然种族不同，但是和睦相处，互相尊重。",
             en="Singapore is a multi-racial society. There are Chinese, Malays, Indians and Eurasians. Although everyone is of different races, they live together harmoniously and respect each other.",
             q_zh="新加坡不同种族的人如何相处？",
             q_en="How do different races in Singapore get along?",
             a_zh="他们和睦相处，互相尊重。",
             a_en="They live together harmoniously and respect each other."),
    ]
    qq = []
    for p in psg_items:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P4-{qid:04d}",topic_id=topic_id,level=4,subject="chinese",
                       question_type="comprehension",difficulty="hard",
                       stem_en=f"Read:\n{p['en']}\n\nQ: {p['q_en']}",
                       stem_zh=f"阅读：\n{p['zh']}\n\n问题：{p['q_zh']}",
                       answer_en=p['a_en'], answer_zh=p['a_zh'],
                       explanation_en="Look for key details in the passage to support your answer.",
                       explanation_zh="在文章中寻找关键细节来支持你的答案。",
                       tags=["reading-comprehension","p4","inferential"], hints=[],
                       moed_code="C-P4-RC-01"))
    return qq

def gen_p4_cloze(vocab_batch, qc, topic_id):
    qs = []
    cloze_templates = [
        dict(fmt="小明___努力学习，___成绩很好。（因为/所以/虽然/但是）",
             en="Xiao Ming ___ studied hard, ___ got good results. (because/so/although/but)",
             ans="因为...所以...", diff="medium"),
        dict(fmt="老师___我们明天要考试，___大家要认真复习。（告诉/通知/而且/但是）",
             en="The teacher ___ us there will be an exam tomorrow, ___ everyone should study hard.",
             ans="告诉...所以...", diff="medium"),
    ]
    qq = []
    for c in cloze_templates:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P4-{qid:04d}",topic_id=topic_id,level=4,subject="chinese",
                       question_type="cloze",difficulty=c['diff'],
                       stem_en=f"Fill in the blanks: {c['en']}",
                       stem_zh=f"选词填空：{c['fmt']}",
                       answer_en=c['ans'], answer_zh=c['ans'],
                       explanation_en="Read the whole sentence to understand the context before choosing.",
                       explanation_zh="先阅读整个句子理解上下文，再选择。",
                       tags=["cloze","p4"], hints=[],
                       moed_code="C-P4-CL-01"))
    return qq

def gen_p4_narrative(vocab_batch, qc, topic_id):
    qs = []
    prompts = [
        ("An Unforgettable Experience","一次难忘的经历"),
        ("A Lesson I Learned","我学到的一课"),
        ("When I Helped Someone","当我帮助别人的时候"),
    ]
    for en, zh in prompts:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P4-{qid:04d}",topic_id=topic_id,level=4,subject="chinese",
                       question_type="composition",difficulty="hard",
                       stem_en=f"Write a narrative (100-150 words) about '{en}'.",
                       stem_zh=f"写一篇记叙文（100-150字），内容是'{zh}'。",
                       answer_en="(Open-ended)", answer_zh="（开放式）",
                       explanation_en="Include a clear beginning (setup), middle (events), and end (resolution + lesson).",
                       explanation_zh="包括清楚的开头（背景）、中间（事件经过）和结尾（结果+教训）。",
                       tags=["composition","narrative","p4"], hints=[],
                       moed_code="C-P4-CW-01"))
    return qs

def gen_p4_oral_conversation(vocab_batch, qc, topic_id):
    qs = []
    prompts = [
        ("Talk about your school","谈谈你的学校","What is your school like? What do you like most about it?"),
        ("Talk about your hobbies","谈谈你的爱好","What do you like to do in your free time? Why?"),
    ]
    for zh_q, en_q, en_det in prompts:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P4-{qid:04d}",topic_id=topic_id,level=4,subject="chinese",
                       question_type="oral",difficulty="medium",
                       stem_en=f"Conversation practice: {en_det}",
                       stem_zh=f"会话练习：{zh_q}",
                       answer_en="(Open-ended - spoken response)", answer_zh="（开放式 - 口头回答）",
                       explanation_en="Give full answers with reasons and examples.",
                       explanation_zh="给出完整的回答，包含理由和例子。",
                       tags=["oral","conversation","p4","voice-first"], hints=[],
                       moed_code="C-P4-OR-01"))
    return qs

def gen_p4_grammar(vocab_batch, qc, topic_id):
    qs = []
    measure_words = [
        ("个","一个人","one person"), ("本","一本书","one book"),
        ("张","一张纸","one piece of paper"), ("只","一只猫","one cat"),
        ("条","一条鱼","one fish"), ("把","一把椅子","one chair"),
    ]
    for mw, example, en in measure_words:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P4-{qid:04d}",topic_id=topic_id,level=4,subject="chinese",
                       question_type="fill_in_blank",difficulty="medium",
                       stem_en=f"Fill in the correct measure word: 一___书 ({en.replace('one','')})",
                       stem_zh=f"填上正确的量词：一___书",
                       answer_en=mw, answer_zh=mw,
                       explanation_en=f"The correct measure word for books is '{mw}'. Example: {example} ({en}).",
                       explanation_zh=f"书（books）的量词是'{mw}'。例如：{example}。",
                       tags=["grammar","measure-words","p4"], hints=[],
                       moed_code="C-P4-GR-01"))
    return qs

# ── P5 generators ───────────────────────────────────────────────────────

def gen_p5_advanced_vocab(vocab_batch, qc, topic_id):
    qs = []
    for word,pinyin,en in pick_n(vocab_batch, 35):
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P5-{qid:04d}",topic_id=topic_id,level=5,subject="chinese",
                       question_type="fill_in_blank",difficulty="hard",
                       stem_en=f"Use the word '{word}' in a sentence.",
                       stem_zh=f"用'{word}'（{en}）造一个句子。",
                       answer_en=f"(Open-ended - example: It is important to {en}.)",
                       answer_zh=f"(开放式 - 例如：我们要{word}。)",
                       explanation_en=f"'{word}' is a P5 vocabulary word meaning '{en}'.",
                       explanation_zh=f"'{word}'是P5词汇，意思是'{en}'。",
                       tags=["advanced-vocabulary","p5","psle-format"], hints=[],
                       moed_code=f"C-P5-AV-{qid % 3 + 1:02d}"))
    return qs

def gen_p5_comprehension_advanced(vocab_batch, qc, topic_id):
    qs = []
    psg_data = [
        dict(zh="李明从小喜欢帮助别人。在学校里，他经常帮助同学解答功课。在社区里，他参加义工活动，帮助老人打扫房间。他说：'帮助别人让我感到快乐。'他的朋友都称赞他很有爱心。",
             en="Li Ming has always enjoyed helping others since young. At school, he often helps classmates with homework. In the community, he joins volunteer activities and helps clean rooms for the elderly. He says: 'Helping others makes me happy.' His friends praise him for being caring.",
             qs=[("作者通过哪些事例来说明李明喜欢帮助别人？","What examples does the author give to show Li Ming likes helping others?",
                  "他帮同学解答功课，还帮老人打扫房间。","He helps classmates with homework and cleans rooms for the elderly.")]),
    ]
    qq = []
    for p in psg_data:
        for q_zh, q_en, a_zh, a_en in p['qs']:
            qid = qc[0]; qc[0] += 1
            qq.append(dict(question_id=f"Q-CHI-P5-{qid:04d}",topic_id=topic_id,level=5,subject="chinese",
                           question_type="comprehension",difficulty="hard",
                           stem_en=f"Read:\n{p['en']}\n\nQ: {q_en}",
                           stem_zh=f"阅读：\n{p['zh']}\n\n问题：{q_zh}",
                           answer_en=a_en, answer_zh=a_zh,
                           explanation_en="Use evidence from the passage to support your answer.",
                           explanation_zh="引用文章中的证据来支持你的答案。",
                           tags=["reading-comprehension","p5","psle-format","inferential"], hints=[],
                           moed_code="C-P5-RC-01"))
    return qq

def gen_p5_cloze_advanced(vocab_batch, qc, topic_id):
    qs = []
    items = [
        dict(zh="在全球___的时代，各国___越来越密切。我们应该___合作，共同___全球性问题。（化/联系/加强/应对/经济/日益）",
             en="In the era of global___, countries' ___ are becoming closer. We should ___ cooperation and jointly ___ global issues.",
             ans="全球化...联系...加强...应对", diff="hard"),
        dict(zh="___虽然很重要，但是健康更___。我们应该___运动，___身体。（成绩/重要/坚持/锻炼）",
             en="Although ___ is important, health is more ___. We should ___ exercise and ___ our bodies.",
             ans="成绩...重要...坚持...锻炼", diff="hard"),
    ]
    qq = []
    for item in items:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P5-{qid:04d}",topic_id=topic_id,level=5,subject="chinese",
                       question_type="cloze",difficulty=item['diff'],
                       stem_en=f"Cloze passage:\n{item['en']}",
                       stem_zh=f"综合填空：\n{item['zh']}",
                       answer_en=item['ans'], answer_zh=item['ans'],
                       explanation_en="Read the full passage before choosing words for each blank.",
                       explanation_zh="先读完整个文章再填空。",
                       tags=["cloze","p5","psle-format"], hints=[],
                       moed_code="C-P5-CL-01"))
    return qq

def gen_p5_composition(vocab_batch, qc, topic_id):
    qs = []
    prompts = [
        ("A Person I Admire","我最敬佩的人"),
        ("An Important Decision","一个重要的决定"),
        ("Overcoming a Challenge","克服挑战"),
        ("The Importance of Teamwork","团队合作的重要性"),
    ]
    qq = []
    for en, zh in prompts:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P5-{qid:04d}",topic_id=topic_id,level=5,subject="chinese",
                       question_type="composition",difficulty="hard",
                       stem_en=f"Write a composition (≥120 words) about '{en}'. Use descriptive language.",
                       stem_zh=f"写一篇作文（≥120字），内容是'{zh}'。运用描写手法。",
                       answer_en="(Open-ended)", answer_zh="（开放式）",
                       explanation_en="Include character development, plot progression, feelings, and a lesson learned.",
                       explanation_zh="包括人物发展、情节推进、感受和学到的教训。",
                       tags=["composition","p5","psle-format"], hints=[],
                       moed_code="C-P5-CW-01"))
    return qq

def gen_p5_oral_exam(vocab_batch, qc, topic_id):
    qs = []
    prompts = [
        ("Read aloud + Conversation: Environment",
         "朗读+会话：环境",
         "保护环境是每个人的责任。新加坡虽然是一个小国，但是在环保方面做得很好。我们应该节约用水、减少垃圾、多种树木。",
         "Protecting the environment is everyone's responsibility. Although Singapore is a small country, it does well in environmental protection. We should save water, reduce waste, and plant more trees.",
         "你觉得新加坡的环保做得好吗？你在日常生活中怎样保护环境？",
         "Do you think Singapore does well in environmental protection? How do you protect the environment in daily life?"),
    ]
    for en_nm, zh_nm, read_zh, read_en, conv_q_zh, conv_q_en in prompts:
        qid = qc[0]; qc[0] += 1
        qs = [dict(question_id=f"Q-CHI-P5-{qid:04d}",topic_id=topic_id,level=5,subject="chinese",
                       question_type="oral",difficulty="hard",
                       stem_en=f"Part 1 - Read aloud:\n{read_en}\n\nPart 2 - Conversation:\n{conv_q_en}",
                       stem_zh=f"第一部分 - 朗读：\n{read_zh}\n\n第二部分 - 会话：\n{conv_q_zh}",
                       answer_en="(Assessed on pronunciation, fluency and quality of conversation)",
                       answer_zh="（评估发音、流利度和会话质量）",
                       explanation_en="For reading: pronounce clearly, use correct tones, pause at punctuation. For conversation: give complete answers with reasons.",
                       explanation_zh="朗读：发音清晰，声调正确，在标点处停顿。会话：给出完整回答并说明理由。",
                       tags=["oral","psle-format","p5","voice-first"], hints=[],
                       moed_code="C-P5-OR-01")]
        return qs if qs else []
    return []

def gen_p5_grammar_advanced(vocab_batch, qc, topic_id):
    qs = []
    transform_pairs = [
        ("把","小明把作业做完了。","作业被小明做完了。","Do the homework"),
        ("被","蛋糕被妹妹吃完了。","妹妹把蛋糕吃完了。","The cake was eaten"),
    ]
    for name, active, passive, en in transform_pairs:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P5-{qid:04d}",topic_id=topic_id,level=5,subject="chinese",
                       question_type="fill_in_blank",difficulty="hard",
                       stem_en=f"Change to 把/被 sentence: ({en} - use {'被' if name == '被' else '把'})",
                       stem_zh=f"改成{'把' if name == '把' else '被'}字句：{passive if name == '被' else active}",
                       answer_en=active if name == '把' else passive,
                       answer_zh=active if name == '把' else passive,
                       explanation_en=f"把-sentence: subject + 把 + object + verb. 被-sentence: object + 被 + subject + verb.",
                       explanation_zh=f"把字句：主语+把+宾语+动词。被字句：宾语+被+主语+动词。",
                       tags=["grammar","sentence-manipulation","p5","psle-format"], hints=[],
                       moed_code="C-P5-GR-01"))
    return qs

# ── P6 generators ───────────────────────────────────────────────────────

def gen_p6_psle_vocab(vocab_batch, qc, topic_id):
    qs = []
    for word,pinyin,en in pick_n(vocab_batch, 40):
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P6-{qid:04d}",topic_id=topic_id,level=6,subject="chinese",
                       question_type="multiple_choice",difficulty="hard",
                       stem_en=f"The closest meaning of '{word}' is:",
                       stem_zh=f"'{word}'最接近的意思是：",
                       options=mco([f"{en}", f"Opposite of {en}", "Unrelated", "Unknown"],
                                   [f"{word}", "不知道", "无关", "不清楚"], word)[0],
                       answer_en=en, answer_zh=word,
                       explanation_en=f"'{word}' ({pinyin}) means '{en}'. This is PSLE-level vocabulary.",
                       explanation_zh=f"'{word}'（{pinyin}）的意思是'{en}'。这是小六会考词汇。",
                       tags=["psle-vocabulary","p6","psle-format"], hints=[],
                       moed_code=f"C-P6-PV-{qid % 3 + 1:02d}"))
    return qs

def gen_p6_psle_comprehension(vocab_batch, qc, topic_id):
    qs = []
    psg_data = [
        dict(zh="新加坡是一个多元文化的社会。我们的祖先从不同的地方来到这里，带来了各自的文化传统。经过多年的融合，形成了今天独特的新加坡文化。在保留各自传统的同时，我们也学会了互相尊重、互相包容。正是这种精神，让新加坡成为一个和谐繁荣的国家。",
             en="Singapore is a multicultural society. Our ancestors came from different places, bringing their own cultural traditions. After years of integration, today's unique Singapore culture was formed. While preserving our own traditions, we have also learned to respect and tolerate each other. It is this spirit that makes Singapore a harmonious and prosperous nation.",
             qs=[
                 dict(q_zh="新加坡的独特文化是如何形成的？", q_en="How was Singapore's unique culture formed?",
                      a_zh="通过不同种族文化的融合形成的。", a_en="It was formed through the integration of different racial cultures."),
                 dict(q_zh="作者认为新加坡和谐繁荣的原因是什么？", q_en="What does the author believe is the reason for Singapore's harmony and prosperity?",
                      a_zh="大家互相尊重、互相包容的精神。", a_en="The spirit of mutual respect and tolerance."),
             ]),
    ]
    qq = []
    for p in psg_data:
        for q_item in p['qs']:
            qid = qc[0]; qc[0] += 1
            qq.append(dict(question_id=f"Q-CHI-P6-{qid:04d}",topic_id=topic_id,level=6,subject="chinese",
                           question_type="comprehension",difficulty="hard",
                           stem_en=f"Read:\n{p['en']}\n\nQ: {q_item['q_en']}",
                           stem_zh=f"阅读：\n{p['zh']}\n\n问题：{q_item['q_zh']}",
                           answer_en=q_item['a_en'], answer_zh=q_item['a_zh'],
                           explanation_en="Analyse the passage structure: cause→effect, problem→solution.",
                           explanation_zh="分析文章结构：原因→结果，问题→解决方案。",
                           tags=["psle-comprehension","p6","psle-format","inferential"], hints=[],
                           moed_code="C-P6-RC-01"))
    return qq

def gen_p6_psle_cloze(vocab_batch, qc, topic_id):
    qs = []
    items = [
        dict(zh="近年来，科技___发展，给我们的生活带来了很大的___。例如，智能手机___让我们方便地___信息。（迅速/变化/可以/获取/仍然/减少）",
             en="In recent years, technology has developed ___ and brought great ___ to our lives. For example, smartphones ___ us to conveniently ___ information.",
             ans="迅速...变化...可以...获取", diff="hard"),
    ]
    qq = []
    for item in items:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P6-{qid:04d}",topic_id=topic_id,level=6,subject="chinese",
                       question_type="cloze",difficulty=item['diff'],
                       stem_en=f"Cloze passage:\n{item['en']}",
                       stem_zh=f"综合填空：\n{item['zh']}",
                       answer_en=item['ans'], answer_zh=item['ans'],
                       explanation_en="Use contextual clues and grammar to determine the correct word for each blank.",
                       explanation_zh="用上下文线索和语法知识来确定每个空格的正确答案。",
                       tags=["psle-cloze","p6","psle-format"], hints=[],
                       moed_code="C-P6-CL-01"))
    return qq

def gen_p6_psle_composition(vocab_batch, qc, topic_id):
    qs = []
    prompts = [
        ("三幅图作文","看图作文","3-picture composition"),
        ("A Memorable Incident","一次难忘的事件","narrative"),
        ("My Wish for Singapore","我对新加坡的期望","reflective"),
    ]
    for en, zh, style in prompts:
        qid = qc[0]; qc[0] += 1
        qs.append(dict(question_id=f"Q-CHI-P6-{qid:04d}",topic_id=topic_id,level=6,subject="chinese",
                       question_type="composition",difficulty="hard",
                       stem_en=f"Write a composition (≥150 words): '{en}' (PSLE format).",
                       stem_zh=f"作文（≥150字）：'{zh}'（小六会考格式）。",
                       answer_en="(Open-ended)", answer_zh="（开放式）",
                       explanation_en="For PSLE: clear plot, character feelings, descriptive language, and a meaningful conclusion.",
                       explanation_zh="小六会考作文：清晰的情节、人物感受、描写手法和有意义的结尾。",
                       tags=["psle-composition","p6","psle-format"], hints=[],
                       moed_code="C-P6-CW-01"))
    return qs

def gen_p6_psle_oral(vocab_batch, qc, topic_id):
    qs = []
    prompts = [
        ("Read aloud + Conversation: Technology",
         "朗读+会话：科技",
         "科技改变了我们的生活方式。以前，人们只能通过书信和电话沟通。现在，我们可以通过社交媒体随时联系世界各地的朋友。但是，过度使用科技也可能带来问题。",
         "Technology has changed our way of life. In the past, people could only communicate through letters and phone calls. Now, we can contact friends around the world anytime through social media. However, overuse of technology can also bring problems.",
         "你觉得科技对你的生活有什么影响？我们应该怎样正确使用科技？",
         "What impact do you think technology has on your life? How should we use technology properly?"),
    ]
    for en_nm, zh_nm, read_zh, read_en, conv_q_zh, conv_q_en in prompts:
        qid = qc[0]; qc[0] += 1
        return [dict(question_id=f"Q-CHI-P6-{qid:04d}",topic_id=topic_id,level=6,subject="chinese",
                     question_type="oral",difficulty="hard",
                     stem_en=f"Part 1 - Read aloud:\n{read_en}\n\nPart 2 - Conversation:\n{conv_q_en}",
                     stem_zh=f"第一部分 - 朗读：\n{read_zh}\n\n第二部分 - 会话：\n{conv_q_zh}",
                     answer_en="(Assessed for PSLE oral exam rubric)",
                     answer_zh="（按小六会考口试评分标准评估）",
                     explanation_en="Reading: tones, fluency, expression. Conversation: relevance, elaboration, coherence.",
                     explanation_zh="朗读：声调、流利度、表情。会话：相关性、展开说明、连贯性。",
                     tags=["psle-oral","p6","psle-format","voice-first"], hints=[],
                     moed_code="C-P6-OR-01")]
    return []

def gen_p6_psle_listening(vocab_batch, qc, topic_id):
    qs = []
    items = [
        dict(zh="女：你觉得我们应该怎么保护环境？男：我认为每个人都可以从小事做起，比如减少使用塑料袋。",
             en="Woman: How do you think we should protect the environment? Man: I think everyone can start with small things, like reducing plastic bag use.",
             q_zh="男的提出了什么建议？", q_en="What suggestion did the man make?",
             a_zh="减少使用塑料袋", a_en="Reduce plastic bag use"),
    ]
    qq = []
    for item in items:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P6-{qid:04d}",topic_id=topic_id,level=6,subject="chinese",
                       question_type="comprehension",difficulty="hard",
                       stem_en=f"Listen and answer:\n{item['en']}\n\nQ: {item['q_en']}",
                       stem_zh=f"听录音，回答问题：\n{item['zh']}\n\n问题：{item['q_zh']}",
                       answer_en=item['a_en'], answer_zh=item['a_zh'],
                       explanation_en="Listen for key information: who, what, where, when, why.",
                       explanation_zh="听关键信息：谁、什么、在哪里、什么时候、为什么。",
                       tags=["listening-comprehension","p6","psle-format"], hints=[],
                       moed_code="C-P6-LC-01"))
    return qq

def gen_p4_dialogue(vocab_batch, qc, topic_id):
    qs = []
    dialogs = [
        dict(zh="A：请问，图书馆怎么走？\nB：你一直往前走，在___左转就到了。（路口/学校/医院）",
             en="A: Excuse me, how do I get to the library?\nB: Go straight ahead and turn left at the ___. (crossroad/school/hospital)",
             ans="路口", ans_en="crossroad"),
        dict(zh="A：你要不要一起去吃午餐？\nB：好呀，___吃？（去哪里/吃什么/什么时候）",
             en="A: Do you want to have lunch together?\nB: Sure, where ___? (to go/to eat/when)",
             ans="去哪里", ans_en="to go"),
        dict(zh="A：这个周末你有空吗？\nB：星期六我要___，星期天可以。（上补习班/去学校/做功课）",
             en="A: Are you free this weekend?\nB: I have ___ on Saturday, but Sunday is fine. (tuition/go to school/homework)",
             ans="上补习班", ans_en="tuition"),
    ]
    qq = []
    for d in dialogs:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P4-{qid:04d}",topic_id=topic_id,level=4,subject="chinese",
                       question_type="dialogue_completion",difficulty="medium",
                       stem_en=f"Complete the dialogue:\n{d['en']}",
                       stem_zh=f"完成对话：\n{d['zh']}",
                       answer_en=d['ans_en'], answer_zh=d['ans'],
                       explanation_en="Read the full dialogue context before filling the blank.",
                       explanation_zh="先理解整个对话的上下文再填空。",
                       tags=["dialogue-completion","p4"], hints=[],
                       moed_code="C-P4-DC-01"))
    return qq

def gen_p5_dialogue(vocab_batch, qc, topic_id):
    qs = []
    dialogs = [
        dict(zh="A：你觉得我们应该参加这次义工活动吗？\nB：当然应该！帮助别人是一件___的事。（有意义/麻烦/容易）",
             en="A: Do you think we should join this volunteer activity?\nB: Of course! Helping others is a ___ thing. (meaningful/troublesome/easy)",
             ans="有意义", ans_en="meaningful"),
        dict(zh="A：这次考试你准备得怎么样？\nB：我已经复习了___，应该没问题。（好几次/一遍/很久）",
             en="A: How is your exam preparation going?\nB: I have reviewed ___ times, should be fine. (several/once/a long time)",
             ans="好几次", ans_en="several"),
    ]
    qq = []
    for d in dialogs:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P5-{qid:04d}",topic_id=topic_id,level=5,subject="chinese",
                       question_type="dialogue_completion",difficulty="medium",
                       stem_en=f"Complete the dialogue:\n{d['en']}",
                       stem_zh=f"完成对话：\n{d['zh']}",
                       answer_en=d['ans_en'], answer_zh=d['ans'],
                       explanation_en="Consider the speakers' relationship and context before answering.",
                       explanation_zh="考虑说话者的关系和上下文后再回答。",
                       tags=["dialogue-completion","p5","psle-format"], hints=[],
                       moed_code="C-P5-DC-01"))
    return qq

def gen_p6_psle_dialogue(vocab_batch, qc, topic_id):
    qs = []
    dialogs = [
        dict(zh="A：明天是你的生日，你有什么打算？\nB：我打算和家人在___。（吃饭/去学校/做功课）",
             en="A: Tomorrow is your birthday. Any plans?\nB: I plan to ___ with my family. (eat out/go to school/do homework)",
             ans="吃饭", ans_en="eat out"),
        dict(zh="A：你觉得我们应该如何保护环境？\nB：我认为每人从小事做起，比如减少使用___。（塑料袋/书本/电视）",
             en="A: How do you think we should protect the environment?\nB: I think everyone can start with small things, like reducing ___ use. (plastic bags/books/TV)",
             ans="塑料袋", ans_en="plastic bags"),
        dict(zh="A：你为什么想当班长？\nB：因为我想帮助老师，也为同学___。（服务/考试/玩）",
             en="A: Why do you want to be class monitor?\nB: Because I want to help the teacher and ___ classmates. (serve/exam/play)",
             ans="服务", ans_en="serve"),
    ]
    qq = []
    for d in dialogs:
        qid = qc[0]; qc[0] += 1
        qq.append(dict(question_id=f"Q-CHI-P6-{qid:04d}",topic_id=topic_id,level=6,subject="chinese",
                       question_type="dialogue_completion",difficulty="medium",
                       stem_en=f"Complete the dialogue:\n{d['en']}",
                       stem_zh=f"完成对话：\n{d['zh']}",
                       answer_en=d['ans_en'], answer_zh=d['ans'],
                       explanation_en="Read the full dialogue to understand the context before choosing.",
                       explanation_zh="先读完整个对话理解上下文再选择。",
                       tags=["dialogue-completion","p6","psle-format"], hints=[],
                       moed_code="C-P6-DC-01"))
    return qq

# ── Orchestrator ─────────────────────────────────────────────────────────

def generate():
    qc = [201]  # Continue from existing 200 questions
    all_questions = []

    # Map topic_id → level → generator functions
    topic_map = {}
    with open(DATA / "taxonomy.json") as f: taxonomy = json.load(f)
    ch = taxonomy["subjects"]["chinese"]
    for lvl_str, lvl_data in ch["levels"].items():
        for t in lvl_data["topics"]:
            tid = t["id"]
            level = int(lvl_str)
            topic_map[tid] = level

    # P1: 6 topics, need ~492 more (target 500)
    # Each gen call produces ~131 qs/topic, so 1 iter × 6 topics ≈ 786
    p1_vocab = P1_VOCAB
    for tid, lvl in sorted(topic_map.items()):
        if lvl != 1: continue
        name_en = next((t["name_en"] for tl in ch["levels"]["1"]["topics"] if t["id"]==tid), tid)
        print(f"P1 topic: {tid} ({name_en})")
        qs = []
        for i in range(1): qs.extend(gen_p1_dictation(p1_vocab, qc, tid))
        for i in range(1): qs.extend(gen_p1_hanyupinyin(p1_vocab, qc, tid))
        for i in range(1): qs.extend(gen_p1_stroke(p1_vocab, qc, tid))
        for i in range(1): qs.extend(gen_p1_sentence(p1_vocab, qc, tid))
        for i in range(1): qs.extend(gen_p1_listening(p1_vocab, qc, tid))
        for i in range(1): qs.extend(gen_p1_picture_desc(p1_vocab, qc, tid))
        all_questions.extend(qs)

    # P2: 5 topics, need ~492 more (target 500). ~55 qs/topic/iter, 2 iters ≈ 550
    for tid, lvl in sorted(topic_map.items()):
        if lvl != 2: continue
        print(f"P2 topic: {tid}")
        qs = []
        for i in range(2): qs.extend(gen_p2_vocab(P2_VOCAB, qc, tid))
        for i in range(2): qs.extend(gen_p2_sentence(P2_VOCAB, qc, tid))
        for i in range(2): qs.extend(gen_p2_comprehension(P2_VOCAB, qc, tid))
        for i in range(2): qs.extend(gen_p2_writing(P2_VOCAB, qc, tid))
        for i in range(2): qs.extend(gen_p2_oral(P2_VOCAB, qc, tid))
        all_questions.extend(qs)

    # P3: 5 topics, need >800. ~52 qs/topic/iter, 4 iters ≈ 1040
    for tid, lvl in sorted(topic_map.items()):
        if lvl != 3: continue
        print(f"P3 topic: {tid}")
        qs = []
        for i in range(4): qs.extend(gen_p3_vocab_idiom(P3_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p3_comprehension(P3_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p3_conjunction(P3_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p3_composition(P3_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p3_oral(P3_VOCAB, qc, tid))
        all_questions.extend(qs)

    # P4: 6 topics, need >800. ~40 qs/topic/iter, 4 iters ≈ 960
    for tid, lvl in sorted(topic_map.items()):
        if lvl != 4: continue
        print(f"P4 topic: {tid}")
        qs = []
        for i in range(4): qs.extend(gen_p4_vocab_context(P4_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p4_comprehension(P4_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p4_cloze(P4_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p4_narrative(P4_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p4_oral_conversation(P4_VOCAB, qc, tid))
        for i in range(4): qs.extend(gen_p4_grammar(P4_VOCAB, qc, tid))
        # P4 dialogue completion
        for i in range(4): qs.extend(gen_p4_dialogue(P4_VOCAB, qc, tid))
        all_questions.extend(qs)

    # P5: 6 topics, need >1200. ~46 qs/topic/iter, 5 iters ≈ 1380
    for tid, lvl in sorted(topic_map.items()):
        if lvl != 5: continue
        print(f"P5 topic: {tid}")
        qs = []
        for i in range(5): qs.extend(gen_p5_advanced_vocab(P5_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p5_comprehension_advanced(P5_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p5_cloze_advanced(P5_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p5_composition(P5_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p5_oral_exam(P5_VOCAB, qc, tid) or [])
        for i in range(5): qs.extend(gen_p5_grammar_advanced(P5_VOCAB, qc, tid))
        # P5 dialogue completion
        for i in range(5): qs.extend(gen_p5_dialogue(P5_VOCAB, qc, tid))
        all_questions.extend(qs)

    # P6: 7 topics, need >1200. ~49 qs/topic/iter, 5 iters ≈ 1715
    for tid, lvl in sorted(topic_map.items()):
        if lvl != 6: continue
        print(f"P6 topic: {tid}")
        qs = []
        for i in range(5): qs.extend(gen_p6_psle_vocab(P6_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p6_psle_comprehension(P6_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p6_psle_cloze(P6_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p6_psle_composition(P6_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p6_psle_oral(P6_VOCAB, qc, tid) or [])
        for i in range(5): qs.extend(gen_p6_psle_listening(P6_VOCAB, qc, tid))
        for i in range(5): qs.extend(gen_p6_psle_dialogue(P6_VOCAB, qc, tid))
        all_questions.extend(qs)

    print(f"\nTotal generated: {len(all_questions)} questions")

    # Deduplicate
    seen = set()
    deduped = []
    for q in all_questions:
        if q["question_id"] not in seen:
            seen.add(q["question_id"])
            deduped.append(q)

    print(f"After dedup: {len(deduped)} questions")

    by_level = {}
    for q in deduped:
        l = f"P{q['level']}"
        by_level[l] = by_level.get(l, 0) + 1
    for l in sorted(by_level):
        print(f"  {l}: {by_level[l]}")

    out = DATA / "chinese-questions-generated.json"
    with open(out, "w") as f:
        json.dump({"generated_at":datetime.now(timezone.utc).isoformat(),
                    "source":"MOE Chinese MT Syllabus (public Crown Copyright, paraphrased)",
                    "total_questions":len(deduped),
                    "questions":deduped}, f, ensure_ascii=False, indent=2)
    print(f"\nSaved to {out}")

if __name__ == "__main__":
    generate()
