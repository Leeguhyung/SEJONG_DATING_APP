import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Rect, Path, G, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 100, style }) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        {/* 배경: 부드러운 코랄-핑크 그라데이션 */}
        <Rect width="512" height="512" rx="120" fill="url(#bg_grad)" />
        
        {/* 하트: 깨끗한 화이트 본체 */}
        <Path 
          d="M256 440C256 440 80 340 80 190C80 120 140 80 200 80C230 80 256 100 256 100C256 100 282 80 312 80C372 80 432 120 432 190C432 340 256 440 256 440Z" 
          fill="white" 
        />

        {/* 학사모: 하트 중앙 배치 */}
        <G transform="translate(256, 230)">
          {/* 모자 상판 (Diamond) */}
          <Path 
            d="M0 -50L100 0L0 50L-100 0Z" 
            fill="#D29793" 
            stroke="#D29793" 
            strokeWidth="2" 
            strokeLinejoin="round"
          />
          {/* 모자 본체 (Base) */}
          <Path 
            d="M-50 20V50C-50 50 -25 65 0 65C25 65 50 50 50 50V20" 
            fill="#D29793" 
          />
          {/* 수슬 (Tassel): 길이를 절반으로 단축 */}
          <Path 
            d="M100 0V35C100 35 98 45 110 45" 
            stroke="#FFD700" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Circle cx="110" cy="48" r="8" fill="#FFD700" />
        </G>

        <Defs>
          <LinearGradient id="bg_grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#D29793" />
            <Stop offset="1" stopColor="#FF4D6D" />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};
