export const CryptoDigestAlgorithm = { SHA256: 'sha256' };
export const CryptoEncoding = { HEX: 'hex' };

let _mockHash = 'a'.repeat(64);
export function __setMockHash(hash: string) { _mockHash = hash; }
export function __resetMockHash() { _mockHash = 'a'.repeat(64); }

export async function digestStringAsync(_algorithm: string, _input: string, _options?: { encoding?: string }): Promise<string> {
  return _mockHash;
}

export const getRandomBytes = jest.fn().mockReturnValue(Buffer.alloc(32));
export const randomUUID = jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000000');
export const digest = jest.fn().mockResolvedValue(Buffer.alloc(32));

export default { CryptoDigestAlgorithm, CryptoEncoding, digestStringAsync, getRandomBytes, randomUUID, digest, __setMockHash, __resetMockHash };
