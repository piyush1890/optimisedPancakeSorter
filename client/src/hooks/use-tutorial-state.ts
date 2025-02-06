import { useState, useEffect } from 'react';

interface TutorialState {
  level1Completed: boolean;
  level2Completed: boolean;
}

const TUTORIAL_STORAGE_KEY = 'pancakeGameTutorial';

const getInitialState = (): TutorialState => {
  try {
    const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { level1Completed: false, level2Completed: false };
  } catch {
    return { level1Completed: false, level2Completed: false };
  }
};

export function useTutorialState() {
  const [tutorialState, setTutorialState] = useState<TutorialState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(tutorialState));
  }, [tutorialState]);

  const completeTutorial = (level: 1 | 2) => {
    setTutorialState(prev => ({
      ...prev,
      [`level${level}Completed`]: true
    }));
  };

  return {
    tutorialState,
    completeTutorial
  };
}