export type I18nKey =
  | 'app.loading'
  | 'app.name'
  | 'onboarding.welcome.title'
  | 'onboarding.welcome.subtitle'
  | 'onboarding.done.title'
  | 'onboarding.done.subtitle'
  | 'network.offline'
  | 'network.offline.description'
  | 'network.cellular'
  | 'network.cellular.description'
  | `parentAuth.${ParentAuthKey}`
  | `parent.${ParentAreaKey}`
  | `modelDownload.${ModelDownloadKey}`
  | `homeworkFeedback.${HomeworkFeedbackKey}`
  | `cameraGuideFrame.${CameraGuideFrameKey}`

export type ParentAuthKey =
  | 'title'
  | 'enterPin'
  | 'wrongPin'
  | 'cooldown'
  | 'cooldownTimer'
  | 'attemptsRemaining'
  | 'attemptsRemaining_plural'
  | 'pinsDontMatch'
  | `setup.${ParentAuthSetupKey}`
export type ParentAuthSetupKey = 'title' | 'enterPin' | 'confirmPin'
export type ParentAreaKey = `dashboard.${ParentDashboardKey}` | `settings.${ParentSettingsKey}`
export type ParentDashboardKey = 'title' | 'placeholder'
export type ParentSettingsKey =
  | 'title'
  | 'sectionQuality'
  | 'qualityDescription'
  | 'qualityAuto'
  | 'qualityHigh'
  | 'qualityStandard'
  | 'qualityLow'
  | 'tierAuto'
  | 'tierOverride'
  | 'modelInfo'
  | 'sectionLanguage'
  | 'languageDescription'
  | 'languageEn'
  | 'languageZh'
  | 'footerInfo'
export type HomeworkFeedbackKey =
  | 'title'
  | 'questionLabel'
  | 'tabHint'
  | 'tabSteps'
  | 'tabSolution'
  | 'followUpTitle'
  | 'textPlaceholder'
  | 'send'
  | 'voiceButton'
  | 'voiceRecording'
  | 'voiceProcessing'
  | 'voiceError'
  | 'voiceRetry'
  | 'voicePermissionDenied'
  | 'backToHome'
  | 'voiceInputHint'
  | 'speakContent'
  | 'stopSpeaking'
  | `accessibility.${HomeworkFeedbackAccessibilityKey}`
export type HomeworkFeedbackAccessibilityKey =
  | 'voiceButton'
  | 'voiceRecording'
  | 'voiceProcessing'
  | 'voiceError'
  | 'voicePermissionDenied'
  | 'textInput'
  | 'sendButton'
  | 'speakContent'
  | 'stopSpeaking'

export type CameraGuideFrameKey =
  | 'title'
  | 'aligned'
  | 'hint'
  | 'capture'
  | 'retake'
  | `accessibility.${CameraGuideFrameAccessibilityKey}`
export type CameraGuideFrameAccessibilityKey =
  | 'alignFrame'
  | 'aligned'

export type ModelDownloadKey =
  | 'title'
  | 'progress'
  | 'progressPercent'
  | 'retrying'
  | 'paused'
  | 'resuming'
  | 'completed'
  | 'retry'
  | 'wifiRequired'
  | `errors.${ModelDownloadErrorKey}`
export type ModelDownloadErrorKey =
  | 'connectivity_lost'
  | 'disk_insufficient'
  | 'cdn_unreachable'
  | 'hash_mismatch'
  | 'download_stuck'
  | 'unknown_error'

export const I18N_KEYS = [
  'app.loading',
  'app.name',
  'onboarding.welcome.title',
  'onboarding.welcome.subtitle',
  'onboarding.done.title',
  'onboarding.done.subtitle',
  'network.offline',
  'network.offline.description',
  'network.cellular',
  'network.cellular.description',
  'parentAuth.title',
  'parentAuth.enterPin',
  'parentAuth.wrongPin',
  'parentAuth.cooldown',
  'parentAuth.cooldownTimer',
  'parentAuth.attemptsRemaining',
  'parentAuth.attemptsRemaining_plural',
  'parentAuth.pinsDontMatch',
  'parentAuth.setup.title',
  'parentAuth.setup.enterPin',
  'parentAuth.setup.confirmPin',
  'parent.dashboard.title',
  'parent.dashboard.placeholder',
  'parent.settings.title',
  'parent.settings.sectionQuality',
  'parent.settings.qualityDescription',
  'parent.settings.qualityAuto',
  'parent.settings.qualityHigh',
  'parent.settings.qualityStandard',
  'parent.settings.qualityLow',
  'parent.settings.tierAuto',
  'parent.settings.tierOverride',
  'parent.settings.modelInfo',
  'parent.settings.sectionLanguage',
  'parent.settings.languageDescription',
  'parent.settings.languageEn',
  'parent.settings.languageZh',
  'parent.settings.footerInfo',
  'homeworkFeedback.title',
  'homeworkFeedback.questionLabel',
  'homeworkFeedback.tabHint',
  'homeworkFeedback.tabSteps',
  'homeworkFeedback.tabSolution',
  'homeworkFeedback.followUpTitle',
  'homeworkFeedback.textPlaceholder',
  'homeworkFeedback.send',
  'homeworkFeedback.voiceButton',
  'homeworkFeedback.voiceRecording',
  'homeworkFeedback.voiceProcessing',
  'homeworkFeedback.voiceError',
  'homeworkFeedback.voiceRetry',
  'homeworkFeedback.voicePermissionDenied',
  'homeworkFeedback.backToHome',
  'homeworkFeedback.voiceInputHint',
  'homeworkFeedback.speakContent',
  'homeworkFeedback.stopSpeaking',
  'homeworkFeedback.accessibility.voiceButton',
  'homeworkFeedback.accessibility.voiceRecording',
  'homeworkFeedback.accessibility.voiceProcessing',
  'homeworkFeedback.accessibility.voiceError',
  'homeworkFeedback.accessibility.voicePermissionDenied',
  'homeworkFeedback.accessibility.textInput',
  'homeworkFeedback.accessibility.sendButton',
  'homeworkFeedback.accessibility.speakContent',
  'homeworkFeedback.accessibility.stopSpeaking',
  'cameraGuideFrame.title',
  'cameraGuideFrame.aligned',
  'cameraGuideFrame.hint',
  'cameraGuideFrame.capture',
  'cameraGuideFrame.retake',
  'cameraGuideFrame.accessibility.alignFrame',
  'cameraGuideFrame.accessibility.aligned',
  'modelDownload.title',
  'modelDownload.progress',
  'modelDownload.progressPercent',
  'modelDownload.retrying',
  'modelDownload.paused',
  'modelDownload.resuming',
  'modelDownload.completed',
  'modelDownload.retry',
  'modelDownload.wifiRequired',
  'modelDownload.errors.connectivity_lost',
  'modelDownload.errors.disk_insufficient',
  'modelDownload.errors.cdn_unreachable',
  'modelDownload.errors.hash_mismatch',
  'modelDownload.errors.download_stuck',
  'modelDownload.errors.unknown_error',
] as const

export type I18nKeyLiteral = (typeof I18N_KEYS)[number]
export type Locale = 'en' | 'zh-Hans'

export interface LocaleDescriptor {
  code: Locale
  labelEn: string
  labelNative: string
}

export const LOCALES: LocaleDescriptor[] = [
  { code: 'en', labelEn: 'English', labelNative: 'English' },
  { code: 'zh-Hans', labelEn: 'Simplified Chinese', labelNative: '简体中文' },
]
