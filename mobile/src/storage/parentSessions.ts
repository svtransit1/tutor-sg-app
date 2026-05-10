import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite'



export type ParentSubject = 'math' | 'english' | 'chinese' | 'science' | 'humanities' | 'arts' | 'music' | 'other'



interface ParentSessionRow {

  id: string

  kid_profile_id: string

  subject: string

  topic: string

  started_at: string

  ended_at: string | null

  questions_attempted: number

  questions_correct: number | null

  struggle_indicators: string

  ai_summary: string | null

  parent_flagged: number

}



export interface ParentSession {

  id: string

  kidProfileId: string

  subject: ParentSubject

  topic: string

  startedAt: string

  endedAt: string | null

  questionsAttempted: number

  questionsCorrect: number | null

  struggleIndicators: boolean[]

  aiSummary: string | null

  parentFlagged: boolean

}


export interface SubjectBreakdown { subject:ParentSubject; sessions:number; questions:number; correct:number; accuracyRate:number; totalTimeSeconds:number; }
export interface DailySummary { date:string; totalSessions:number; totalQuestions:number; totalCorrect:number; accuracyRate:number; totalTimeSeconds:number; struggleSessions:number; subjects:ParentSubject[]; perSubject:SubjectBreakdown[]; }
export interface PaginatedResult<T> { items:T[]; total:number; hasMore:boolean; }
export type TrendDirection = 'up'|'down'|'stable';
export interface WeeklySummary { startDate:string; endDate:string; totalSessions:number; totalQuestions:number; totalCorrect:number; accuracyRate:number; totalTimeSeconds:number; struggleSessions:number; subjects:ParentSubject[]; dailySummaries:DailySummary[]; trend:TrendDirection; }



const DB_NAME = 'tutorSG.db'



let _db: SQLiteDatabase | null = null



async function getDb(): Promise<SQLiteDatabase> {

  if (!_db) {

    const db = await openDatabaseAsync(DB_NAME)

    await db.execAsync("CREATE TABLE IF NOT EXISTS parent_sessions (id TEXT PRIMARY KEY, kid_profile_id TEXT NOT NULL, subject TEXT NOT NULL, topic TEXT NOT NULL DEFAULT '', started_at TEXT NOT NULL DEFAULT (datetime('now')), ended_at TEXT, questions_attempted INTEGER NOT NULL DEFAULT 0, questions_correct INTEGER DEFAULT NULL, struggle_indicators TEXT NOT NULL DEFAULT '[]', ai_summary TEXT, parent_flagged INTEGER NOT NULL DEFAULT 0);"

    + "CREATE TABLE IF NOT EXISTS question_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, question_id TEXT NOT NULL, correct INTEGER NOT NULL, hints_used INTEGER NOT NULL DEFAULT 0, time_seconds INTEGER NOT NULL DEFAULT 0, struggle_detected INTEGER NOT NULL DEFAULT 0, logged_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (session_id) REFERENCES parent_sessions(id));")

    _db = db

  }

  return _db

}



export function __resetDb(): void {

  _db = null

}




function rowToSession(row: ParentSessionRow): ParentSession {

  return {

    id: row.id, kidProfileId: row.kid_profile_id, subject: row.subject as ParentSubject, topic: row.topic,

    startedAt: row.started_at, endedAt: row.ended_at,

    questionsAttempted: row.questions_attempted, questionsCorrect: row.questions_correct,

    struggleIndicators: JSON.parse(row.struggle_indicators || '[]'),

    aiSummary: row.ai_summary, parentFlagged: row.parent_flagged === 1,

  }

}



export class ParentSessionRepository {

  static async startSession(kidProfileId: string, subject: ParentSubject, topic = ''): Promise<string> {

    const db = await getDb()

    const id = crypto.randomUUID()

    await db.runAsync("INSERT INTO parent_sessions (id, kid_profile_id, subject, topic, started_at) VALUES (?, ?, ?, ?, datetime('now'))", id, kidProfileId, subject, topic)

    return id

  }

  static async logQuestionAttempt(sessionId: string, questionId: string, correct: boolean, hintsUsed: number, timeSeconds: number, struggleDetected: boolean): Promise<void> {

    const db = await getDb()

    await db.runAsync("INSERT INTO question_attempts (session_id, question_id, correct, hints_used, time_seconds, struggle_detected) VALUES (?, ?, ?, ?, ?, ?)", sessionId, questionId, correct ? 1 : 0, hintsUsed, timeSeconds, struggleDetected ? 1 : 0)

    await db.runAsync("UPDATE parent_sessions SET questions_attempted = questions_attempted + 1, questions_correct = COALESCE(questions_correct, 0) + ?, struggle_indicators = struggle_indicators || ? WHERE id = ?", correct ? 1 : 0, struggleDetected ? '1' : '0', sessionId)

  }

  static async endSession(sessionId: string, aiSummary: string, parentFlagged: boolean): Promise<void> {

    const db = await getDb()

    await db.runAsync("UPDATE parent_sessions SET ended_at = datetime('now'), ai_summary = ?, parent_flagged = ? WHERE id = ?", aiSummary, parentFlagged ? 1 : 0, sessionId)

  }

  static async getSession(id: string): Promise<ParentSession | null> {

    const db = await getDb()

    const row = await db.getFirstAsync<ParentSessionRow>('SELECT * FROM parent_sessions WHERE id = ?', id)

    return row ? rowToSession(row) : null

  }

  static async getSessionsForKid(kidProfileId: string): Promise<ParentSession[]> {

    const db = await getDb()

    const rows = await db.getAllAsync<ParentSessionRow>('SELECT * FROM parent_sessions WHERE kid_profile_id = ? ORDER BY started_at ASC', kidProfileId)

    return rows.map(rowToSession)

  }

  static async setParentFlagged(sessionId: string, flagged: boolean): Promise<void> {

    const db = await getDb()

    await db.runAsync('UPDATE parent_sessions SET parent_flagged = ? WHERE id = ?', flagged ? 1 : 0, sessionId)

  }



  static async pruneSessionsOlderThan(daysRetention: number): Promise<number> {

    const db = await getDb()

    const cutoffDate = new Date()

    cutoffDate.setDate(cutoffDate.getDate() - daysRetention)

    const cutoffStr = cutoffDate.toISOString()

    await db.runAsync("DELETE FROM question_attempts WHERE session_id IN (SELECT id FROM parent_sessions WHERE started_at < ?)", cutoffStr)

    const result = await db.runAsync("DELETE FROM parent_sessions WHERE started_at < ?", cutoffStr)

    return result.changes

  }

}


  static async getSessionsByDateRange(a: string, b: string, c: string): Promise<ParentSession[]> {
    const d=await getDb();const e=await d.getAllAsync<any>('SELECT * FROM parent_sessions WHERE kid_profile_id=? AND started_at>=? AND started_at<=? ORDER BY started_at DESC',a,b,c);return e.map(rowToSession);}
  static async getPaginatedSessions(a: string, b: number, c=20): Promise<PaginatedResult<ParentSession>> {
    const d=await getDb();const e=(b-1)*c;const f=await d.getFirstAsync<{count:number}>('SELECT COUNT(*) as count FROM parent_sessions WHERE kid_profile_id=?',a);const g=f?.count??0;const h=await d.getAllAsync<any>('SELECT * FROM parent_sessions WHERE kid_profile_id=? ORDER BY started_at DESC LIMIT ? OFFSET ?',a,c,e);return{items:h.map(rowToSession),total:g,hasMore:e+c<g};}
  static async getSessionsBySubject(a: string, b: string): Promise<ParentSession[]> {
    const c=await getDb();const d=await c.getAllAsync<any>('SELECT * FROM parent_sessions WHERE kid_profile_id=? AND subject=? ORDER BY started_at DESC',a,b);return d.map(rowToSession);}
  static async getFlaggedSessions(a: string): Promise<ParentSession[]> {
    const b=await getDb();const c=await b.getAllAsync<any>('SELECT * FROM parent_sessions WHERE kid_profile_id=? AND parent_flagged=1 ORDER BY started_at DESC',a);return c.map(rowToSession);}
  static async pruneSessionsOlderThan(a: number): Promise<number> {
    const b=await getDb();const c=new Date(Date.now()-a*24*60*60*1000).toISOString();
    await b.runAsync('DELETE FROM question_attempts WHERE session_id IN (SELECT id FROM parent_sessions WHERE started_at<?)',c);
    const d=await b.runAsync('DELETE FROM parent_sessions WHERE started_at<?',c);return d.changes;}
  static async getDailySummary(kidProfileId: string, date: string): Promise<DailySummary|null> {
    const db=await getDb();const rows=await db.getAllAsync<any>('SELECT * FROM parent_sessions WHERE kid_profile_id=? AND date(started_at)=?',kidProfileId,date);
    if(!rows.length)return null;
    const m=new Map<string,{s:number;q:number;c:number;t:number}>();let tq=0,tc=0,tt=0,sc=0;
    for(const r of rows){tq+=r.questions_attempted;tc+=r.questions_correct;const d=this._dur(r.started_at,r.ended_at);tt+=d;if(this._str(r))sc++;const p=m.get(r.subject)??{s:0,q:0,c:0,t:0};p.s++;p.q+=r.questions_attempted;p.c+=r.questions_correct;p.t+=d;m.set(r.subject,p);}
    const subj=Array.from(m.keys()).filter((s):s is ParentSubject=>['math','english','chinese','science','humanities','arts','music','other'].includes(s));
    const perS=subj.map(s=>{const d=m.get(s)!;return{subject:s,sessions:d.s,questions:d.q,correct:d.c,accuracyRate:d.q>0?Math.round((d.c/d.q)*100):0,totalTimeSeconds:d.t};});
    return{date,totalSessions:rows.length,totalQuestions:tq,totalCorrect:tc,accuracyRate:tq>0?Math.round((tc/tq)*100):0,totalTimeSeconds:tt,struggleSessions:sc,subjects:subj,perSubject:perS};}
  static _dur(a: string, b: string|null): number { if(!b)return 0;return Math.round((new Date(b).getTime()-new Date(a).getTime())/1000);}
  static _str(r: any): boolean { return String(r.struggle_indicators).includes('1')||String(r.struggle_indicators).includes('true');}
  static async getDailySummariesForRange(kidProfileId: string, startDate: string, endDate: string): Promise<DailySummary[]> {
    const r:DailySummary[]=[];const s=new Date(startDate);const e=new Date(endDate);
    while(s<=e){const d=s.toISOString().split('T')[0];const x=await this.getDailySummary(kidProfileId,d);if(x)r.push(x);s.setDate(s.getDate()+1);}return r;}
  static async getWeeklySummary(kidProfileId: string): Promise<WeeklySummary> {
    const n=new Date();const d=n.getDay();const df=d===0?6:d-1;const m=new Date(n);m.setDate(n.getDate()-df);m.setHours(0,0,0,0);
    const su=new Date(m);su.setDate(m.getDate()+6);su.setHours(23,59,59,999);
    const sd=m.toISOString().split('T')[0];const ed=su.toISOString().split('T')[0];
    const ds=await this.getDailySummariesForRange(kidProfileId,sd,ed);
    let ts=0,tq=0,tc=0,tt=0,ss=0;const sj=new Set<ParentSubject>();
    for(const x of ds){ts+=x.totalSessions;tq+=x.totalQuestions;tc+=x.totalCorrect;tt+=x.totalTimeSeconds;ss+=x.struggleSessions;for(const s of x.subjects)sj.add(s);}
    const ar=tq>0?Math.round((tc/tq)*100):0;let tr:TrendDirection='stable';
    if(ds.length>=2){const mid=Math.floor(ds.length/2);const fa=ds.slice(0,mid).reduce((a,x)=>a+x.accuracyRate,0)/mid;const sa=ds.slice(mid).reduce((a,x)=>a+x.accuracyRate,0)/(ds.length-mid);const d2=sa-fa;if(d2>5)tr='up';else if(d2<-5)tr='down';}
    return{startDate:sd,endDate:ed,totalSessions:ts,totalQuestions:tq,totalCorrect:tc,accuracyRate:ar,totalTimeSeconds:tt,struggleSessions:ss,subjects:Array.from(sj),dailySummaries:ds,trend:tr};}
