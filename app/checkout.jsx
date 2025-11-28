import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const router = useRouter();
  const { cartItems = [], clearCart, getCartCount } = useCart();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [mobile, setMobile] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('standard'); // standard / express
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod / online
  const [submitting, setSubmitting] = useState(false);

  // Helper: get numeric price from item (handles price.amount or numeric price)
  const getPrice = (item) => {
    if (!item) return 0;
    if (item.price && typeof item.price.amount === 'number') return item.price.amount;
    if (typeof item.price === 'number') return item.price;
    if (item.variants && typeof item.variants[0]?.price?.amount === 'number') return item.variants[0].price.amount;
    return 0;
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = getPrice(item);
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  const deliveryCharge = deliveryOption === 'express' ? 49 : 0;
  const grandTotal = subtotal + deliveryCharge;

  const validate = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name required' });
      return false;
    }
    if (!address.trim() || address.trim().length < 8) {
      Toast.show({ type: 'error', text1: 'Please enter a valid address' });
      return false;
    }
    if (!/^[0-9]{5,6}$/.test(pincode)) {
      Toast.show({ type: 'error', text1: 'Enter valid pincode' });
      return false;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      Toast.show({ type: 'error', text1: 'Enter valid 10-digit mobile number' });
      return false;
    }
    if (!cartItems || cartItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Cart is empty' });
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Simulate order placement / payment flow
      await new Promise((res) => setTimeout(res, 800));

      // For COD, finalize immediately. For online, you'd integrate payment SDK here.
      clearCart();
      Toast.show({ type: 'success', text1: 'Order placed', text2: `₹${grandTotal.toFixed(2)} — ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}` });
      router.push('/orders');
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Failed to place order' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={22} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2">Checkout</Text>
        </View>

        {/* Delivery Details */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="font-bold text-gray-900 mb-2">Delivery Details</Text>
          <Text className="text-sm text-gray-600 mb-1">Full name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g., Aman Kumar" className="bg-white rounded-md px-3 py-2 mb-3" />

          <Text className="text-sm text-gray-600 mb-1">Address</Text>
          <TextInput value={address} onChangeText={setAddress} placeholder="House, Street, Locality" multiline className="bg-white rounded-md px-3 py-2 mb-3 h-20 text-top" />

          <View className="flex-row space-x-2">
            <View style={{ flex: 1 }}>
              <Text className="text-sm text-gray-600 mb-1">Pincode</Text>
              <TextInput value={pincode} onChangeText={setPincode} placeholder="e.g., 560001" keyboardType="numeric" className="bg-white rounded-md px-3 py-2 mb-3" />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-sm text-gray-600 mb-1">Mobile</Text>
              <TextInput value={mobile} onChangeText={setMobile} placeholder="10-digit mobile" keyboardType="phone-pad" className="bg-white rounded-md px-3 py-2 mb-3" />
            </View>
          </View>
        </View>

        {/* Delivery & Payment Options */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="font-bold text-gray-900 mb-3">Delivery Options</Text>
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => setDeliveryOption('standard')} className={`px-4 py-3 rounded-xl ${deliveryOption === 'standard' ? 'bg-[#E33675]' : 'bg-white border border-gray-200'}`}>
              <Text className={`${deliveryOption === 'standard' ? 'text-white' : 'text-gray-800'}`}>Standard (Free)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeliveryOption('express')} className={`px-4 py-3 rounded-xl ${deliveryOption === 'express' ? 'bg-[#E33675]' : 'bg-white border border-gray-200'}`}>
              <Text className={`${deliveryOption === 'express' ? 'text-white' : 'text-gray-800'}`}>Express (₹49)</Text>
            </TouchableOpacity>
          </View>

          <Text className="font-bold text-gray-900 mb-3">Payment Method</Text>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setPaymentMethod('cod')} className={`px-4 py-3 rounded-xl ${paymentMethod === 'cod' ? 'bg-[#E33675]' : 'bg-white border border-gray-200'}`}>
              <Text className={`${paymentMethod === 'cod' ? 'text-white' : 'text-gray-800'}`}>Cash on Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPaymentMethod('online')} className={`px-4 py-3 rounded-xl ${paymentMethod === 'online' ? 'bg-[#E33675]' : 'bg-white border border-gray-200'}`}>
              <Text className={`${paymentMethod === 'online' ? 'text-white' : 'text-gray-800'}`}>Online Payment</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="font-bold text-gray-900 mb-3">Order Summary</Text>
          {cartItems.map((it) => (
            <View key={it.id} className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-800">{it.title} x {it.quantity || 1}</Text>
              <Text className="text-gray-900 font-medium">₹{(getPrice(it) * (it.quantity || 1)).toFixed(2)}</Text>
            </View>
          ))}

          <View className="border-t border-gray-200 mt-3 pt-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-800">₹{subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Delivery</Text>
              <Text className="text-gray-800">{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}</Text>
            </View>
            <View className="flex-row justify-between mt-3">
              <Text className="font-bold text-lg">Grand Total</Text>
              <Text className="font-bold text-lg text-[#E33675]">₹{grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Place Order Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 border-t border-gray-100">
        <TouchableOpacity
          className={`bg-[#E33675] w-full py-4 rounded-full flex-row items-center justify-between px-6 ${submitting ? 'opacity-60' : ''}`}
          activeOpacity={0.9}
          onPress={placeOrder}
          disabled={submitting}
        >
          <Text className="text-white font-bold text-lg">Place Order • ₹{grandTotal.toFixed(2)}</Text>
          <View className="flex-row items-center">
            <Text className="text-white font-bold mr-2">{getCartCount()} item{getCartCount() > 1 ? 's' : ''}</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Checkout;
