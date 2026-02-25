import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

function TabBarIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const { colors } = useTheme();
  
  // Custom icon for center (home/analysis)
  if (name === 'home') {
    return (
      <View style={[
        styles.centerIcon,
        { backgroundColor: focused ? colors.primary : colors.card, borderColor: colors.border }
      ]}>
        <Svg width={28} height={28} viewBox="0 0 24 24">
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
    <View style={[styles.iconContainer, focused && { borderBottomWidth: 2, borderBottomColor: colors.primary }]}>
      <Ionicons name={iconMap[name] as any} size={24} color={color} />
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
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabsLayout />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  centerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
