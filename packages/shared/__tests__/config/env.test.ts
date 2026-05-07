import { createEnv, validateEnv } from '../../src/config/env'

let passed = 0
let failed = 0
function assert(c: boolean, msg: string) {
  if (c) {
    console.log('  ✓ ' + msg)
    passed++
  } else {
    console.error('  ✗ ' + msg)
    failed++
  }
}
function assertThrows(fn: () => unknown, msg: string) {
  try {
    fn()
    console.error('  ✗ ' + msg + ' — no throw')
    failed++
  } catch {
    console.log('  ✓ ' + msg)
    passed++
  }
}

console.log('\ncreateEnv — defaults')
{
  const cfg = createEnv()
  assert(cfg.APP_ENV === 'development', 'APP_ENV defaults to development')
  assert(cfg.ENABLE_DEV_TOOLS === false, 'ENABLE_DEV_TOOLS defaults false')
  assert(cfg.LOG_LEVEL === 'info', 'LOG_LEVEL defaults to info')
  assert(cfg.CDN_BASE_URL === 'https://cdn.example.com/models/', 'CDN_BASE_URL has default')
}

console.log('\ncreateEnv — EXPO_PUBLIC_ prefix')
{
  process.env['EXPO_PUBLIC_APP_ENV'] = 'staging'
  process.env['EXPO_PUBLIC_ENABLE_DEV_TOOLS'] = 'true'
  process.env['EXPO_PUBLIC_CDN_BASE_URL'] = 'https://cdn.test.dev/models/'
  const cfg = createEnv()
  assert(cfg.APP_ENV === 'staging', 'picks up EXPO_PUBLIC_APP_ENV')
  assert(cfg.ENABLE_DEV_TOOLS === true, 'parses true')
  assert(cfg.CDN_BASE_URL === 'https://cdn.test.dev/models/', 'picks up CDN URL')
  delete process.env['EXPO_PUBLIC_APP_ENV']
  delete process.env['EXPO_PUBLIC_ENABLE_DEV_TOOLS']
  delete process.env['EXPO_PUBLIC_CDN_BASE_URL']
}

console.log('\ncreateEnv — overrides')
{
  const cfg = createEnv({ APP_ENV: 'production', SUPABASE_URL: 'https://real.supabase.co' })
  assert(cfg.APP_ENV === 'production', 'overrides APP_ENV')
  assert(cfg.SUPABASE_URL === 'https://real.supabase.co', 'overrides SUPABASE_URL')
}

console.log('\ncreateEnv — validation')
{
  assertThrows(
    () => createEnv({ APP_ENV: 'no_such_env' as 'development' }),
    'throws on invalid APP_ENV',
  )
}

console.log('\nvalidateEnv')
{
  const cfg = createEnv()
  const errors = validateEnv(cfg)
  assert(errors.length >= 2, 'returns errors for placeholders')
  assert(
    errors.some((e) => e.includes('Supabase URL')),
    'flags missing Supabase URL',
  )
  assert(
    errors.some((e) => e.includes('Supabase anon key')),
    'flags missing Supabase anon key',
  )

  const good = createEnv({
    SUPABASE_URL: 'https://abcd.supabase.co',
    SUPABASE_ANON_KEY: 'real-key',
    CDN_BASE_URL: 'https://cdn.real.dev/models/',
  })
  const noErrors = validateEnv(good)
  assert(noErrors.length === 0, 'returns no errors when configured')
}

console.log('\n' + '─'.repeat(40))
console.log('Results: ' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) process.exit(1)
