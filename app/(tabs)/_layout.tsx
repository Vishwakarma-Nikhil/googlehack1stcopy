import { Tabs } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { Home, ShoppingBag, Award, CloudRain } from "react-native-feather";
import { Platform, View, Image, TouchableOpacity } from "react-native";
import { useTranslationStore } from "../../store/translationStore";
import { useChatAIStore } from "../../store/chataistore";
import CustomTabBar from "@/components/CustomTabBar";

import Svg from "react-native-svg";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { translate } = useTranslationStore();
  const { openAssistant } = useChatAIStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          height: Platform.OS === "ios" ? 85 : 64,
          borderTopWidth: 1,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
          marginBottom: Platform.OS === "ios" ? 4 : 2,
          fontFamily: "Inter-Medium",
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: translate("Dashboard"),
          tabBarIcon: ({ color, size }) => (
            <Home stroke={color} width={size - 4} height={size - 4} />
          ),
        }}
      />

      <Tabs.Screen
        name="marketplace"
        options={{
          title: translate("Market"),
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag stroke={color} width={size - 4} height={size - 4} />
          ),
        }}
      />

      <Tabs.Screen
        name="chatai"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: () => (
            <View
              style={{
                bottom: 15,
                alignSelf: "center",
                // position: "absolute",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 50,
                  width: 80,
                  height: 80,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 4,
                  borderColor: "#ffffff",
                }}
                onPress={openAssistant}
              >
                <Image
                  source={require("../../assets/images/gemini.png")}
                  style={{
                    width: 60,
                    height: 60,
                    resizeMode: "contain",
                  }}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="forecast"
        options={{
          title: translate("Predictions"),
          tabBarIcon: ({ color, size }) => (
            <CloudRain stroke={color} width={size - 4} height={size - 4} />
          ),
        }}
      />

      <Tabs.Screen
        name="scheme"
        options={{
          title: translate("Schemes"),
          tabBarIcon: ({ color, size }) => (
            <Award stroke={color} width={size - 4} height={size - 4} />
          ),
        }}
      />
    </Tabs>
  );
}
