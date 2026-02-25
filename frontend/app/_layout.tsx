import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';

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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabsLayout />
    </ThemeProvider>
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
