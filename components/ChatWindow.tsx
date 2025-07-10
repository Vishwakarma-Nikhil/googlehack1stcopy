// components/ChatWindow.tsx
import React from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ChatWindow = ({ messages, input, setInput, onSend, loading }) => {
  const renderItem = ({ item }) => {
    const isUser = item.sender === "user";
    return (
      <View style={[styles.msgContainer, isUser ? styles.user : styles.bot]}>
        {!isUser && (
          <Image
            source={require("../assets/images/react-logo.png")}
            style={styles.avatar}
          />
        )}
        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
        >
          <Text style={styles.text}>
            {item.text || item.transcript || "..."}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.chat}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
        inverted
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type something..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
        />
        <Pressable onPress={onSend} disabled={loading} style={styles.sendBtn}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chat: { flex: 1 },
  msgContainer: {
    flexDirection: "row",
    marginVertical: 6,
    paddingHorizontal: 12,
    alignItems: "flex-end",
  },
  user: { justifyContent: "flex-end" },
  bot: { justifyContent: "flex-start" },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  bubble: { padding: 10, borderRadius: 14, maxWidth: "75%" },
  userBubble: { backgroundColor: "#00A8E1", borderTopRightRadius: 0 },
  botBubble: { backgroundColor: "#333", borderTopLeftRadius: 0 },
  text: { color: "#fff" },
  inputBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#222",
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 10,
    color: "#fff",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#00A8E1",
    padding: 10,
    borderRadius: 8,
  },
});

export default ChatWindow;
