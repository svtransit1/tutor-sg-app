import { useRouter } from 'expo-router';
import KidProfileScreen from '../../src/screens/onboarding/KidProfileScreen';

export default function KidProfileRoute() {
  const router = useRouter();

  const handleComplete = () => {
    router.replace('/(onboarding)/privacy-promise');
  };

  const handleSkip = () => {
    router.replace('/(onboarding)/privacy-promise');
  };

  return <KidProfileScreen onComplete={handleComplete} onSkip={handleSkip} />;
}
