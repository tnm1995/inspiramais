
import { useState, useEffect, useCallback } from 'react';

export const useRouter = () => {
    // Initialize state from window location, default to /landing if empty
    const getHashPath = () => {
        const hash = window.location.hash.replace('#', '');
        return hash || '/landing';
    };

    const [route, setRoute] = useState(getHashPath());

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(getHashPath());
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const push = useCallback((path: string) => {
        window.location.hash = path;
    }, []);

    const replace = useCallback((path: string) => {
        const currentUrl = window.location.href.split('#')[0];
        window.location.replace(`${currentUrl}#${path}`);
    }, []);

    const back = useCallback(() => {
        window.history.back();
    }, []);

    return { route, push, replace, back };
};
