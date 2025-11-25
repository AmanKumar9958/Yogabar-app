import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getCustomer } from '../../services/shopify';

const Profile = () => {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/login');
        return;
      }
      const data = await getCustomer(token);
      setCustomer(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If token is invalid, maybe redirect to login
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/login');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FFF9E9]">
        <ActivityIndicator size="large" color="#E33675" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FFF9E9]">
        <Text className="text-gray-500">Failed to load profile</Text>
        <TouchableOpacity onPress={fetchProfile} className="mt-4">
          <Text className="text-[#E33675]">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const defaultAddress = customer.defaultAddress || {};

  return (
    <ScrollView 
      className="flex-1 bg-[#fff]"
      contentContainerStyle={{ paddingBottom: 100, marginTop: 20 }}
    >
      {/* Header Section */}
      <View className="pb-6 rounded-b-[30px]">
        <View className="items-center mt-10">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4 border-2 border-[#E33675]">
            <Text className="text-3xl font-bold text-[#E33675]" numberOfLines={1}>
              {customer.firstName?.[0]}{customer.lastName?.[0]}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800">
            {customer.firstName} {customer.lastName}
          </Text>
          <Text className="text-gray-500 mt-1">{customer.email}</Text>
          <Text className="text-gray-500">{customer.phone}</Text>
        </View>
      </View>

      {/* Info Sections */}
      <View className="p-6 space-y-6">
        
        {/* Address Section */}
        <View className="bg-white p-5 rounded-2xl shadow-md">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-pink-50 rounded-full items-center justify-center mr-3">
              <Ionicons name="location" size={18} color="#E33675" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Address</Text>
          </View>
          
          {defaultAddress.address1 ? (
            <View>
              <Text className="text-gray-600 text-base leading-6">
                {defaultAddress.address1}
              </Text>
              {(defaultAddress.city || defaultAddress.zip) && (
                <Text className="text-gray-600 text-base leading-6">
                  {defaultAddress.city}, {defaultAddress.zip}
                </Text>
              )}
              {defaultAddress.country && (
                <Text className="text-gray-600 text-base leading-6">
                  {defaultAddress.country}
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-gray-400 italic">No address details available</Text>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-white p-4 rounded-2xl shadow-sm flex-row items-center justify-center border-2 border-[#E33675] mt-5"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-bold text-md ml-2">Log Out</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

export default Profile;