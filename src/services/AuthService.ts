import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
    id: string;
    email: string;
    name: string;
}

const USER_STORAGE_KEY = '@soccer_ai_user';

export const AuthService = {
    login: async (email: string, password: string): Promise<User> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo purposes, any login works
        const mockUser: User = {
            id: '1',
            email: email,
            name: 'Demo User',
        };

        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        return mockUser;
    },

    register: async (email: string, password: string, name: string): Promise<User> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
            id: Math.random().toString(36).substring(7),
            email: email,
            name: name,
        };

        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        return mockUser;
    },

    logout: async (): Promise<void> => {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
    },

    getUser: async (): Promise<User | null> => {
        const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        return userData ? JSON.parse(userData) : null;
    },
};
