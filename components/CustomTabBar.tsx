import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Svg, { Path } from "react-native-svg";
import { useChatAIStore } from "../store/chataistore";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const height = 70;

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { openAssistant } = useChatAIStore();
  const { colors } = useTheme();

  const centerIndex = Math.floor(state.routes.length / 2);

  return (
    <View style={{ position: "absolute", bottom: 0, width }}>
      {/* SVG background with bump */}
      <Svg
        width={width}
        height={height + 30}
        viewBox={`0 0 ${width} ${height + 30}`}
      >
        <Path
          d={`
            M0,0 
            H${(width - 100) / 2} 
            C${(width - 100) / 2 + 25},0 ${width / 2 - 40},70 ${width / 2},70 
            C${width / 2 + 40},70 ${(width + 100) / 2 - 25},0 ${
            (width + 100) / 2
          },0 
            H${width} 
            V${height + 30} 
            H0 
            Z
          `}
          fill={colors.card}
        />
      </Svg>

      {/* Tab Items */}
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            if (index === centerIndex) return; // block default center button behavior
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return index === centerIndex ? (
            <TouchableOpacity
              key={index}
              onPress={openAssistant}
              style={styles.centerButton}
            >
              <Image
                source={require("../assets/images/gemini-logo.png")}
                style={styles.centerImage}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
            >
              {descriptors[route.key].options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? colors.primary : colors.textSecondary,
                size: 22,
              })}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height,
    width: "100%",
    bottom: 0,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  centerButton: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#00A8E1",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  centerImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});
