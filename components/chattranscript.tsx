// // components/ChatTranscript.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   Modal,
//   TextInput,
//   Pressable,
//   Image,
//   TouchableOpacity,
// } from "react-native";
// import { useChatAIStore } from "@/store/chataistore";
// import ChatDrawer from "./ChatDrawer";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";

// const API_ENDPOINT = "https://efbede333ccb.ngrok-free.app/chatbot";
// const USER_EMAIL = "alice@example.com";

// const ChatTranscript = () => {
//   const { isTranscriptOpen, closeTranscript } = useChatAIStore();
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [history, setHistory] = useState([]);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [chatList] = useState(["Chat #1", "Chat #2"]); // Replace with dynamic IDs if available

//   const fetchHistory = async () => {
//     try {
//       const form = new FormData();
//       form.append("email", USER_EMAIL);

//       const res = await axios.post(API_ENDPOINT, form, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setHistory(res.data.history.reverse());
//     } catch (err) {
//       console.error("Transcript fetch error:", err);
//     }
//   };

//   useEffect(() => {
//     if (isTranscriptOpen) fetchHistory();
//   }, [isTranscriptOpen]);

//   const handleSend = async () => {
//     if (!input.trim()) return;
//     setLoading(true);

//     const form = new FormData();
//     form.append("email", USER_EMAIL);
//     form.append("text", input);
//     form.append("language", "english");

//     try {
//       const res = await axios.post(API_ENDPOINT, form, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setHistory(res.data.history.reverse());
//       setInput("");
//     } catch (err) {
//       console.error("Send error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderMessage = ({ item }) => {
//     const isUser = item.sender === "user";
//     return (
//       <View
//         style={[
//           styles.msgContainer,
//           isUser ? styles.userAlign : styles.botAlign,
//         ]}
//       >
//         {!isUser && (
//           <Image
//             source={require("../assets/images/react-logo.png")}
//             style={styles.avatar}
//           />
//         )}
//         <View
//           style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
//         >
//           <Text style={styles.text}>
//             {item.text || item.transcript || "Audio/Image only"}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <Modal visible={isTranscriptOpen} animationType="slide">
//       <View style={styles.full}>
//         {drawerOpen && (
//           <ChatDrawer
//             chats={chatList}
//             onSelect={(chat) => {
//               console.log("Selected:", chat);
//               setDrawerOpen(false);
//               // Optionally: load chat-specific history
//             }}
//             onClose={() => setDrawerOpen(false)}
//           />
//         )}

//         <View style={styles.chatArea}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => setDrawerOpen(true)}>
//               <Ionicons name="menu" size={24} color="#fff" />
//             </TouchableOpacity>
//             <Text style={styles.headerTitle}>Chat with Assistant</Text>
//             <TouchableOpacity onPress={closeTranscript}>
//               <Ionicons name="close" size={24} color="#fff" />
//             </TouchableOpacity>
//           </View>

//           {/* Messages */}
//           <FlatList
//             data={history}
//             keyExtractor={(_, i) => i.toString()}
//             renderItem={renderMessage}
//             contentContainerStyle={{ paddingBottom: 80 }}
//             inverted
//           />

//           {/* Input Bar */}
//           <View style={styles.inputBar}>
//             <TextInput
//               placeholder="Type a message..."
//               placeholderTextColor="#ccc"
//               style={styles.input}
//               value={input}
//               onChangeText={setInput}
//             />
//             <Pressable
//               style={styles.sendBtn}
//               onPress={handleSend}
//               disabled={loading}
//             >
//               <Ionicons name="send" size={20} color="#fff" />
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   full: { flex: 1, flexDirection: "row" },
//   chatArea: {
//     flex: 1,
//     backgroundColor: "#1A1A2E",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 14,
//     backgroundColor: "#121212",
//     justifyContent: "space-between",
//     borderBottomWidth: 1,
//     borderBottomColor: "#333",
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 17,
//     fontWeight: "600",
//   },
//   msgContainer: {
//     flexDirection: "row",
//     paddingHorizontal: 12,
//     marginVertical: 6,
//     alignItems: "flex-end",
//   },
//   userAlign: { justifyContent: "flex-end" },
//   botAlign: { justifyContent: "flex-start" },
//   avatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     marginRight: 8,
//   },
//   bubble: {
//     maxWidth: "80%",
//     padding: 10,
//     borderRadius: 14,
//   },
//   userBubble: {
//     backgroundColor: "#00A8E1",
//     borderTopRightRadius: 0,
//     marginLeft: "auto",
//   },
//   botBubble: {
//     backgroundColor: "#2D2D44",
//     borderTopLeftRadius: 0,
//   },
//   text: {
//     color: "#fff",
//     fontSize: 15,
//   },
//   inputBar: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     backgroundColor: "#121212",
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#333",
//   },
//   input: {
//     flex: 1,
//     color: "#fff",
//     fontSize: 16,
//     backgroundColor: "#222",
//     borderRadius: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   sendBtn: {
//     marginLeft: 10,
//     backgroundColor: "#00A8E1",
//     padding: 10,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default ChatTranscript;

// ChatTranscript.tsx (Updated with hardcoded NLP + Image Picker support)
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useChatAIStore } from "@/store/chataistore";
import ChatDrawer from "./ChatDrawer";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import blacksoil from "@/components/blacksoil.json";
import earlyblight from "@/components/earlyblight.json";

const ChatTranscript = () => {
  const { isTranscriptOpen, closeTranscript } = useChatAIStore();
  const [input, setInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [chatList] = useState(["Chat #1", "Chat #2"]);
  const scrollRef = useRef();
  const [isNextPlant, setIsNextPlant] = useState(true);

  const appendMessage = (sender, text, type = "text", imageUri = null) => {
    const msg = { sender, text, type, imageUri };
    setHistory((prev) => [...prev, msg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Permission denied");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      // Show the image in chat
      appendMessage("user", "[Image uploaded]", "image", uri);

      // Conditional response based on toggle
      if (isNextPlant) {
        appendMessage(
          "bot",
          `🌿 *Detected Plant Disease: Early Blight*\n${earlyblight.summary}`
        );
      } else {
        appendMessage(
          "bot",
          `🧪 *Soil Classification: Black Soil*\n${blacksoil.summary}`
        );
      }

      // Flip the toggle for next upload
      setIsNextPlant((prev) => !prev);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    appendMessage("user", input);

    const msg = input.toLowerCase();
    if (msg.includes("soil")) {
      appendMessage("bot", `🧪 *Soil Type: Black Soil*\n${blacksoil.summary}`);
    } else if (
      msg.includes("disease") ||
      msg.includes("blight") ||
      msg.includes("leaf")
    ) {
      appendMessage(
        "bot",
        `🌿 *Plant Disease: Early Blight*\n${earlyblight.summary}`
      );
    } else if (msg.includes("cauliflower")) {
      appendMessage(
        "bot",
        "📊 *Cauliflower Market*: Price stable at ₹20/kg. Demand high in urban areas. Best season: Nov–Feb."
      );
    } else if (msg.includes("government") || msg.includes("scheme")) {
      appendMessage(
        "bot",
        `🏛 *Govt Schemes*:\n- PM Kisan: ₹2000/quarter\n- PMFBY: Crop insurance up to 90%\n- Soil Health Card: Free testing`
      );
    } else {
      appendMessage(
        "bot",
        "🤖 I can help with:\n- Soil classification\n- Plant disease detection\n- Market crop analysis\n- Government schemes\nTry asking about them!"
      );
    }

    setInput("");
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.sender === "user";
    return (
      <View
        key={index}
        style={[
          styles.msgContainer,
          isUser ? styles.userAlign : styles.botAlign,
        ]}
      >
        {!isUser && (
          <Image
            source={require("../assets/images/gemini.png")}
            style={styles.avatar}
          />
        )}
        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
        >
          {msg.type === "image" ? (
            <Image source={{ uri: msg.imageUri }} style={styles.imageMsg} />
          ) : (
            <Text style={styles.text}>{msg.text}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={isTranscriptOpen} animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.full}
      >
        {drawerOpen && (
          <ChatDrawer
            chats={chatList}
            onSelect={(chat) => {
              console.log("Selected:", chat);
              setDrawerOpen(false);
            }}
            onClose={() => setDrawerOpen(false)}
          />
        )}

        <View style={styles.chatArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setDrawerOpen(!drawerOpen)}>
              <Ionicons name="menu" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chat with Assistant</Text>
            <TouchableOpacity onPress={closeTranscript}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Chat View */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: 90 }}
            ref={scrollRef}
          >
            {history.map((msg, index) => renderMessage(msg, index))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputBar}>
            <TouchableOpacity onPress={pickImage}>
              <Feather
                name="camera"
                size={22}
                color="#000"
                style={{ marginRight: 8 }}
              />
            </TouchableOpacity>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#666"
              style={styles.input}
              value={input}
              onChangeText={setInput}
            />
            <Pressable style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  full: { flex: 1, flexDirection: "row" },
  chatArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f1f1f1",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  msgContainer: {
    flexDirection: "row",
    marginVertical: 6,
    alignItems: "flex-end",
  },
  userAlign: { justifyContent: "flex-end", alignSelf: "flex-end" },
  botAlign: { justifyContent: "flex-start", alignSelf: "flex-start" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
    position: "fixed",
  },
  bubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: "#00A8E1",
    borderTopRightRadius: 0,
    marginLeft: "auto",
  },
  botBubble: {
    backgroundColor: "#e0e0e0",
    borderTopLeftRadius: 0,
  },
  text: {
    color: "#000",
    fontSize: 15,
  },
  imageMsg: {
    width: 180,
    height: 180,
    borderRadius: 10,
  },
  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#eee",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    color: "#000",
    fontSize: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#00A8E1",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatTranscript;
