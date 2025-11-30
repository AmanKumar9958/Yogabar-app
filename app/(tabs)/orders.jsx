import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCustomer } from '../../services/shopify.js'; 

const statusStyles = {
  Delivered: 'bg-green-100 text-green-700',
  Processing: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const statusLabels = {
  Delivered: 'Delivered',
  Processing: 'Processing',
  Cancelled: 'Cancelled',
};

// Helper to convert Shopify status to your App's status
const getStatus = (fulfillmentStatus, financialStatus) => {
  if (financialStatus === 'REFUNDED' || financialStatus === 'VOIDED') return 'Cancelled';
  if (fulfillmentStatus === 'FULFILLED') return 'Delivered';
  return 'Processing'; // Default for Paid/Unfulfilled
};

const OrderCard = ({ order, onViewDetails }) => (
  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
    <View className="flex-row justify-between items-center mb-2">
      <Text className="font-bold text-base text-gray-900">Order #{order.orderId}</Text>
      <Text className="font-bold text-lg text-gray-900">
        {order.currency} {parseFloat(order.amount).toFixed(2)}
      </Text>
    </View>
    <Text className="text-xs text-gray-500 mb-2">Placed on {order.date}</Text>
    
    {/* Product Summary */}
    <Text className="text-xs text-gray-400 mb-3" numberOfLines={1}>
        {order.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
    </Text>

    <View className="flex-row items-center mb-2">
      <View className={`px-3 py-1 rounded-full mr-2 ${statusStyles[order.status].split(' ')[0]}`}>
        <Text className={`text-xs font-medium ${statusStyles[order.status].split(' ')[1]}`}>
            {statusLabels[order.status]}
        </Text>
      </View>
      <TouchableOpacity onPress={onViewDetails} className="ml-auto">
        <Text className="text-[#E33675] font-medium text-sm">
            View Details <Ionicons name="chevron-forward" size={16} color="#E33675" />
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      // 1. Get Token from Storage (Saved during Login)
      const token = await AsyncStorage.getItem('userToken'); 
      
      if (!token) {
        setLoading(false);
        setError("Please log in to view orders");
        return; 
      }

      // 2. Call API
      const customer = await getCustomer(token);

      if (customer && customer.orders) {
        // 3. Map Shopify Data Structure to Your App Structure
        const mappedOrders = customer.orders.edges.map((edge) => {
            const node = edge.node;
            return {
              id: node.id,
              orderId: node.orderNumber, // e.g. 1001
              amount: node.totalPrice.amount,
              currency: node.totalPrice.currencyCode === 'INR' ? '₹' : node.totalPrice.currencyCode,
              date: new Date(node.processedAt).toDateString(),
              status: getStatus(node.fulfillmentStatus, node.financialStatus),
              items: node.lineItems.edges.map((e) => e.node)
            };
        });
        setOrders(mappedOrders);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]" edges={['top']}>
      <View className="px-4 pt-8 pb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Order History</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E33675" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
            <Ionicons name="alert-circle-outline" size={48} color="gray" />
            <Text className="text-red-500 text-center mb-4 mt-2">{error}</Text>
            <TouchableOpacity 
                onPress={fetchOrders} 
                className="bg-[#E33675] px-6 py-2 rounded-full"
            >
                <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E33675']} />}
        >
          {orders.length === 0 ? (
            <View className="items-center justify-center mt-20">
                <Ionicons name="receipt-outline" size={64} color="#E33675" />
                <Text className="text-gray-500 mt-4 text-lg">No orders found</Text>
                <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/shop')}
                    className="mt-6 bg-[#E33675] px-6 py-3 rounded-full"
                >
                    <Text className="text-white font-bold">Start Shopping</Text>
                </TouchableOpacity>
            </View>
          ) : (
            orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={() => console.log("View details", order.orderId)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};