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
  | `kidHome.${KidHomeKey}`
  | `kidHistory.${KidHistoryKey}`

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

export type KidHomeKey =
  | `header.${KidHomeHeaderKey}`
  | `subjects.${SubjectsKey}`
  | `subjectsDescriptions.${SubjectsKey}`
  | `camera.${KidHomeCameraKey}`
  | `recentSessions.${KidHomeRecentSessionsKey}`
  | `accessibility.${KidHomeAccessibilityKey}`
  | `firstSession.${KidHomeFirstSessionKey}`
export type KidHomeHeaderKey = 'greeting' | 'levelBadge' | 'switchLanguage'
export type SubjectsKey = 'math' | 'english' | 'science' | 'chinese'
export type KidHomeCameraKey = 'title' | 'subtitle' | 'accessibility'
export type KidHomeRecentSessionsKey =
  | 'title'
  | 'empty'
  | 'viewAll'
  | `timeAgo.${KidHomeTimeAgoKey}`
  | 'questions'
  | 'questions_plural'
export type KidHomeTimeAgoKey = 'justNow' | 'minutesAgo' | 'hoursAgo' | 'yesterday'
export type KidHomeAccessibilityKey = 'subjectTile' | 'recentSession' | 'viewAll'
export type KidHomeFirstSessionKey =
  | 'welcomeTitle'
  | 'welcomeBody'
  | 'ctaCamera'
  | 'ctaPractice'
  | 'subjectsHint'
  | 'dismiss'
  | `accessibility.${KidHomeFirstSessionAccessibilityKey}`
export type KidHomeFirstSessionAccessibilityKey = 'welcomeBanner' | 'practiceTile'

export type KidHistoryKey =
  | 'title'
  | 'empty'
  | 'yesterday'
  | 'questions'
  | 'questions_plural'
  | `status.${KidHistoryStatusKey}`
  | `accessibility.${KidHistoryAccessibilityKey}`
export type KidHistoryStatusKey = 'completed' | 'inProgress' | 'opened'
export type KidHistoryAccessibilityKey = 'sessionCard'

export type ModelDownloadKey =
  | 'title'
  | 'progress'
  | 'progressPercent'
  | 'retrying'
  | 'paused'
  | 'resuming'
  | 'completed'
  | 'verifying'
  | 'retry'
  | 'wifiRequired'
  | 'etaTime'
  | 'speed'
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'cellularWarning'
  | 'cellularProceed'
  | 'cellularCancel'
  | 'privacyNote'
  | 'whyNeeded'
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
  'kidHome.header.greeting',
  'kidHome.header.levelBadge',
  'kidHome.header.switchLanguage',
  'kidHome.subjects.math',
  'kidHome.subjects.english',
  'kidHome.subjects.science',
  'kidHome.subjects.chinese',
  'kidHome.subjectsDescriptions.math',
  'kidHome.subjectsDescriptions.english',
  'kidHome.subjectsDescriptions.science',
  'kidHome.subjectsDescriptions.chinese',
  'kidHome.camera.title',
  'kidHome.camera.subtitle',
  'kidHome.camera.accessibility',
  'kidHome.recentSessions.title',
  'kidHome.recentSessions.empty',
  'kidHome.recentSessions.viewAll',
  'kidHome.recentSessions.timeAgo.justNow',
  'kidHome.recentSessions.timeAgo.minutesAgo',
  'kidHome.recentSessions.timeAgo.hoursAgo',
  'kidHome.recentSessions.timeAgo.yesterday',
  'kidHome.recentSessions.questions',
  'kidHome.recentSessions.questions_plural',
  'kidHome.accessibility.subjectTile',
  'kidHome.accessibility.recentSession',
  'kidHome.accessibility.viewAll',
  'kidHome.firstSession.welcomeTitle',
  'kidHome.firstSession.welcomeBody',
  'kidHome.firstSession.ctaCamera',
  'kidHome.firstSession.ctaPractice',
  'kidHome.firstSession.subjectsHint',
  'kidHome.firstSession.dismiss',
  'kidHome.firstSession.accessibility.welcomeBanner',
  'kidHome.firstSession.accessibility.practiceTile',
  'kidHistory.title',
  'kidHistory.empty',
  'kidHistory.yesterday',
  'kidHistory.questions',
  'kidHistory.questions_plural',
  'kidHistory.status.completed',
  'kidHistory.status.inProgress',
  'kidHistory.status.opened',
  'kidHistory.accessibility.sessionCard',
  'modelDownload.title',
  'modelDownload.progress',
  'modelDownload.progressPercent',
  'modelDownload.retrying',
  'modelDownload.paused',
  'modelDownload.resuming',
  'modelDownload.completed',
  'modelDownload.retry',
  'modelDownload.wifiRequired',
  'modelDownload.etaTime',
  'modelDownload.speed',
  'modelDownload.pause',
  'modelDownload.resume',
  'modelDownload.cancel',
  'modelDownload.cellularWarning',
  'modelDownload.cellularProceed',
  'modelDownload.cellularCancel',
  'modelDownload.privacyNote',
  'modelDownload.whyNeeded',
  'modelDownload.verifying',
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
