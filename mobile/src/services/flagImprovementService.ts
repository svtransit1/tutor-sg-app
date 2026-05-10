import { ParentSessionRepository, FlagImprovementRow } from '../storage/parentSessions'

export interface TopicImprovement {
  topicId: string
  subject: string
  level: number
  flagCount: number
  avgDifficulty: string | null
  commonReasons: string[]
  suggestions: string[]
  lastAnalyzed: string | null
}

export interface FlagDashboardSummary {
  totalFlagged: number
  flaggedSubjects: { subject: string; count: number }[]
  topFlaggedTopics: TopicImprovement[]
  lastAnalysisDate: string | null
}

function toImprovement(r: FlagImprovementRow): TopicImprovement {
  return {
    topicId: r.topic_id,
    subject: r.subject,
    level: r.level,
    flagCount: r.flag_count,
    avgDifficulty: r.avg_difficulty,
    commonReasons: JSON.parse(r.common_reasons || '[]'),
    suggestions: JSON.parse(r.suggestions || '[]'),
    lastAnalyzed: r.last_analyzed,
  }
}

export class FlagImprovementService {
  static async analyzeFlaggedSessions(kidProfileId: string): Promise<TopicImprovement[]> {
    const flagged = await ParentSessionRepository.getFlaggedSessions(kidProfileId)
    if (flagged.length === 0) return []

    const map = new Map<string, { subject: string; level: number; reasons: string[]; count: number }>()
    for (const s of flagged) {
      const key = s.topic || `${s.subject}_general`
      if (!map.has(key)) map.set(key, { subject: s.subject, level: 0, reasons: [], count: 0 })
      const entry = map.get(key)!
      entry.count++
      if (s.flagReason) entry.reasons.push(s.flagReason)
    }

    const results: TopicImprovement[] = []
    for (const [topicId, data] of map) {
      const suggestions: string[] = []
      if (data.count >= 3) {
        suggestions.push('review_topic_difficulty')
        suggestions.push('provide_additional_practice')
      }
      if (data.reasons.some((r) => /confus|unclear/i.test(r))) suggestions.push('clarify_question_wording')
      if (data.reasons.some((r) => /hard|difficult/i.test(r))) suggestions.push('adjust_difficulty_down')
      if (suggestions.length === 0) suggestions.push('monitor_future_sessions')

      const row: FlagImprovementRow = {
        topic_id: topicId,
        subject: data.subject,
        level: data.level,
        flag_count: data.count,
        avg_difficulty: null,
        common_reasons: JSON.stringify([...new Set(data.reasons)]),
        suggestions: JSON.stringify(suggestions),
        last_analyzed: new Date().toISOString(),
      }
      await ParentSessionRepository.upsertFlagImprovement(row)
      results.push(toImprovement(row))
    }

    return results.sort((a, b) => b.flagCount - a.flagCount)
  }

  static async getImprovementsBySubject(subject: string): Promise<TopicImprovement[]> {
    const all = await ParentSessionRepository.getAllFlagImprovements()
    return all.filter((r) => r.subject === subject).map(toImprovement).sort((a, b) => b.flagCount - a.flagCount)
  }

  static async getDashboardSummary(_kidProfileId: string): Promise<FlagDashboardSummary> {
    const all = await ParentSessionRepository.getAllFlagImprovements()
    const improvements = all.map(toImprovement).sort((a, b) => b.flagCount - a.flagCount)

    const sc = new Map<string, number>()
    for (const i of improvements) sc.set(i.subject, (sc.get(i.subject) || 0) + i.flagCount)

    const dates = improvements.map((i) => i.lastAnalyzed).filter((d): d is string => d !== null).sort().reverse()

    return {
      totalFlagged: improvements.reduce((s, i) => s + i.flagCount, 0),
      flaggedSubjects: [...sc].map(([subject, count]) => ({ subject, count })),
      topFlaggedTopics: improvements.slice(0, 5),
      lastAnalysisDate: dates[0] ?? null,
    }
  }
}
