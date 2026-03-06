import React from 'react';
import LottieView, { AnimationObject } from 'lottie-react-native';
import { ViewStyle } from 'react-native';

interface LottieAnimationProps {
    source: string | AnimationObject | { uri: string };
    style?: ViewStyle;
    autoPlay?: boolean;
    loop?: boolean;
}

export function LottieAnimation({ source, style, autoPlay = true, loop = true }: LottieAnimationProps) {
    return (
        <LottieView
            source={source}
            autoPlay={autoPlay}
            loop={loop}
            style={style}
        />
    );
}
