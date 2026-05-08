/** Mock for expo-crypto — used in model-download tests. */

export const CryptoDigestAlgorithm = { SHA256: 'sha256' };
export const CryptoEncoding = { HEX: 'hex' };

let _mockHash = 'a'.repeat(64); // default "valid" hash

export function __setMockHash(hash: string) {
  _mockHash = hash;
}

export function __resetMockHash() {
  _mockHash = 'a'.repeat(64);
}

export async function digestStringAsync(
  _algorithm: string,
  _input: string,
  _options?: { encoding?: string }
): Promise<string> {
  return _mockHash;
}
