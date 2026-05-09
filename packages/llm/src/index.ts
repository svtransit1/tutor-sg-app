export type {
  Subject,
  Grade,
  Language,
  ScaffoldLevel,
  PromptContext,
  FollowUpContext,
  SubjectDetectionResult,
  PromptOutput,
  SubjectAdapter,
  ToneConfig,
} from './types';

export { isGrade, ensureGrade } from './types';

export {
  buildHomeworkHelpPrompt,
  buildHomeworkHelpSystemPrompt,
  buildHomeworkHelpUserPrompt,
} from './prompts/homework-help';

export {
  buildFollowUpPrompt,
  buildFollowUpSystemPrompt,
  buildFollowUpUserPrompt,
} from './prompts/follow-up';

export {
  buildSubjectDetectionPrompt,
  parseSubjectDetectionResult,
} from './prompts/subject-detection';

export { getToneConfig, buildToneSection } from './prompts/tone';

export { getSubjectAdapter, buildSubjectSection } from './prompts/subject-adapters';
