import {
  ModelDownloadError,
  ModelDownloadErrorCode,
  networkLostError,
  cdnUnreachableError,
  hashMismatchError,
  diskFullError,
  downloadStuckError,
  unknownDownloadError,
  i18nKeyForError,
} from '../model-download-errors';

describe('ModelDownloadError', () => {
  it('has the correct name', () => {
    const e = new ModelDownloadError(ModelDownloadErrorCode.UNKNOWN, 'test');
    expect(e.name).toBe('ModelDownloadError');
  });

  it('sets retryable true for network errors', () => {
    const e = networkLostError();
    expect(e.retryable).toBe(true);
  });

  it('sets retryable true for cdn unreachable', () => {
    const e = cdnUnreachableError();
    expect(e.retryable).toBe(true);
  });

  it('sets retryable true for hash mismatch', () => {
    const e = hashMismatchError();
    expect(e.retryable).toBe(true);
  });

  it('sets retryable false for disk full', () => {
    const e = diskFullError(5e9);
    expect(e.retryable).toBe(false);
  });

  it('sets retryable true for download stuck', () => {
    const e = downloadStuckError();
    expect(e.retryable).toBe(true);
  });

  it('sets retryable false for unknown', () => {
    const e = unknownDownloadError('test');
    expect(e.retryable).toBe(false);
  });
});

describe('networkLostError', () => {
  it('uses provided message', () => {
    const e = networkLostError('custom msg');
    expect(e.message).toBe('custom msg');
    expect(e.code).toBe(ModelDownloadErrorCode.NETWORK_LOST);
  });

  it('stores recoverable bytes', () => {
    const e = networkLostError('lost', 12345);
    expect(e.recoverableBytes).toBe(12345);
  });
});

describe('hashMismatchError', () => {
  it('has hash_mismatch code', () => {
    const e = hashMismatchError();
    expect(e.code).toBe(ModelDownloadErrorCode.HASH_MISMATCH);
  });
});

describe('diskFullError', () => {
  it('includes needed bytes in message', () => {
    const e = diskFullError(5_000_000_000);
    expect(e.message).toContain('5.0GB');
  });

  it('is not retryable', () => {
    const e = diskFullError(1e9);
    expect(e.retryable).toBe(false);
  });
});

describe('i18nKeyForError', () => {
  it('maps connectivity_lost correctly', () => {
    expect(i18nKeyForError(ModelDownloadErrorCode.NETWORK_LOST)).toBe(
      'modelDownload.errors.connectivity_lost',
    );
  });

  it('maps hash_mismatch correctly', () => {
    expect(i18nKeyForError(ModelDownloadErrorCode.HASH_MISMATCH)).toBe(
      'modelDownload.errors.hash_mismatch',
    );
  });

  it('maps disk_insufficient correctly', () => {
    expect(i18nKeyForError(ModelDownloadErrorCode.DISK_FULL)).toBe(
      'modelDownload.errors.disk_insufficient',
    );
  });

  it('maps cdn_unreachable correctly', () => {
    expect(i18nKeyForError(ModelDownloadErrorCode.CDN_UNREACHABLE)).toBe(
      'modelDownload.errors.cdn_unreachable',
    );
  });

  it('maps download_stuck correctly', () => {
    expect(i18nKeyForError(ModelDownloadErrorCode.DOWNLOAD_STUCK)).toBe(
      'modelDownload.errors.download_stuck',
    );
  });

  it('maps unknown_error correctly', () => {
    expect(i18nKeyForError(ModelDownloadErrorCode.UNKNOWN)).toBe(
      'modelDownload.errors.unknown_error',
    );
  });
});
