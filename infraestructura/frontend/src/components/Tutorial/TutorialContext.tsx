import { createContext, useContext, useState, ReactNode } from 'react';


export interface TutorialStep {
    id: string;
    title: string;
    content: string;
    target: string; // Selector CSS del elemento a resaltar
    placement?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void; // Acción a ejecutar al avanzar
    waitForElement?: boolean; // Esperar a que el elemento exista
}

export interface Tutorial {
    id: string;
    name: string;
    steps: TutorialStep[];
}


interface TutorialContextType {
    activeTutorial: Tutorial | null;
    currentStepIndex: number;
    isActive: boolean;
    startTutorial: (tutorial: Tutorial) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTutorial: () => void;
    endTutorial: () => void;
    currentStep: TutorialStep | null;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
    const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const startTutorial = (tutorial: Tutorial) => {
        setActiveTutorial(tutorial);
        setCurrentStepIndex(0);
        setIsActive(true);
        localStorage.setItem('tutorialCompleted', 'false');
    };

    const nextStep = () => {
        if (!activeTutorial) return;
        
        const currentStep = activeTutorial.steps[currentStepIndex];
        if (currentStep.action) {
            currentStep.action();
        }

        if (currentStepIndex < activeTutorial.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            endTutorial();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const skipTutorial = () => {
        localStorage.setItem('tutorialCompleted', 'true');
        endTutorial();
    };

    const endTutorial = () => {
        setActiveTutorial(null);
        setCurrentStepIndex(0);
        setIsActive(false);
        localStorage.setItem('tutorialCompleted', 'true');
    };

    const currentStep = activeTutorial ? activeTutorial.steps[currentStepIndex] : null;

    return (
        <TutorialContext.Provider
            value={{
                activeTutorial,
                currentStepIndex,
                isActive,
                startTutorial,
                nextStep,
                prevStep,
                skipTutorial,
                endTutorial,
                currentStep
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial debe usarse dentro de TutorialProvider');
    }
    return context;
}