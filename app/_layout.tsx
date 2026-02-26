import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '../src/hooks/useColorScheme';
import { ThemeProvider as AppThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function TabBarIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
    const { colors } = useTheme();

    // Custom icon for center (home/analysis)
    if (name === 'home') {
        return (
            <View style={[
                styles.centerIcon,
                { backgroundColor: focused ? colors.primary : colors.card, borderColor: colors.border }
            ]}>
                <Svg width={32} height={32} viewBox="0 0 24 24">
                    <Path
                        d="M12 2L9 9L2 12L9 15L12 22L15 15L22 12L15 9L12 2Z"
                        fill={focused ? '#FFFFFF' : colors.primary}
                        stroke={focused ? '#FFFFFF' : colors.primary}
                        strokeWidth="1"
                    />
                </Svg>
            </View>
        );
    }

    const iconMap: { [key: string]: string } = {
        combinations: 'layers-outline',
        stats: 'stats-chart-outline',
    };

    return (
        <View style={[styles.iconContainer, focused && { borderBottomWidth: 3, borderBottomColor: colors.primary, paddingBottom: 8 }]}>
            <Ionicons name={iconMap[name] as any} size={28} color={color} />
        </View>
    );
}

function TabsLayout() {
    const { theme, colors } = useTheme();

    return (
        <>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        right: 20,
                        backgroundColor: colors.card,
                        borderRadius: 30,
                        height: 80,
                        paddingBottom: 0,
                        paddingTop: 0,
                        borderTopWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        elevation: 10,
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textMuted,
                    tabBarShowLabel: false,
                }}
            >
                <Tabs.Screen
                    name="combinations"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon name="combinations" color={color} focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon name="home" color={color} focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="stats"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <TabBarIcon name="stats" color={color} focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="match/[id]"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        </>
    );
}

function RootLayoutNav() {
    const { user, isLoading: authLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const colorScheme = useColorScheme();

    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded && !authLoading) {
            SplashScreen.hideAsync();
        }
    }, [loaded, authLoading]);

    useEffect(() => {
        if (authLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            router.replace('/');
        }
    }, [user, authLoading, segments]);

    if (!loaded || authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <AppThemeProvider>
                <RootLayoutNav />
            </AppThemeProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    centerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -30,
        borderWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
});
