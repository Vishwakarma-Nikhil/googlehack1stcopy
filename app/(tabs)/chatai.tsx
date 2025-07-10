import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useChatAIStore } from "@/store/chataistore";

const Chatai = () => {
  const { openAssistant } = useChatAIStore();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>chatai</Text>

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 40,
          alignSelf: "center",
          backgroundColor: "#00A8E1",
          padding: 16,
          borderRadius: 50,
        }}
        onPress={openAssistant}
      >
        <Image
          source={require("../../assets/images/react-logo.png")}
          style={{ width: 30, height: 30 }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Chatai;
