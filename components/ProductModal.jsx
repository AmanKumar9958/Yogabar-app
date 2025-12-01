import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, Modal, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

const ProductModal = ({ visible, onClose, product }) => {
    if (!product) return null;
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{ minHeight: height * 0.5 }}
                    onPress={() => {}}
                >
                    <View className="bg-white rounded-t-3xl p-6" style={{ minHeight: height * 0.5 }}>
                        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 18, right: 18, zIndex: 2 }}>
                            <Ionicons name="close" size={28} color="#E33675" />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center', marginBottom: 16 }}>
                            <View style={{ position: 'relative' }}>
                                <Image
                                    source={{ uri: product.image }}
                                    style={{ width: 120, height: 120, borderRadius: 16, backgroundColor: '#F5F5F5' }}
                                    resizeMode="contain"
                                />
                                {/* Sold Out Tag */}
                                {!product.availableForSale && (
                                    <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#555', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, zIndex: 10 }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>SOLD OUT</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="font-bold text-xl text-gray-900 mt-4 mb-2" numberOfLines={1}>{product.title}</Text>
                            <Text className="text-[#E33675] font-bold text-lg mb-2">₹{product.price?.amount || product.price}</Text>
                        </View>
                        <Text className="text-gray-700 text-base mb-4">{product.description || 'No description available.'}</Text>
                        {/* Add more product details here if needed */}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default ProductModal;
