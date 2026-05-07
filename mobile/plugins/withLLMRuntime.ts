import { withDangerousMod, withPodfileProperties, type ConfigPlugin } from '@expo/config-plugins'
import * as fs from 'node:fs'
import * as path from 'node:path'
const withLLMRuntime: ConfigPlugin = (config) => {
  config = withDangerousMod(config, [
    'android',
    async (m) => {
      const dst = path.resolve(
        m.modRequest.projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        'com',
        'aaas',
        'tutorsg',
        'llm',
      )
      fs.mkdirSync(dst, { recursive: true })
      for (const f of ['LLMRuntimeModule.java', 'LLMRuntimePackage.java']) {
        const src = path.resolve(
          __dirname,
          '..',
          'android',
          'app',
          'src',
          'main',
          'java',
          'com',
          'aaas',
          'tutorsg',
          'llm',
          f,
        )
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dst, f))
      }
      return m
    },
  ])
  config = withDangerousMod(config, [
    'ios',
    async (m) => {
      const dst = path.resolve(m.modRequest.projectRoot, 'ios', 'LLMRuntime')
      fs.mkdirSync(dst, { recursive: true })
      for (const f of ['LLMRuntimeModule.h', 'LLMRuntimeModule.m']) {
        const src = path.resolve(__dirname, '..', 'ios', 'LLMRuntime', f)
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dst, f))
      }
      return m
    },
  ])
  config = withPodfileProperties(config, (p) => ({
    ...p,
    podfileProperties: { ...p.podfileProperties, LLM_RUNTIME_ENABLED: '1' },
  }))
  return config
}
export default withLLMRuntime
