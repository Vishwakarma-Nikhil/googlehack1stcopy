import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

interface ChatDrawerProps {
  chats: string[];
  onSelect: (chatId: string) => void;
  onClose: () => void;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({
  chats,
  onSelect,
  onClose,
}) => {
  return (
    <View style={styles.drawer}>
      <Text style={styles.title}>My Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.chatText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    width: 240,
    backgroundColor: "#fff",
    padding: 16,
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
  },
  title: {
    color: "#00A8E1",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  chatItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  chatText: {
    color: "#333",
    fontSize: 16,
  },
  closeBtn: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#00A8E1",
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ChatDrawer;
