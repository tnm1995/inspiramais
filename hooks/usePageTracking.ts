import { useEffect } from 'react';
import { analytics } from '../firebaseConfig';
import { logEvent, Analytics } from "firebase/analytics";

/**
 * Hook to track screen/page views in Firebase Analytics.
 * @param pageName The name of the screen to track (e.g., 'Home', 'Login', 'Onboarding_Age')
 */
export const usePageTracking = (pageName: string) => {
    useEffect(() => {
        try {
            if (analytics) {
                // Explicitly cast to Analytics to fix types
                const analyticsInstance = analytics as Analytics;

                // Cast event name to 'any' to bypass strict overload matching that causes 'never' type error
                logEvent(analyticsInstance, 'screen_view' as any, {
                    firebase_screen_class: pageName,
                    firebase_screen_name: pageName
                });
                // Also log a custom event for easier filtering if needed
                logEvent(analyticsInstance, 'page_view' as any, {
                    page_title: pageName
                });
            }
        } catch (error) {
            console.warn("Analytics Error:", error);
        }
    }, [pageName]);
};