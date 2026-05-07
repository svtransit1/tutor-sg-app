import { describe, it, expect } from '@jest/globals'
import { createEnv, validateEnv } from '../../src/config/env'
describe('shared/config/env', () => {
  describe('createEnv', () => {
    it('defaults APP_ENV to development', () => {
      const cfg = createEnv()
      expect(cfg.APP_ENV).toBe('development')
    })
    it('defaults ENABLE_DEV_TOOLS to false', () => {
      const cfg = createEnv()
      expect(cfg.ENABLE_DEV_TOOLS).toBe(false)
    })
    it('defaults LOG_LEVEL to info', () => {
      const cfg = createEnv()
      expect(cfg.LOG_LEVEL).toBe('info')
    })
    it('has CDN_BASE_URL with a default', () => {
      const cfg = createEnv()
      expect(cfg.CDN_BASE_URL).toBe('https://cdn.example.com/models/')
    })
    it('picks up EXPO_PUBLIC_ prefix', () => {
      process.env['EXPO_PUBLIC_APP_ENV'] = 'staging'
      const cfg = createEnv()
      expect(cfg.APP_ENV).toBe('staging')
      delete process.env['EXPO_PUBLIC_APP_ENV']
    })
    it('applies overrides', () => {
      const cfg = createEnv({ APP_ENV: 'production' })
      expect(cfg.APP_ENV).toBe('production')
    })
  })
  describe('validateEnv', () => {
    it('returns errors for placeholder values', () => {
      const cfg = createEnv()
      const errors = validateEnv(cfg)
      expect(errors.length).toBeGreaterThanOrEqual(2)
    })
    it('returns no errors when fully configured', () => {
      const good = createEnv({
        SUPABASE_URL: 'https://abcd.supabase.co',
        SUPABASE_ANON_KEY: 'real-key',
        CDN_BASE_URL: 'https://cdn.real.dev/models/',
      })
      const errors = validateEnv(good)
      expect(errors).toHaveLength(0)
    })
  })
})
