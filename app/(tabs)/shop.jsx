import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';
import { useShopifyProducts } from '../../hooks/useShopifyProducts';

const ProductItem = ({ item }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { addToCart } = useCart();

  // Helper to normalize price for cart and display
  const getCartPrice = (item) => {
    if (typeof item.price === 'number') return item.price;
    if (item.price && typeof item.price.amount === 'number') return item.price.amount;
    if (item.price && typeof item.price.amount === 'string') return parseFloat(item.price.amount) || 0;
    return 0;
  };
  const displayPrice = getCartPrice(item);
  return (
    <View className="flex-1 m-2 bg-[#FDF8F0] rounded-2xl p-3 shadow-sm">
      <View className="w-full h-32 bg-white rounded-xl mb-3 overflow-hidden items-center justify-center relative">
        {item.image && !hasError ? (
          <>
            {isLoading && (
              <View className="absolute inset-0 bg-gray-200 items-center justify-center z-10">
                <Ionicons name="image-outline" size={30} color="#ccc" />
              </View>
            )}
            <Image
              source={{ uri: item.image }}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
              transition={500}
              onLoadStart={() => setIsLoading(true)}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </>
        ) : (
          <View className="w-full h-full bg-gray-100 items-center justify-center">
            <Ionicons name="image-outline" size={30} color="#ccc" />
          </View>
        )}
      </View>

      <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={2}>
        {item.title}
      </Text>

      <View className="flex-row items-center justify-between mt-auto">
        <Text className="text-gray-600 font-medium">
          ₹{Math.round(displayPrice)}
        </Text>

        <TouchableOpacity 
          className="w-8 h-8 bg-[#E33675] rounded-full items-center justify-center shadow-sm"
          onPress={() => {
            // Pass normalized price for cart
            addToCart({ ...item, price: displayPrice });
            Toast.show({
              type: 'success',
              text1: 'Added to Cart',
              text2: `${item.title} added to your cart.`,
            });
          }}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};    const Shop = () => {
    const { q, category } = useLocalSearchParams();
    const { cartItems, getCartCount } = useCart();
    const router = require('expo-router').useRouter();
    const { data: collections, loading, error } = useShopifyProducts();
    const [searchQuery, setSearchQuery] = useState(q || '');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(q || '');
    const [selectedCategory, setSelectedCategory] = useState(category || 'All');
  const [visibleCount, setVisibleCount] = useState(6);
  const categoryListRef = useRef(null);

  // Update search query if passed via params
  useEffect(() => {
    if (q) {
      setSearchQuery(q);
    }
  }, [q]);

  // Update selected category if passed via params
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Reset visible count when category or search changes
  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory, debouncedSearchQuery]);

  // Scroll to selected category
  useEffect(() => {
    if (categoryListRef.current && categories.length > 0) {
      const index = categories.indexOf(selectedCategory);
      if (index >= 0) {
        // Scroll to the selected category to keep it visible
        categoryListRef.current.scrollToIndex({ 
          index, 
          animated: true, 
          viewPosition: 0.5 
        });
      }
    }
  }, [selectedCategory, categories]);    // Flatten all products for "All" category and search
    const allProducts = useMemo(() => {
        if (!collections) return [];
        return collections.flatMap(collection => collection.products);
    }, [collections]);

    // Filter products based on category and search query
    const filteredProducts = useMemo(() => {
        let products = [];

        if (selectedCategory === 'All') {
        products = allProducts;
        } else {
        const collection = collections.find(c => c.title === selectedCategory);
        products = collection ? collection.products : [];
        }

        if (debouncedSearchQuery) {
        products = products.filter(p =>
            p.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
        }

        // Remove duplicates if any (sometimes products appear in multiple collections)
        return Array.from(new Map(products.map(item => [item.id, item])).values());
    }, [selectedCategory, debouncedSearchQuery, collections, allProducts]);

    const displayedProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const categories = useMemo(() => {
        if (!collections) return ['All'];
        return ['All', ...collections.map(c => c.title)];
    }, [collections]);

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 6);
    };

  // Animated placeholder logic
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

  const renderHeader = () => (
    <View className="px-2 pt-2 pb-4">
      {/* Search Bar */}
      <View className="flex-row bg-white rounded-full px-4 py-1 mb-6 shadow-sm border border-gray-700 items-center" style={{ alignItems: 'center' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', height: 40 }}>
          <Ionicons name="search" size={22} color="#9CA3AF" style={{ marginTop: 2 }} />
        </View>
        <View style={{ flex: 1, marginLeft: 10, justifyContent: 'center', height: 40 }}>
          <TextInput
            className="text-base text-gray-800"
            style={{ flex: 1, paddingTop: 0, paddingBottom: 0, height: 40, textAlignVertical: 'center' }}
            placeholder=""
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginLeft: 6 }}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <FlatList
        ref={categoryListRef}
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingRight: 1 }}
        renderItem={({ item: category }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full mr-3 ${
              selectedCategory === category ? 'bg-[#E33675]' : 'bg-white border border-gray-700'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedCategory === category ? 'text-white' : 'text-gray-600'
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        )}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            categoryListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
          });
        }}
      />
    </View>
  );    if (loading) {
        return (
        <View className="flex-1 justify-center items-center bg-[#F5F5F5]">
            <ActivityIndicator size="large" color="#E33675" />
        </View>
        );
    }

    if (error) {
        return (
        <View className="flex-1 justify-center items-center bg-[#F5F5F5] p-4">
            <Text className="text-red-500 text-center mb-4">Error loading products</Text>
            <Text className="text-gray-500 text-center text-xs">{error.message}</Text>
        </View>
        );
    }

    // Calculate total price robustly using cartItems
    const getTotalPrice = () => {
      if (!cartItems || cartItems.length === 0) return 0;
      return cartItems.reduce((sum, item) => {
        let price = 0;
        if (item.price && typeof item.price.amount === 'number' && !isNaN(item.price.amount)) price = item.price.amount;
        else if (typeof item.price === 'number' && !isNaN(item.price)) price = item.price;
        else if (item.price && typeof item.price.amount === 'string') price = parseFloat(item.price.amount) || 0;
        if (!price || isNaN(price)) return sum;
        return sum + price * (item.quantity && item.quantity > 0 ? item.quantity : 1);
      }, 0);
    };
    const totalItems = getCartCount();
    const totalPrice = getTotalPrice();

    return (
      <SafeAreaView className="flex-1 bg-transparent" edges={['top']}>
        <View style={{ flex: 1 }}>
          <FlatList
            data={displayedProducts}
            renderItem={({ item }) => <ProductItem item={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ padding: 8, paddingBottom: totalItems > 0 ? 200 : 100, paddingTop: 20 }}
            ListHeaderComponent={renderHeader()}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => (
              filteredProducts.length > 0 ? (
                visibleCount < filteredProducts.length ? (
                  <TouchableOpacity
                    onPress={handleShowMore}
                    className="mx-4 my-6 border border-[#E33675] rounded-full py-3 items-center"
                  >
                    <Text className="text-[#E33675] font-bold text-base">Show more</Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="text-center text-gray-500 mt-10 mb-6">No more products</Text>
                )
              ) : (
                <Text className="text-center text-gray-500 mt-10">No products found</Text>
              )
            )}
          />
          {/* Checkout Button Fixed at Bottom, outside FlatList */}
          {totalItems > 0 && (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 80, padding: 16, borderTopWidth: 0, borderColor: 'transparent', elevation: 8 }}>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-[#E33675] rounded-full px-6 py-4"
                onPress={() => router.push('/cart')}
                activeOpacity={0.85}
              >
                <View>
                  <Text className="text-white font-bold text-base">Checkout</Text>
                  <Text className="text-white text-sm mt-1">{totalItems} item{totalItems > 1 ? 's' : ''} • ₹{Math.round(totalPrice)}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={32} color="#fff" style={{ marginLeft: 12 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
};

export default Shop;