export type { DatabaseExecutor } from './schema';

export {
  TABLE_SCHEMA_VERSION,
  TABLE_PARENT_ACCOUNT,
  TABLE_KID_PROFILE,
  TABLE_SESSION_LOG,
  TABLE_SESSION_EVENT,
  TABLE_QUESTION_ATTEMPT,
  TABLE_SYLLABUS_TOPIC_TREE,
  TABLE_MODEL_METADATA,
  TABLE_USAGE_COUNTER,
  ALL_TABLES_SQL,
  MIGRATIONS,
  getCurrentVersion,
  runMigrations,
  seedDefault,
} from './schema';

export type {
  Subject,
  GradeLevel,
  DeviceTier,
  AuthProvider,
  SessionEventType,
  ParentAccount,
  KidProfile,
  SessionLog,
  SessionEvent,
  QuestionAttempt,
  SyllabusTopicNode,
  ModelMetadata,
  UsageCounter,
} from './types';

export {
  createParentAccount,
  getParentAccount,
  getParentAccountByEmail,
  createKidProfile,
  getKidProfile,
  listKidProfiles,
  updateKidProfile,
} from './profiles';

export {
  createSession,
  getSession,
  endSession,
  listSessionsByKidProfile,
} from './sessions';

export {
  addSessionEvent,
  getSessionEvent,
  listSessionEvents,
  countSessionEvents,
} from './session-events';

export {
  addQuestionAttempt,
  getQuestionAttempt,
  updateQuestionAttemptAnswer,
  incrementHintsUsed,
  listQuestionAttempts,
} from './question-attempts';

export { getSyllabusTopics, getSyllabusTopic } from './syllabus';

export {
  insertModelMetadata,
  getModelMetadata,
  getLatestModelMetadata,
  listAllModels,
} from './model-metadata';

export {
  getOrCreateUsageCounter,
  incrementPhotoCount,
  incrementQuestionCount,
  getUsageForDate,
  getUsageForDateRange,
} from './usage-counters';
