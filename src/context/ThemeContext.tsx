import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from '../hooks/useColorScheme';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    colors: any;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>(systemColorScheme || 'dark');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const colors = theme === 'dark' ? {
        background: '#0F172A',
        card: '#1E293B',
        primary: '#38BDF8',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
        border: '#334155',
        divider: '#1E293B',
        success: '#10B981',
        error: '#EF4444',
    } : {
        background: '#F8FAFC',
        card: '#FFFFFF',
        primary: '#0EA5E9',
        text: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#94A3B8',
        border: '#E2E8F0',
        divider: '#F1F5F9',
        success: '#059669',
        error: '#DC2626',
    };

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
