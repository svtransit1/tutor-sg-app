require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'TutorSgOcr'
  s.version        = package['version']
  s.summary        = 'On-device OCR module using Apple Vision (iOS) and ML Kit (Android)'
  s.description    = package['description'] || s.summary
  s.license        = 'UNLICENSED'
  s.author         = 'Agent as a Service Pte. Ltd.'
  s.homepage       = 'https://github.com/aaas-pte-ltd/tutor-sg-app'
  s.platforms      = { :ios => '16.0' }
  s.source         = { :git => 'https://github.com/aaas-pte-ltd/tutor-sg-app.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,swift}"
end
