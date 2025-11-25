import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#FFF9E9]">
      <StatusBar style="dark" />
      {/* Top Part */}
      <View className="flex-1 justify-center items-center bg-[#FFF9E9]">
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: width * 0.6, height: width * 0.6 }}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Part */}
      <View className="flex-1 bg-[#E33675] rounded-t-[30px] px-8 pt-12 pb-10 justify-between">
        <View>
          <Text className="text-white text-4xl font-bold text-center mb-4">Welcome</Text>
          <Text className="text-white/90 text-center text-lg leading-6 px-4">
            Discover the best healthy snacks and nutrition products for your daily life.
          </Text>
        </View>

        <View className="gap-4 mb-4">
          <TouchableOpacity
            onPress={() => router.push('/login')}
            className="w-full bg-black py-4 rounded-full items-center"
          >
            <Text className="text-white font-bold text-lg">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/signup')}
            className="w-full bg-white py-4 rounded-full items-center"
          >
            <Text className="text-[#E33675] font-bold text-lg">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
