Pod::Spec.new do |s|
  s.name           = 'DeviceTierModule'
  s.version        = '0.1.0'
  s.summary        = 'Device tier detection native module'
  s.description    = 'Detects device RAM, chipset, and NPU availability'
  s.homepage       = 'https://github.com/aaas/tutor-sg'
  s.author         = 'AaaS'
  s.license        = 'MIT'
  s.platforms      = { ios: '16.0' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.swift_version  = '5.4'
  s.source_files   = '*.swift'
end
