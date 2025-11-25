import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShopifyProducts } from '../../hooks/useShopifyProducts';

const ProductItem = ({ item }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
          ₹{Math.round(item.price.amount)}
        </Text>

        <TouchableOpacity className="w-8 h-8 bg-[#E33675] rounded-full items-center justify-center shadow-sm">
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};    const Shop = () => {
    const { q, category } = useLocalSearchParams();
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

  const renderHeader = () => (
    <View className="px-4 pt-2 pb-4">
      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-3 mb-6 shadow-sm border border-gray-100">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-800"
          placeholder="Search for muesli, bars, protein..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
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
        contentContainerStyle={{ paddingRight: 20 }}
        renderItem={({ item: category }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full mr-3 ${
              selectedCategory === category ? 'bg-[#E33675]' : 'bg-white border border-gray-100'
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

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F5]" edges={['top']}>
            <FlatList
                data={displayedProducts}
                renderItem={({ item }) => <ProductItem item={item} />}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 8, paddingBottom: 100, paddingTop: 10 }}
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
        </SafeAreaView>
    );
};

export default Shop;