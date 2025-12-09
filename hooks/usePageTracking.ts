import { useEffect } from 'react';
import { analytics } from '../firebaseConfig';
import { logEvent } from 'firebase/analytics';

/**
 * Hook to track screen/page views in Firebase Analytics.
 * @param pageName The name of the screen to track (e.g., 'Home', 'Login', 'Onboarding_Age')
 */
export const usePageTracking = (pageName: string) => {
    useEffect(() => {
        try {
            logEvent(analytics, 'screen_view', {
                firebase_screen: pageName,
                screen_name: pageName
            });
            // Also log a custom event for easier filtering if needed
            logEvent(analytics, 'page_view', {
                page_title: pageName
            });
        } catch (error) {
            console.warn("Analytics Error:", error);
        }
    }, [pageName]);
};