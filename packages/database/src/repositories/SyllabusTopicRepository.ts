import { v4 as uuid } from 'uuid'
import type { SQLiteDatabase } from 'expo-sqlite'
import type { GradeLevel, Subject, SyllabusTopicNode } from '../types'
interface R { id: string; subject: string; level: string; topic_id: string; parent_topic_id: string|null; name_en: string; name_zh: string; sequence: number }
const t = (r: R): SyllabusTopicNode => ({ id: r.id, subject: r.subject as Subject, level: r.level as GradeLevel, topicId: r.topic_id, parentTopicId: r.parent_topic_id, nameEn: r.name_en, nameZh: r.name_zh, sequence: r.sequence })
export class SyllabusTopicRepository {
  constructor(private db: SQLiteDatabase) {}
  async upsert(n: Omit<SyllabusTopicNode,'id'>): Promise<SyllabusTopicNode> { const id = uuid(); await this.db.runAsync('INSERT OR REPLACE INTO syllabus_topic_tree(id,subject,level,topic_id,parent_topic_id,name_en,name_zh,sequence)VALUES(?,?,?,?,?,?,?,?)', id, n.subject, n.level, n.topicId, n.parentTopicId??null, n.nameEn, n.nameZh, n.sequence); return {...n,id} }
  async getBySubjectAndLevel(s: Subject, l: GradeLevel): Promise<SyllabusTopicNode[]> { const r = await this.db.getAllAsync<R>('SELECT * FROM syllabus_topic_tree WHERE subject = ? AND level = ? ORDER BY sequence ASC', s, l); return r.map(t) }
  async getChildren(pid: string): Promise<SyllabusTopicNode[]> { const r = await this.db.getAllAsync<R>('SELECT * FROM syllabus_topic_tree WHERE parent_topic_id = ? ORDER BY sequence ASC', pid); return r.map(t) }
  async getRootNodes(s: Subject, l: GradeLevel): Promise<SyllabusTopicNode[]> { const r = await this.db.getAllAsync<R>('SELECT * FROM syllabus_topic_tree WHERE subject = ? AND level = ? AND parent_topic_id IS NULL ORDER BY sequence ASC', s, l); return r.map(t) }
  async getAllForSubject(s: Subject): Promise<SyllabusTopicNode[]> { const r = await this.db.getAllAsync<R>('SELECT * FROM syllabus_topic_tree WHERE subject = ? ORDER BY level, sequence ASC', s); return r.map(t) }
  async deleteBySubjectAndLevel(s: Subject, l: GradeLevel): Promise<void> { await this.db.runAsync('DELETE FROM syllabus_topic_tree WHERE subject = ? AND level = ?', s, l) }
}
