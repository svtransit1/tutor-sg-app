export const ModelDownloadErrorCode = {
  NETWORK_LOST: 'connectivity_lost',
  CDN_UNREACHABLE: 'cdn_unreachable',
  HASH_MISMATCH: 'hash_mismatch',
  DISK_FULL: 'disk_insufficient',
  DOWNLOAD_STUCK: 'download_stuck',
  UNKNOWN: 'unknown_error',
} as const;

export type ModelDownloadErrorCode =
  (typeof ModelDownloadErrorCode)[keyof typeof ModelDownloadErrorCode];

const RETRYABLE_CODES: Set<ModelDownloadErrorCode> = new Set([
  ModelDownloadErrorCode.NETWORK_LOST,
  ModelDownloadErrorCode.CDN_UNREACHABLE,
  ModelDownloadErrorCode.HASH_MISMATCH,
  ModelDownloadErrorCode.DOWNLOAD_STUCK,
]);

export class ModelDownloadError extends Error {
  readonly code: ModelDownloadErrorCode;
  readonly retryable: boolean;
  readonly recoverableBytes: number;

  constructor(
    code: ModelDownloadErrorCode,
    message: string,
    recoverableBytes: number = 0,
  ) {
    super(message);
    this.name = 'ModelDownloadError';
    this.code = code;
    this.retryable = RETRYABLE_CODES.has(code);
    this.recoverableBytes = recoverableBytes;
  }
}

export function networkLostError(
  message: string = 'Wi-Fi connection lost. Download will resume when reconnected.',
  recoverableBytes: number = 0,
): ModelDownloadError {
  return new ModelDownloadError(
    ModelDownloadErrorCode.NETWORK_LOST,
    message,
    recoverableBytes,
  );
}

export function cdnUnreachableError(
  message: string = 'Cannot reach server. Please check your internet connection and try again.',
): ModelDownloadError {
  return new ModelDownloadError(
    ModelDownloadErrorCode.CDN_UNREACHABLE,
    message,
  );
}

export function hashMismatchError(
  message: string = 'Download file corrupted. Re-downloading…',
): ModelDownloadError {
  return new ModelDownloadError(
    ModelDownloadErrorCode.HASH_MISMATCH,
    message,
  );
}

export function diskFullError(
  neededBytes: number,
  message?: string,
): ModelDownloadError {
  return new ModelDownloadError(
    ModelDownloadErrorCode.DISK_FULL,
    message ?? `Not enough storage space. Need about ${(neededBytes / 1e9).toFixed(1)}GB free.`,
  );
}

export function downloadStuckError(
  message: string = 'Download seems stuck. Retrying…',
  recoverableBytes: number = 0,
): ModelDownloadError {
  return new ModelDownloadError(
    ModelDownloadErrorCode.DOWNLOAD_STUCK,
    message,
    recoverableBytes,
  );
}

export function unknownDownloadError(
  cause: string,
): ModelDownloadError {
  return new ModelDownloadError(
    ModelDownloadErrorCode.UNKNOWN,
    `Something went wrong: ${cause}`,
  );
}

export function i18nKeyForError(code: ModelDownloadErrorCode): string {
  return `modelDownload.errors.${code}`;
}
