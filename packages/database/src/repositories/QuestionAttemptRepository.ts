import { v4 as uuid } from 'uuid'
import type { SQLiteDatabase } from 'expo-sqlite'
import type { QuestionAttempt, Subject } from '../types'
interface R { id: string; session_log_id: string; question_text: string; subject: string; topic: string; answer: string|null; correct: number|null; hints_used: number; created_at: string }
const t = (r: R): QuestionAttempt => ({ id: r.id, sessionLogId: r.session_log_id, questionText: r.question_text, subject: r.subject as Subject, topic: r.topic, answer: r.answer, correct: r.correct===null?null:r.correct===1, hintsUsed: r.hints_used, createdAt: r.created_at })
export class QuestionAttemptRepository {
  constructor(private db: SQLiteDatabase) {}
  async create(p:{sessionLogId:string;questionText:string;subject:Subject;topic:string;answer?:string;correct?:boolean}): Promise<QuestionAttempt> { const id = uuid(); const n = new Date().toISOString(); await this.db.runAsync('INSERT INTO question_attempt(id,session_log_id,question_text,subject,topic,answer,correct,hints_used,created_at)VALUES(?,?,?,?,?,?,?,?,?)', id, p.sessionLogId, p.questionText, p.subject, p.topic, p.answer??null, p.correct!==undefined?(p.correct?1:0):null, 0, n); return this.getById(id) as Promise<QuestionAttempt> }
  async getById(id: string): Promise<QuestionAttempt|null> { const r = await this.db.getAllAsync<R>('SELECT * FROM question_attempt WHERE id = ?', id); return r.length ? t(r[0]!) : null }
  async getBySession(sid: string): Promise<QuestionAttempt[]> { const r = await this.db.getAllAsync<R>('SELECT * FROM question_attempt WHERE session_log_id = ? ORDER BY created_at ASC', sid); return r.map(t) }
  async markCorrect(id: string): Promise<void> { await this.db.runAsync('UPDATE question_attempt SET correct = 1 WHERE id = ?', id) }
  async markIncorrect(id: string): Promise<void> { await this.db.runAsync('UPDATE question_attempt SET correct = 0 WHERE id = ?', id) }
  async incrementHints(id: string): Promise<void> { await this.db.runAsync('UPDATE question_attempt SET hints_used = hints_used + 1 WHERE id = ?', id) }
  async updateAnswer(id: string, a: string): Promise<void> { await this.db.runAsync('UPDATE question_attempt SET answer = ? WHERE id = ?', a, id) }
}
