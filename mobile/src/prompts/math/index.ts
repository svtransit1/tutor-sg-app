export {
  composeMathPrompt,
  getSystemPromptOnly,
  type ClassifierInput,
} from './template-composer';

export {
  MATH_TUTOR_SYSTEM_PROMPT,
  type MathTutorSystemPrompt,
} from './system-prompt';

export {
  HINT_LEVEL_TEMPLATES,
  getHintTemplate,
  type HintLevelKey,
  type HintLang,
} from './hint-taxonomy';

export {
  TOPIC_SCAFFOLDS,
  getScaffoldById,
  getScaffoldHint,
  getScaffoldsByGrade,
  type TopicScaffold,
} from './topic-scaffolds';

export {
  INJECTION_GUARD,
  type InjectionGuard,
} from './injection-guard';
