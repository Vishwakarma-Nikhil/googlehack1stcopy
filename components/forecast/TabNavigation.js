import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";

const TabNavigation = ({ activeTab, setActiveTab, colors }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "soil" && { backgroundColor: colors.primary },
        ]}
        onPress={() => setActiveTab("soil")}
      >
        <Feather name="layers" size={22} color="#fff" />
        <Text
          style={{
            color: "#fff",
            fontSize: 12,
            marginLeft: 6,
          }}
        ></Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "disease" && { backgroundColor: colors.primary },
        ]}
        onPress={() => setActiveTab("disease")}
      >
        <Feather name="activity" size={22} color="#fff" />
        <Text
          style={{
            color: "#fff",
            fontSize: 12,
            marginLeft: 6,
          }}
        ></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
});

export default TabNavigation;
