import { useRouter } from 'expo-router';
import ModelDownloadScreen from '../../src/screens/ModelDownloadScreen';

export default function ModelDownloadRoute() {
  const router = useRouter();
  return (
    <ModelDownloadScreen
      onComplete={() => router.replace('/(kid)/')}
      onBack={() => router.back()}
    />
  );
}
