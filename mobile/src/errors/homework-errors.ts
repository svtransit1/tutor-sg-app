export type HomeworkErrorCode =
  | 'LLM_TIMEOUT'
  | 'CAMERA_PERMISSION_DENIED'
  | 'OCR_FAILURE'
  | 'MODEL_NOT_DOWNLOADED'

export class HomeworkLLMTimeoutError extends Error {
  public readonly code: 'LLM_TIMEOUT' = 'LLM_TIMEOUT'

  constructor() {
    super('The AI tutor is taking too long to respond.')
    this.name = 'HomeworkLLMTimeoutError'
  }
}

export class HomeworkCameraPermissionError extends Error {
  public readonly code: 'CAMERA_PERMISSION_DENIED' = 'CAMERA_PERMISSION_DENIED'

  constructor() {
    super('Camera access is needed to snap homework.')
    this.name = 'HomeworkCameraPermissionError'
  }
}

export class HomeworkOCRError extends Error {
  public readonly code: 'OCR_FAILURE' = 'OCR_FAILURE'

  constructor(
    message?: string,
    public readonly failedItemCount: number = 0,
  ) {
    super(message ?? 'Cannot read the homework. Please try again.')
    this.name = 'HomeworkOCRError'
  }
}

export class HomeworkModelNotDownloadedError extends Error {
  public readonly code: 'MODEL_NOT_DOWNLOADED' = 'MODEL_NOT_DOWNLOADED'

  constructor() {
    super('The AI tutor model has not been downloaded yet.')
    this.name = 'HomeworkModelNotDownloadedError'
  }
}

export function getHomeworkErrorCode(
  error: unknown,
): HomeworkErrorCode | null {
  if (error instanceof HomeworkLLMTimeoutError) return 'LLM_TIMEOUT'
  if (error instanceof HomeworkCameraPermissionError)
    return 'CAMERA_PERMISSION_DENIED'
  if (error instanceof HomeworkOCRError) return 'OCR_FAILURE'
  if (error instanceof HomeworkModelNotDownloadedError)
    return 'MODEL_NOT_DOWNLOADED'
  return null
}

export function isHomeworkError(error: unknown): boolean {
  return getHomeworkErrorCode(error) !== null
}
