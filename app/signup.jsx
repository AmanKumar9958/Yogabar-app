import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { createCustomer, createCustomerAddress, loginCustomer } from '../services/shopify';

export default function Signup() {
    // Refs for input fields to move to next
    const lastNameRef = useRef();
    const phoneRef = useRef();
    const emailRef = useRef();
    const addressRef = useRef();
    const passwordRef = useRef();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    let newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await createCustomer(formData);
        // Auto login after signup
        const { accessToken } = await loginCustomer(formData.email, formData.password);
        await AsyncStorage.setItem('userToken', accessToken);
        
        // Create address
        if (formData.address) {
          await createCustomerAddress(accessToken, formData.address);
        }

        Toast.show({
          type: 'success',
          text1: 'Account Created!',
          text2: 'Welcome to Yogabar.',
        });
        router.replace('/(tabs)');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
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
      
      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-[#E33675] mb-8 text-center mt-4">Create Account</Text>
        
        <View className="space-y-4 gap-4 pb-10">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-gray-700 mb-2 font-medium ml-1">First Name</Text>
              <TextInput
                className="w-full p-4 rounded-xl border border-gray-500 text-base"
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(t) => handleChange('firstName', t)}
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                autoCapitalize="words"
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
              {errors.firstName && <Text className="text-red-500 text-xs ml-1 mt-1">{errors.firstName}</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 mb-2 font-medium ml-1">Last Name</Text>
              <TextInput
                ref={lastNameRef}
                className="w-full p-4 rounded-xl border border-gray-500 text-base"
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(t) => handleChange('lastName', t)}
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                autoCapitalize="words"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
              {errors.lastName && <Text className="text-red-500 text-xs ml-1 mt-1">{errors.lastName}</Text>}
            </View>
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium ml-1">Phone</Text>
              <TextInput
                ref={phoneRef}
                className="w-full p-4 rounded-xl border border-gray-500 text-base"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(t) => handleChange('phone', t)}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            {errors.phone && <Text className="text-red-500 text-sm ml-1 mt-1">{errors.phone}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium ml-1">Email</Text>
              <TextInput
                ref={emailRef}
                className="w-full p-4 rounded-xl border border-gray-500 text-base"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(t) => handleChange('email', t)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                onSubmitEditing={() => addressRef.current?.focus()}
              />
            {errors.email && <Text className="text-red-500 text-sm ml-1 mt-1">{errors.email}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium ml-1">Address</Text>
              <TextInput
                ref={addressRef}
                className="w-full p-4 rounded-xl border border-gray-500 text-base"
                placeholder="Enter your address"
                value={formData.address}
                onChangeText={(t) => handleChange('address', t)}
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                autoCapitalize="words"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            {errors.address && <Text className="text-red-500 text-sm ml-1 mt-1">{errors.address}</Text>}
          </View>

          <View>
            <Text className="text-gray-700 mb-2 font-medium ml-1">Password</Text>
              <View className="w-full flex-row items-center border border-gray-500 rounded-xl">
                <TextInput
                  ref={passwordRef}
                  className="flex-1 p-4 text-base"
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(t) => handleChange('password', t)}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} className="px-3">
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#E33675" />
                </TouchableOpacity>
              </View>
            {errors.password && <Text className="text-red-500 text-sm ml-1 mt-1">{errors.password}</Text>}
          </View>

          <TouchableOpacity 
            className="w-full bg-[#E33675] py-4 rounded-full items-center mt-6 shadow-lg shadow-pink-200"
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg" numberOfLines={1}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-[#E33675] font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
