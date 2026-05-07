import React, { useCallback } from 'react';
import GradeSubjectPickScreen from '../../src/screens/onboarding/GradeSubjectPickScreen';
import { useOnboarding } from '../../src/onboarding';
import { persistGrade, persistSubjects } from '../../src/storage/onboarding-state';
import type { Grade, SubjectId } from '../../src/storage/onboarding-state';

export default function GradeSubjectPickRoute() {
  const { updateState, goNext } = useOnboarding();

  const handleComplete = useCallback(
    (grade: Grade, subjects: SubjectId[]) => {
      updateState({
        grade,
        subjects: subjects as Array<'math' | 'english' | 'chinese' | 'science'>,
      });
      persistGrade(grade);
      persistSubjects(subjects);
      goNext();
    },
    [updateState, goNext],
  );

  return <GradeSubjectPickScreen onComplete={handleComplete} />;
}
