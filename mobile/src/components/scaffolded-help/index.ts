/**
 * scaffolded-help — reusable components for the hint-first AI response display.
 *
 * @see ADD §4.1 — Camera homework check flow
 */

export { default as ScaffoldedQuestion } from './ScaffoldedQuestion';
export type { ScaffoldedQuestionProps } from './ScaffoldedQuestion';
export type { Step } from './StepsSection';

export { default as HintSection } from './HintSection';
export type { HintSectionProps } from './HintSection';

export { default as StepsSection } from './StepsSection';
export type { StepsSectionProps } from './StepsSection';

export { default as SolutionSection } from './SolutionSection';
export type { SolutionSectionProps } from './SolutionSection';

export { default as FollowUpChat } from './FollowUpChat';
export type { FollowUpChatProps, ChatMessage } from './FollowUpChat';

export { default as EncouragementCard } from './EncouragementCard';
export type { EncouragementCardProps } from './EncouragementCard';

export { default as SubjectBadge } from './SubjectBadge';
export { SUBJECT_META } from './SubjectBadge';
export type { SubjectBadgeProps, SubjectKey } from './SubjectBadge';
