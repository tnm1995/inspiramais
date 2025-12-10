
import React, { useState, useEffect } from 'react';
import { useUserData } from '../../context/UserDataContext';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { TopicsScreen } from './screens/TopicsScreen';
import { SourceScreen } from './screens/SourceScreen';
import { AgeScreen } from './screens/AgeScreen';
import { RelationshipScreen } from './screens/RelationshipScreen';
import { ChildrenScreen } from './screens/ChildrenScreen'; // Nova tela
import { ReligiousScreen } from './screens/ReligiousScreen';
import { BeliefsScreen } from './screens/BeliefsScreen';
import { ZodiacScreen } from './screens/ZodiacScreen';
import { ImprovementScreen } from './screens/ImprovementScreen';
import { AppGoalsScreen } from './screens/AppGoalsScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { PersonalizeIntro3 } from './screens/PersonalizeIntro3';
import { FeelingScreen } from './screens/FeelingScreen';
import { FeelingReasonScreen } from './screens/FeelingReasonScreen';
import { LandingPage } from '../landing/LandingPage';
import { usePageTracking } from '../../hooks/usePageTracking';


export enum OnboardingStep {
    Landing,
    Welcome,
    Source,
    Age,
    // Gender removed
    Relationship,
    Children, // Nova Etapa
    Religious,
    Beliefs,
    Zodiac,
    PersonalizeIntro3, // Global personalization intro
    Feeling,           // About current feeling
    FeelingReason,     // Reason for feeling
    Improvement,       // Actual improvement areas
    AppGoals,          // App specific goals
    Goals,             // General goals
    Topics,            // Actual topics selection
}

// Map steps to URL slugs
const STEP_URLS: Record<number, string> = {
    [OnboardingStep.Landing]: '/ladingpage',
    [OnboardingStep.Welcome]: '/onboarding/welcome',
    [OnboardingStep.Source]: '/onboarding/source',
    [OnboardingStep.Age]: '/onboarding/age',
    [OnboardingStep.Relationship]: '/onboarding/relationship',
    [OnboardingStep.Children]: '/onboarding/children',
    [OnboardingStep.Religious]: '/onboarding/religious',
    [OnboardingStep.Beliefs]: '/onboarding/beliefs',
    [OnboardingStep.Zodiac]: '/onboarding/zodiac',
    [OnboardingStep.PersonalizeIntro3]: '/onboarding/intro',
    [OnboardingStep.Feeling]: '/onboarding/feeling',
    [OnboardingStep.FeelingReason]: '/onboarding/feeling-reason',
    [OnboardingStep.Improvement]: '/onboarding/improvement',
    [OnboardingStep.AppGoals]: '/onboarding/app-goals',
    [OnboardingStep.Goals]: '/onboarding/goals',
    [OnboardingStep.Topics]: '/onboarding/topics'
};

// Reverse map for initial load
const URL_TO_STEP: Record<string, OnboardingStep> = Object.entries(STEP_URLS).reduce((acc, [step, url]) => {
    acc[url] = Number(step);
    return acc;
}, {} as Record<string, OnboardingStep>);

interface OnboardingFlowProps {
    onLoginClick: () => void;
    onShowTerms?: () => void;
    onShowPrivacy?: () => void;
    initialStep?: OnboardingStep;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onLoginClick, onShowTerms, onShowPrivacy, initialStep }) => {
    const [history, setHistory] = useState<OnboardingStep[]>([initialStep || OnboardingStep.Landing]);
    const { updateUserData } = useUserData();

    const step = history[history.length - 1];

    // Track onboarding steps as pages with hierarchical URL format
    usePageTracking(`/onboarding/${OnboardingStep[step].toLowerCase()}`);

    // Sync URL on Mount
    useEffect(() => {
        if (initialStep !== undefined) return; // If manually set, ignore URL

        const path = window.location.pathname;
        const mappedStep = URL_TO_STEP[path];
        
        if (mappedStep !== undefined && mappedStep !== OnboardingStep.Landing) {
            setHistory([OnboardingStep.Landing, mappedStep]);
        }
    }, [initialStep]);

    // Handle Browser Back Button
    useEffect(() => {
        const handlePopState = () => {
             const path = window.location.pathname;
             const mappedStep = URL_TO_STEP[path];

             if (mappedStep !== undefined) {
                 // We found a valid step for this URL. 
                 // We should ideally reconstruct history, but for simple back navigation,
                 // checking if it's the previous step in our local history is enough.
                 setHistory(prev => {
                     // If going back
                     if (prev.length > 1 && prev[prev.length - 2] === mappedStep) {
                         return prev.slice(0, -1);
                     }
                     // If strictly jumping (deep link or forward), reset or push
                     // For safety, let's just set it as current, keeping Landing as base if needed
                     return [OnboardingStep.Landing, mappedStep];
                 });
             } else if (path === '/ladingpage' || path === '/') {
                 setHistory([OnboardingStep.Landing]);
             }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const updateUrl = (newStep: OnboardingStep) => {
        const url = STEP_URLS[newStep];
        if (url && !window.location.href.includes('blob:')) {
            try {
                window.history.pushState({}, '', url);
            } catch (e) {
                // Ignore in restricted environments
            }
        }
    };

    const next = () => {
        const nextStep = step + 1;
        setHistory(prev => [...prev, nextStep]);
        updateUrl(nextStep);
    };

    const back = () => {
        if (history.length > 1) {
            // Use browser history to go back if possible to keep sync
            if (!window.location.href.includes('blob:')) {
                window.history.back();
            } else {
                // Fallback for preview
                setHistory(prev => prev.slice(0, -1));
            }
        }
    };

    const goToStep = (targetStep: OnboardingStep) => {
        setHistory(prev => [...prev, targetStep]);
        updateUrl(targetStep);
    }
    
    const finishOnboarding = () => {
        // Mark mood checkin as done for today so the main app doesn't ask immediately
        localStorage.setItem('inspiraMoodCheckin', new Date().getTime().toString());
        updateUserData({ onboardingComplete: true });
        
        // Reset URL to home without pushing, to avoid back-button to onboarding
        if (!window.location.href.includes('blob:')) {
            window.history.replaceState({}, '', '/home');
        }
    };

    const handleReligiousChoice = (choice: string) => {
        updateUserData({ isReligious: choice });
        if (choice === 'Sim' || choice === 'Espiritual, mas não religioso') {
            goToStep(OnboardingStep.Beliefs);
        } else {
            goToStep(OnboardingStep.PersonalizeIntro3);
        }
    };

    // Calculation total steps slightly approximate due to branching
    const totalSteps = 16;
    const progress = (step / totalSteps) * 100;

    const renderStep = () => {
        switch (step) {
            case OnboardingStep.Landing: return <LandingPage onGetStarted={next} onLoginClick={onLoginClick} onShowTerms={onShowTerms} onShowPrivacy={onShowPrivacy} />;
            case OnboardingStep.Welcome: return <WelcomeScreen onNext={next} progress={progress} />;
            case OnboardingStep.Source: return <SourceScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Age: return <AgeScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Relationship: return <RelationshipScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Children: return <ChildrenScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Religious: return <ReligiousScreen onNext={handleReligiousChoice} onBack={back} progress={progress} />;
            case OnboardingStep.Beliefs: return <BeliefsScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Zodiac: return <ZodiacScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.PersonalizeIntro3: return <PersonalizeIntro3 onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Feeling: return <FeelingScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.FeelingReason: return <FeelingReasonScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Improvement: return <ImprovementScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.AppGoals: return <AppGoalsScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Goals: return <GoalsScreen onNext={next} onBack={back} progress={progress} />;
            case OnboardingStep.Topics: return <TopicsScreen onNext={finishOnboarding} onBack={back} progress={progress} />;
            default: return <div>Step not found</div>;
        }
    };

    return (
        <div className="h-full w-full bg-gray-50 text-gray-800">
            {renderStep()}
        </div>
    );
};
