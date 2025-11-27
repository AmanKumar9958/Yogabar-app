import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { BackHandler, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext'; // Verify this path is correct for your folder structure

export default function CartScreen() {
    const router = useRouter();
    const { cartItems = [], addToCart, removeFromCart, updateQuantity } = useCart();

    // --- HELPER TO FIX PRICE ISSUE ---
    const getPrice = (item) => {
        if (!item) return 0;
        // Case A: Price is inside price.amount (Shopify Structure)
        if (item.price && typeof item.price.amount === 'number') {
            return item.price.amount;
        }
        // Case B: Price is directly on the item as a number
        if (typeof item.price === 'number') {
            return item.price;
        }
        // Case C: Price might be under 'variants' if raw Shopify product was passed
        if (item.variants && typeof item.variants[0]?.price?.amount === 'number') {
            return item.variants[0].price.amount;
        }
        // Defensive fallback
        return 0;
    };

    const decreaseQuantity = (id) => {
        const item = cartItems.find(i => i.id === id);
        if (item && item.quantity > 1) {
            updateQuantity(id, item.quantity - 1);
        } else {
            removeFromCart(id);
        }
    };

    useEffect(() => {
        const backAction = () => {
            router.back();
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [router]);

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const price = getPrice(item);
            return sum + (price * item.quantity);
        }, 0);
    }, [cartItems]);

    const grandTotal = subtotal; 

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 pt-12 pb-4 bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-2 text-gray-900" numberOfLines={1}>My Cart</Text>
            </View>

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Cart Items */}
                {cartItems.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Ionicons name="cart-outline" size={64} color="#E33675" />
                        <Text className="text-gray-500 mt-4 text-lg">Your cart is empty</Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/(tabs)/shop')}
                            className="mt-6 bg-[#E33675] px-6 py-3 rounded-full"
                        >
                            <Text className="text-white font-bold">Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    cartItems.map((item) => {
                        const price = getPrice(item);
                        return (
                            <View key={item.id} className="flex-row items-center mt-6 mb-2 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: 90, height: 90, borderRadius: 16, backgroundColor: '#F5F5F5', marginRight: 18 }}
                                    resizeMode="contain"
                                />
                                <View className="flex-1 justify-center">
                                    <Text className="font-bold text-lg text-gray-900 mb-2" numberOfLines={1}>{item.title}</Text>
                                    <Text className="text-[#E33675] font-bold text-xl mb-2">₹{price.toFixed(2)}</Text>
                                    <View className="flex-row items-center bg-gray-50 rounded-xl py-1 w-28 justify-between">
                                        <TouchableOpacity
                                            className="w-7 h-7 rounded-full border border-gray-300 items-center justify-center"
                                            onPress={() => decreaseQuantity(item.id)}
                                        >
                                            <Ionicons name="remove" size={18} color="#E33675" />
                                        </TouchableOpacity>
                                        <Text className="mx-2 text-lg font-bold text-gray-800 text-center">{item.quantity}</Text>
                                        <TouchableOpacity
                                            className="w-7 h-7 rounded-full border border-gray-300 items-center justify-center"
                                            onPress={() => addToCart(item)}
                                        >
                                            <Ionicons name="add" size={18} color="#E33675" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => removeFromCart(item.id)} className="ml-2 p-2">
                                    <Ionicons name="close" size={24} color="#E33675" />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}

                {/* Order Summary */}
                {cartItems.length > 0 && (
                    <View className="bg-gray-50 rounded-xl p-5 mt-6 mb-6">
                        <Text className="font-bold text-lg mb-4 text-gray-900">Order Summary</Text>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Subtotal</Text>
                            <Text className="text-gray-800 font-medium">₹{subtotal.toFixed(2)}</Text>
                        </View>
                        <View className="border-t border-dashed border-gray-300 my-3" />
                        <View className="flex-row justify-between">
                            <Text className="font-bold text-lg text-gray-900">Grand Total</Text>
                            <Text className="font-bold text-lg text-[#E33675]">₹{grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Bar */}
            {cartItems.length > 0 && (
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 safe-bottom">
                    <TouchableOpacity
                        className="bg-[#E33675] w-full py-4 rounded-full flex-row items-center justify-between px-6 shadow-lg shadow-pink-200"
                        onPress={() => router.push('/checkout')}
                    >
                        <Text className="text-white font-bold text-lg">₹{grandTotal.toFixed(2)}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-white font-bold text-base mr-2">Checkout</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}