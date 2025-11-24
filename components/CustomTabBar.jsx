import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 40;
const TAB_BAR_HEIGHT = 65;
const TAB_ITEM_WIDTH = TAB_BAR_WIDTH / 4;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_ITEM_WIDTH, {
      damping: 20,
      stiffness: 300,
    });
  }, [state.index, translateX]);

  const animatedProps = useAnimatedProps(() => {
    const currentX = translateX.value;
    const center = currentX + TAB_ITEM_WIDTH / 2;
    const R = 20; // Corner radius
    const notchWidth = 35; // Half width of the notch

    // Manual path construction for UI thread compatibility
    // Start at top-left corner (after the curve)
    let d = `M0,${R}`;
    
    // Top-left corner
    d += ` Q0,0 ${R},0`;
    
    // Line to notch start
    d += ` L${center - notchWidth},0`;
    
    // Notch Curve down
    // C x1 y1, x2 y2, x y
    d += ` C${center - 25},0 ${center - 20},40 ${center},40`;
    
    // Notch Curve up
    d += ` C${center + 20},40 ${center + 25},0 ${center + notchWidth},0`;
    
    // Line to top-right corner
    d += ` L${TAB_BAR_WIDTH - R},0`;
    
    // Top-right corner
    d += ` Q${TAB_BAR_WIDTH},0 ${TAB_BAR_WIDTH},${R}`;
    
    // Line to bottom-right corner
    d += ` L${TAB_BAR_WIDTH},${TAB_BAR_HEIGHT - R}`;
    
    // Bottom-right corner
    d += ` Q${TAB_BAR_WIDTH},${TAB_BAR_HEIGHT} ${TAB_BAR_WIDTH - R},${TAB_BAR_HEIGHT}`;
    
    // Line to bottom-left corner
    d += ` L${R},${TAB_BAR_HEIGHT}`;
    
    // Bottom-left corner
    d += ` Q0,${TAB_BAR_HEIGHT} 0,${TAB_BAR_HEIGHT - R}`;
    
    // Close path
    d += ` Z`;

    return {
      d: d,
    };
  });

  const animatedCircleStyle = useAnimatedProps(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      <View style={styles.tabBarContainer}>
        <Svg width={TAB_BAR_WIDTH} height={TAB_BAR_HEIGHT} style={styles.svg}>
          <AnimatedPath
            animatedProps={animatedProps}
            fill="#5901FC" // Dark purple
          />
        </Svg>

        <AnimatedView style={[styles.activeCircle, animatedCircleStyle]}>
           {/* The icon inside the circle is rendered by the map loop below, 
               but we need to render the ACTIVE icon here to move with the circle?
               Actually, usually the circle moves and sits BEHIND the icon, 
               or the icon moves WITH the circle.
               
               In the design, the active icon is INSIDE the circle.
               So we should probably render the active icon inside this moving view.
           */}
           {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              
              if (!isFocused) return null;

              const iconName = 
                route.name === 'index' ? 'home' :
                route.name === 'shop' ? 'bag-handle' :
                route.name === 'orders' ? 'list' :
                'person';

              return (
                <View key={route.key} style={styles.activeIconContainer}>
                   <Ionicons name={iconName} size={24} color="black" />
                </View>
              );
           })}
        </AnimatedView>

        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const iconName = 
                route.name === 'index' ? 'home-outline' :
                route.name === 'shop' ? 'bag-handle-outline' :
                route.name === 'orders' ? 'list-outline' :
                'person-outline';

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.tabItem}
              >
                {/* Only show inactive icons here. Active icon is in the floating circle */}
                {!isFocused && (
                   <Ionicons name={iconName} size={24} color="#fff" />   // WhiteW for inactive
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    backgroundColor: 'transparent',
    // Shadow for floating effect
    shadowColor: "#E33675",
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  tabsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20, // Push icons down a bit to align with the bar body
  },
  activeCircle: {
    position: 'absolute',
    top: -20, // Float above
    left: 0,
    width: TAB_ITEM_WIDTH,
    height: 60, // Height of the circle area
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  activeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E33675', // Pink
    alignItems: 'center',
    justifyContent: 'center',
  }
});
