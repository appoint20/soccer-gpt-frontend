import React, { useEffect, useState } from 'react';
import { ViewStyle, View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';

interface LottieAnimationProps {
    source: any;
    style?: ViewStyle;
    autoPlay?: boolean;
    loop?: boolean;
}

export function LottieAnimation({ source, style, autoPlay = true, loop = true }: LottieAnimationProps) {
    const [PlayerLib, setPlayerLib] = useState<any>(null);

    useEffect(() => {
        // Dynamically require strictly on the client side to avoid "document is not defined" SSR errors during Expo Web build
        try {
            const module = require('@lottiefiles/react-lottie-player');
            setPlayerLib(() => module.Player);
        } catch (err) {
            console.error("Failed to load Lottie web player:", err);
        }
    }, []);

    if (!PlayerLib) {
        // Fallback loading indicator while the Lottie library chunks load dynamically
        return (
            <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <PlayerLib
            src={source}
            autoplay={autoPlay}
            loop={loop}
            style={style as any}
        />
    );
}
