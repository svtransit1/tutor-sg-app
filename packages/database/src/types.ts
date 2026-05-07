export type Subject = 'math' | 'english' | 'chinese_mt' | 'science'
export type GradeLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'
export type DeviceTier = 'high' | 'low' | 'below_floor'
export type AuthProvider = 'email' | 'google' | 'apple'
export type SessionEventType = 'photo_captured'|'question_detected'|'hint_shown'|'answer_revealed'|'follow_up'|'manual_input'|'session_started'|'session_ended'
export interface ParentAccount { id: string; email: string; authProvider: AuthProvider; authProviderId: string; createdAt: string; updatedAt: string }
export interface KidProfile { id: string; parentAccountId: string; name: string; grade: GradeLevel; subjects: Subject[]; createdAt: string; updatedAt: string }
export interface SessionLog { id: string; kidProfileId: string; subject: Subject | null; topic: string | null; deviceTier: DeviceTier; startedAt: string; endedAt: string | null }
export interface SessionEvent { id: string; sessionLogId: string; eventType: SessionEventType; timestamp: string; payload: string }
export interface QuestionAttempt { id: string; sessionLogId: string; questionText: string; subject: Subject; topic: string; answer: string | null; correct: boolean | null; hintsUsed: number; createdAt: string }
export interface SyllabusTopicNode { id: string; subject: Subject; level: GradeLevel; topicId: string; parentTopicId: string | null; nameEn: string; nameZh: string; sequence: number }
export interface ModelMetadata { id: string; modelName: string; version: string; quant: string; filePath: string; hash: string; downloadedAt: string; sizeBytes: number }
export interface UsageCounter { id: string; kidProfileId: string; date: string; photoCount: number; questionCount: number }
