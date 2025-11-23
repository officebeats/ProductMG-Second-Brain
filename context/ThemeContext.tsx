
import * as React from 'react';
import type { Theme } from '../types';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize state from localStorage, defaulting to 'system'
    const [theme, setThemeState] = React.useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'system';
    });

    // Effect to apply the theme class and listen for system changes
    React.useEffect(() => {
        const root = window.document.documentElement;
        
        const applyTheme = (t: Theme) => {
            const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme(theme); // Apply theme on mount and when `theme` state changes.

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = () => {
            // Re-apply theme only if the user's preference is 'system'
            const currentTheme = localStorage.getItem('theme');
            if (currentTheme === 'system' || !currentTheme) {
                 applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('theme', newTheme);
        setThemeState(newTheme);
    };
    
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = React.useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
