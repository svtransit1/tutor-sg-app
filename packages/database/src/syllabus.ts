import type { DatabaseExecutor } from './schema';
import type { SyllabusTopicNode, Subject, GradeLevel } from './types';

export function getSyllabusTopics(
  db: DatabaseExecutor,
  subject: Subject,
  level: GradeLevel,
  parentTopicId?: string | null,
): SyllabusTopicNode[] {
  let sql =
    'SELECT * FROM syllabus_topic_tree WHERE subject = ? AND level = ?';
  const params: unknown[] = [subject, level];

  if (parentTopicId === null) {
    sql += ' AND parent_topic_id IS NULL';
  } else if (parentTopicId !== undefined) {
    sql += ' AND parent_topic_id = ?';
    params.push(parentTopicId);
  }

  sql += ' ORDER BY "sequence" ASC';

  const rows = db.getAll<{
    id: string;
    subject: string;
    level: string;
    topic_id: string;
    parent_topic_id: string | null;
    name_en: string;
    name_zh: string;
    sequence: number;
  }>(sql, params);

  return rows.map((row) => ({
    id: row.id,
    subject: row.subject as Subject,
    level: row.level as GradeLevel,
    topicId: row.topic_id,
    parentTopicId: row.parent_topic_id,
    nameEn: row.name_en,
    nameZh: row.name_zh,
    sequence: row.sequence,
  }));
}

export function getSyllabusTopic(
  db: DatabaseExecutor,
  subject: Subject,
  level: GradeLevel,
  topicId: string,
): SyllabusTopicNode | null {
  const row = db.getFirst<{
    id: string;
    subject: string;
    level: string;
    topic_id: string;
    parent_topic_id: string | null;
    name_en: string;
    name_zh: string;
    sequence: number;
  }>(
    'SELECT * FROM syllabus_topic_tree WHERE subject = ? AND level = ? AND topic_id = ?',
    [subject, level, topicId],
  );

  if (!row) return null;
  return {
    id: row.id,
    subject: row.subject as Subject,
    level: row.level as GradeLevel,
    topicId: row.topic_id,
    parentTopicId: row.parent_topic_id,
    nameEn: row.name_en,
    nameZh: row.name_zh,
    sequence: row.sequence,
  };
}
