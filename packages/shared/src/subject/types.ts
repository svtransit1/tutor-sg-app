export type Subject = 'math' | 'english' | 'science' | 'chinese'

export const AllSubjects: Subject[] = ['math', 'english', 'science', 'chinese']

export function subjectLabel(key: Subject): Record<'en' | 'zhHans', string> {
  const labels: Record<Subject, Record<'en' | 'zhHans', string>> = {
    math: { en: 'Mathematics', zhHans: '数学' },
    english: { en: 'English', zhHans: '英语' },
    science: { en: 'Science', zhHans: '科学' },
    chinese: { en: 'Chinese', zhHans: '中文' },
  }
  return labels[key]
}
