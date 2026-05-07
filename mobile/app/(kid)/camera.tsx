import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { useCameraPermissions } from '@/hooks/useCameraPermissions';

type Stage = 'idle' | 'capturing' | 'error';

export default function CameraScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const { permission: permState, requestPermission, openSettings, isRequesting } = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const mountedRef = useRef(true);

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const [permReq, setPermReq] = useState(false);
  useEffect(() => {
    if (permState === 'denied' && !permReq) { setPermReq(true); requestPermission(); }
  }, [permState, permReq, requestPermission]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      setStage('capturing');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      if (!photo?.uri) throw new Error('Failed to capture photo');
      Alert.alert('Photo captured', `URI: ${photo.uri.substring(0, 50)}...`);
      setStage('idle');
    } catch {
      Alert.alert(t('cameraScreen.error.title'), t('cameraScreen.error.captureFailed'));
      setStage('idle');
    }
  }, [t]);

  if (permState !== 'granted') {
    return (
      <View style={[s.container, s.center, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
        {permState === 'loading' ? (
          <ActivityIndicator size="large" color={isDark ? '#90CAF9' : '#4A90D9'} />
        ) : permState === 'blocked' ? (
          <>
            <Text style={[s.title, { color: isDark ? '#FFF' : '#1A1A1A' }]}>{t('cameraScreen.permissionBlocked.title')}</Text>
            <Text style={[s.body, { color: isDark ? '#888' : '#6B7280' }]}>{t('cameraScreen.permissionBlocked.description')}</Text>
            <TouchableOpacity style={[s.btn, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]} onPress={openSettings} accessibilityRole="button" accessibilityLabel={t('cameraScreen.permissionBlocked.cta')}>
              <Text style={s.btnText}>{t('cameraScreen.permissionBlocked.cta')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[s.title, { color: isDark ? '#FFF' : '#1A1A1A' }]}>{t('cameraScreen.permissionDenied.title')}</Text>
            <Text style={[s.body, { color: isDark ? '#888' : '#6B7280' }]}>{t('cameraScreen.permissionDenied.description')}</Text>
            <TouchableOpacity style={[s.btn, { backgroundColor: isDark ? '#2563EB' : '#4A90D9', opacity: isRequesting ? 0.6 : 1 }]} onPress={requestPermission} disabled={isRequesting} accessibilityRole="button" accessibilityLabel={t('cameraScreen.permissionDenied.cta')}>
              <Text style={s.btnText}>{isRequesting ? t('common.loading') : t('cameraScreen.permissionDenied.cta')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: '#000' }]}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" autofocus="on" flash="auto">
        <View style={[s.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('cameraScreen.accessibility.cancel')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={s.topText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <View style={{ width: 60 }} />
        </View>
        <View style={s.captureArea}>
          <Text style={s.hintText}>{t('cameraScreen.hint.singlePage')}</Text>
        </View>
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={s.captureBtn} onPress={handleCapture} accessibilityRole="button" accessibilityLabel={t('cameraScreen.accessibility.capture')}>
            <View style={s.captureInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
      {stage === 'error' && (
        <View style={s.errorOverlay}>
          <View style={[s.errorCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <Text style={s.errorIcon}>😅</Text>
            <Text style={[s.errorTitle, { color: isDark ? '#FFF' : '#1A1A1A' }]}>{t('cameraScreen.error.title')}</Text>
            <TouchableOpacity style={[s.btn, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]} onPress={() => setStage('idle')} accessibilityRole="button">
              <Text style={s.btnText}>{t('cameraScreen.error.retake')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  topText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  captureArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  hintText: { color: '#FFF', fontSize: 15, textAlign: 'center', opacity: 0.7, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, overflow: 'hidden' },
  bottomBar: { alignItems: 'center', paddingHorizontal: 16 },
  captureBtn: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFF' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  body: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  btn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  errorOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  errorCard: { padding: 32, borderRadius: 20, alignItems: 'center', gap: 12, minWidth: 260 },
  errorIcon: { fontSize: 48 },
  errorTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
});
