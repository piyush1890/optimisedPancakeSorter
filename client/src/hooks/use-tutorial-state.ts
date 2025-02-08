import { useState, useEffect } from 'react';

interface TutorialState {
  [key: string]: boolean; // Allow any level completion state
}

const TUTORIAL_STORAGE_KEY = 'pancakeGameTutorial';

const getInitialState = (): TutorialState => {
  // Always start with uncompleted tutorial state
  localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  return {};
};

export function useTutorialState() {
  const [tutorialState, setTutorialState] = useState<TutorialState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(tutorialState));
  }, [tutorialState]);

  const completeTutorial = (level: number) => {
    console.log('Completing tutorial for level:', level);
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