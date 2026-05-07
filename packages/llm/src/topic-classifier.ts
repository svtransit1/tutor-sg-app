import type { Subject } from './routing';
import { TOPICS, type TopicEntry, getTopicsBySubject } from './topics';

export interface TopicClassificationResult {
  topicId: string | null;
  topicNameEn: string | null;
  topicNameZh: string | null;
  gradeLevel: number;
  confidence: number;
  candidates: Array<{ topicId: string; nameEn: string; nameZh: string; score: number; level: number }>;
}

export const DEFAULT_TOPIC_CONFIDENCE_THRESHOLD = 0.15;

function scoreTopic(text: string, topic: TopicEntry): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  for (const term of topic.terms) {
    if (lowerText.includes(term.toLowerCase())) {
      score += 1;
    }
  }
  return score;
}

function inferGradeFromText(text: string): number {
  const match = text.match(/\bP([1-6])\b/i);
  return match ? Number(match[1]) : 0;
}

export function classifyTopic(
  subject: Subject,
  text: string,
  grade?: number,
  threshold: number = DEFAULT_TOPIC_CONFIDENCE_THRESHOLD,
): TopicClassificationResult {
  const trimmed = text.trim();
  const resolvedGrade = grade ?? inferGradeFromText(trimmed);

  let candidates = getTopicsBySubject(subject);

  if (resolvedGrade > 0) {
    candidates = [...candidates].sort((a, b) => {
      const aMatch = a.level === resolvedGrade ? 1 : 0;
      const bMatch = b.level === resolvedGrade ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  const scored = candidates.map((topic) => ({
    topicId: topic.id,
    nameEn: topic.nameEn,
    nameZh: topic.nameZh,
    score: scoreTopic(trimmed, topic),
    level: topic.level,
  }));

  scored.sort((a, b) => b.score - a.score);

  if (resolvedGrade > 0) {
    for (const item of scored) {
      if (item.level === resolvedGrade && item.score > 0) {
        item.score += 0.5;
      }
    }
    scored.sort((a, b) => b.score - a.score);
  }

  const best = scored[0];
  const top3 = scored.slice(0, 3);

  if (!best || best.score === 0) {
    return {
      topicId: null,
      topicNameEn: null,
      topicNameZh: null,
      gradeLevel: resolvedGrade,
      confidence: 0,
      candidates: top3,
    };
  }

  const confidence = best.score / (best.score + 1);
  const belowThreshold = confidence < threshold;

  return {
    topicId: belowThreshold ? null : best.topicId,
    topicNameEn: belowThreshold ? null : best.nameEn,
    topicNameZh: belowThreshold ? null : best.nameZh,
    gradeLevel: belowThreshold ? resolvedGrade : best.level,
    confidence,
    candidates: top3,
  };
}
