import { UserData } from '../types';

// Interface to simulate AdMob/AdSense SDK
interface AdNetworkInterface {
    initialize: () => void;
    showInterstitial: () => Promise<boolean>;
    isReady: boolean;
}

// Mock implementation - Replace this with actual AdMob/Google Ads logic later
const adNetwork: AdNetworkInterface = {
    isReady: false,
    initialize: () => {
        // console.log("AdService: Disabled");
    },
    showInterstitial: async () => {
        // console.log("AdService: Interstitial disabled");
        return false; 
    }
};

export const adService = {
    init: () => adNetwork.initialize(),
    
    /**
     * Checks if an ad should be shown based on user status and scroll count.
     * @param scrollCount Current number of quotes scrolled
     * @param isPremium User premium status
     * @returns boolean
     */
    shouldShowAd: (scrollCount: number, isPremium: boolean): boolean => {
        return false;
    },

    /**
     * Triggers the ad display.
     * In a real hybrid app, this might call a native bridge.
     * In a PWA, this triggers the React MockAd component.
     */
    showAd: async (): Promise<boolean> => {
        return false;
    }
};