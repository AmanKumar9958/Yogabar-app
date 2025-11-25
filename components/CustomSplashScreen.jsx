import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function CustomSplashScreen() {
  return (
    <View className="flex-1 bg-[#FFF9E9] items-center justify-center relative">
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      {/* Top Right Circle */}
      <View 
        className="absolute top-0 right-0 bg-[#FFC107]"
        style={{
          width: width * 0.7,
          height: width * 0.7,
          borderBottomLeftRadius: width * 0.5,
          transform: [{ translateX: width * 0.15 }, { translateY: -width * 0.15 }]
        }}
      />

      {/* Bottom Left Circle */}
      <View 
        className="absolute bottom-0 left-0 bg-[#FFC107]"
        style={{
          width: width * 0.7,
          height: width * 0.7,
          borderTopRightRadius: width * 0.5,
          transform: [{ translateX: -width * 0.15 }, { translateY: width * 0.15 }]
        }}
      />

      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: width * 0.8, height: width * 0.8 }}
        resizeMode="contain"
      />
    </View>
  );
}
