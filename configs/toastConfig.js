import { Dimensions, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={{ 
      height: 70, 
      width: width * 0.9, 
      backgroundColor: '#FFF9E9', 
      borderLeftColor: '#E33675', 
      borderLeftWidth: 5, 
      borderRadius: 15,
      justifyContent: 'center',
      paddingHorizontal: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#E33675' }}>{text1}</Text>
      <Text style={{ fontSize: 14, color: '#333' }}>{text2}</Text>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={{ 
      height: 70, 
      width: width * 0.9, 
      backgroundColor: '#FFF9E9', 
      borderLeftColor: '#FF0000', 
      borderLeftWidth: 5, 
      borderRadius: 15,
      justifyContent: 'center',
      paddingHorizontal: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FF0000' }}>{text1}</Text>
      <Text style={{ fontSize: 14, color: '#333' }}>{text2}</Text>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={{ 
      height: 70, 
      width: width * 0.9, 
      backgroundColor: '#FFF9E9', 
      borderLeftColor: '#FFC107', 
      borderLeftWidth: 5, 
      borderRadius: 15,
      justifyContent: 'center',
      paddingHorizontal: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFC107' }}>{text1}</Text>
      <Text style={{ fontSize: 14, color: '#333' }}>{text2}</Text>
    </View>
  )
};
