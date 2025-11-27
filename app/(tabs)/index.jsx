import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, Dimensions, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';
import { useShopifyProducts } from '../../hooks/useShopifyProducts';
import { getCustomer } from '../../services/shopify';

const { width } = Dimensions.get('window');

const ProductCard = ({ item, showNewTag = false }) => {
  const { addToCart } = useCart();
  // Defensive price normalization
  const getCartPrice = (item) => {
    if (typeof item.price === 'number') return item.price;
    if (item.price && typeof item.price.amount === 'number') return item.price.amount;
    if (item.price && typeof item.price.amount === 'string') return parseFloat(item.price.amount) || 0;
    return 0;
  };
  const displayPrice = getCartPrice(item);
  return (
    <View className="w-40 mr-4 bg-white rounded-xl p-3 shadow-sm">
      <View className="relative w-full h-32 bg-gray-50 rounded-lg mb-2 items-center justify-center">
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={200}
        />
        {showNewTag && (
          <View className="absolute top-1 left-1 bg-green-600 rounded px-1.5 py-0.5">
            <Text className="text-[10px] font-bold text-white">NEW</Text>
          </View>
        )}
      </View>
      <Text className="text-gray-900 font-bold text-sm mb-1" numberOfLines={2}>
        {item.title}
      </Text>
      <Text className="text-gray-500 text-xs mb-1" numberOfLines={1}>
        {item.description}
      </Text>
      <View className="flex-row items-center justify-between mt-1">
        <Text className="text-gray-900 font-bold text-sm">
          ₹{Math.round(displayPrice)}
        </Text>
        <TouchableOpacity 
          className="w-6 h-6 bg-[#E33675] rounded-full items-center justify-center"
          onPress={() => {
            addToCart({ ...item, price: displayPrice });
            Toast.show({
              type: 'success',
              text1: 'Added to Cart',
              text2: `${item.title} added to your cart.`,
            });
          }}
        >
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SectionHeader = ({ title, onSeeAll }) => (
  <View className="flex-row justify-between items-center px-4 mb-3 mt-6">
    <Text className="text-lg font-bold text-gray-900">{title}</Text>
    <TouchableOpacity onPress={onSeeAll}>
      <Text className="text-[#E33675] font-medium text-sm">See all</Text>
    </TouchableOpacity>
  </View>
);

const BannerCarousel = () => {
  const banners = [
    'https://cdn.shopify.com/s/files/1/0085/5588/8699/files/Desktop_Banner_1_1400x.jpg?v=1709203456', // Placeholder or real banner if available
    'https://cdn.shopify.com/s/files/1/0085/5588/8699/files/Desktop_Banner_2_1400x.jpg?v=1709203456',
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollViewRef.current) {
        let nextIndex = activeIndex + 1;
        if (nextIndex >= banners.length) {
          nextIndex = 0;
        }
        scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
        setActiveIndex(nextIndex);
      }
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [activeIndex, banners.length]);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
        setActiveIndex(roundIndex);
    }
  };

  return (
    <View className="mt-6 mb-2">
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {banners.map((banner, index) => (
          <View key={index} style={{ width: width, paddingHorizontal: 16 }} className="h-40">
             <View className="w-full h-full rounded-2xl overflow-hidden bg-[#FFD8C7] relative">
                <Image 
                    source={{ uri: banner }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                />
                <View className="absolute inset-0 bg-black/10 justify-center pl-6">
                    <Text className="text-white font-bold text-2xl w-2/3">FLAT 20% OFF</Text>
                    <Text className="text-white font-medium text-sm mt-1">On your first order</Text>
                    <Text className="text-white text-xs mt-1">Use code: YOGANEW</Text>
                </View>
             </View>
          </View>
        ))}
      </ScrollView>
      {/* Pagination Dots */}
      <View className="flex-row justify-center mt-2 space-x-2">
        {banners.map((_, index) => (
            <View 
                key={index} 
                className={`h-2 rounded-full ${index === activeIndex ? 'w-6 bg-[#E33675]' : 'w-2 bg-gray-300'}`} 
            />
        ))}
      </View>
    </View>
  );
};

const CategoryGrid = ({ categories, onViewAll, onCategoryPress }) => {
  const displayCategories = categories.slice(0, 4);

  return (
    <View className="px-4 mt-6 mb-20">
      <Text className="text-lg font-bold text-gray-900 mb-4">Shop by Category</Text>
      <View className="flex-row flex-wrap justify-between">
        {displayCategories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            className="w-[48%] bg-white rounded-xl p-4 mb-4 items-center shadow-sm"
            onPress={() => onCategoryPress(category.title)}
          >
             {/* Placeholder for category image since collection object might not have image in the current hook */}
             <View className="w-20 h-20 bg-gray-50 rounded-lg mb-3 items-center justify-center">
                {/* Try to find a product image from this category to show */}
                {category.products.length > 0 ? (
                    <Image 
                        source={{ uri: category.products[0].image }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="contain"
                    />
                ) : (
                    <Ionicons name="grid-outline" size={30} color="#ccc" />
                )}
             </View>
            <Text className="text-gray-900 font-medium text-center">{category.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity 
        onPress={onViewAll}
        className="w-full bg-white py-3 rounded-full items-center mt-2 border border-[#E33675]"
      >
        <Text className="text-[#E33675] font-bold">View All Categories</Text>
      </TouchableOpacity>
    </View>
  );
};

const Home = () => {
      // Animated keyword placeholder logic for search bar
      const keywordOptions = [
        'protein',
        'whey protein',
        'oats',
        'muesli',
        'bars',
        'snacks',
      ];
      const [placeholderIndex, setPlaceholderIndex] = useState(0);
      const [placeholderAnim] = useState(new Animated.Value(0));

      useEffect(() => {
        const interval = setInterval(() => {
          Animated.timing(placeholderAnim, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setPlaceholderIndex((prev) => (prev + 1) % keywordOptions.length);
            Animated.timing(placeholderAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          });
        }, 2000);
        return () => clearInterval(interval);
      }, [placeholderAnim, keywordOptions.length]);
    useEffect(() => {
      const backAction = () => {
        // Prevent going back from main tab screen
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, []);
  const router = useRouter();
  const { data: collections, loading, error } = useShopifyProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const { getCartCount } = useCart();

  useEffect(() => {
    fetchUser();
    updateGreeting();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const customer = await getCustomer(token);
        setUserName(customer.firstName);
      }
    } catch (error) {
      console.log('Error fetching user:', error);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning 🌻');
    else if (hour < 18) setGreeting('Good Afternoon ☀️');
    else setGreeting('Good Evening 🌙');
  };

  // Flatten products for sections
  const allProducts = useMemo(() => {
    if (!collections) return [];
    return collections.flatMap(c => c.products);
  }, [collections]);

  // Simulate different sections with slices of data
  // In a real app, these would be specific collections or filtered lists
  const ybChoice = useMemo(() => allProducts.slice(0, 5), [allProducts]);
  const newArrivals = useMemo(() => allProducts.slice(5, 10), [allProducts]);
  const bestSellers = useMemo(() => allProducts.slice(10, 15), [allProducts]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F5F5]">
        <ActivityIndicator size="large" color="#E33675" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F5F5]">
        <Text className="text-red-500">Error loading products</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}>
        
        {/* Header with Greeting and Cart */}
        <View className="px-4 flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-800 text-3xl font-medium">{greeting}</Text>
            <Text className="text-gray-900 text-2xl font-bold">
              {userName ? `${userName}` : 'Welcome!'}
            </Text>
          </View>
          <TouchableOpacity 
            className="w-10 h-10 bg-[#FDF8F0] rounded-full items-center justify-center relative"
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#E33675" />
            {getCartCount() > 0 && (
              <View className="absolute -top-1 -right-1 bg-[#E33675] w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-[10px] font-bold">{getCartCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-2">
          <View className="flex-row items-center bg-white rounded-full px-4 py-1 border border-gray-700 shadow-sm" style={{ alignItems: 'center' }}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <View style={{ flex: 1, marginLeft: 8, justifyContent: 'center', height: 40 }}>
              <TextInput
                className="text-base text-gray-800"
                style={{ flex: 1, paddingTop: 0, paddingBottom: 0, height: 40, textAlignVertical: 'center' }}
                placeholder=""
                placeholderTextColor="#9CA3AF"
                returnKeyType="search"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => router.push({ pathname: '/shop', params: { q: searchQuery } })}
              />
              {/* Static 'Search for' and animated keyword */}
              {searchQuery.length === 0 && (
                <View style={{ position: 'absolute', left: 0, top: 0, height: 40, flexDirection: 'row', alignItems: 'center', zIndex: 1 }} pointerEvents="none">
                  <Text style={{ color: '#9CA3AF', fontSize: 18, opacity: 0.8, paddingLeft: 2 }}>Search for </Text>
                  <Animated.Text
                    style={{
                      color: '#9CA3AF',
                      fontSize: 18,
                      opacity: 0.8,
                      transform: [{ translateY: placeholderAnim }],
                      marginLeft: 2,
                    }}
                  >
                    {keywordOptions[placeholderIndex]}
                  </Animated.Text>
                </View>
              )}
            </View>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* YB Choice */}
        <SectionHeader title="YB Choice" onSeeAll={() => router.push('/shop')} />
        <FlatList
          data={ybChoice}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} />}
        />

        {/* New Arrivals */}
        <SectionHeader title="New Arrivals" onSeeAll={() => router.push('/shop')} />
        <FlatList
          data={newArrivals}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} showNewTag={true} />}
        />

        {/* Best Sellers */}
        <SectionHeader title="Best Sellers" onSeeAll={() => router.push('/shop')} />
        <FlatList
          data={bestSellers}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} />}
        />

        {/* Carousel */}
        <BannerCarousel />

        {/* Shop by Category */}
        <CategoryGrid 
            categories={collections} 
            onViewAll={() => router.push('/shop')} 
            onCategoryPress={(category) => router.push({ pathname: '/shop', params: { category } })}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;