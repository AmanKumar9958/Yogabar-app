import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { loginCustomer } from '../services/shopify';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      setLoading(true);
      try {
        const { accessToken } = await loginCustomer(email, password);
        await AsyncStorage.setItem('userToken', accessToken);
        
        Toast.show({
          type: 'success',
          text1: 'Welcome Back!',
          text2: 'Successfully logged in.',
        });
        router.replace('/(tabs)');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-[#FFF9E9] pt-8">
      <View className="p-4 mt-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-1 px-8 justify-center -mt-20">
        <Text className="text-3xl font-bold text-[#E33675] mb-8 text-center">Welcome Back</Text>
        
        <View className="space-y-4 gap-4">
          <View>
            <Text className="text-gray-700 mb-2 font-medium ml-1">Email</Text>
            <TextInput
              className="w-full p-4 rounded-xl border border-gray-500 text-base"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({...errors, email: null});
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            {errors.email && <Text className="text-red-500 text-sm ml-1 mt-1">{errors.email}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium ml-1">Password</Text>
            <TextInput
              className="w-full p-4 rounded-xl border border-gray-500 text-base"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: null});
              }}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
            {errors.password && <Text className="text-red-500 text-sm ml-1 mt-1">{errors.password}</Text>}
          </View>

          <TouchableOpacity className="items-end">
            <Text className="text-[#E33675] font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full bg-[#E33675] py-4 rounded-full items-center mt-6 shadow-lg shadow-pink-200"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
