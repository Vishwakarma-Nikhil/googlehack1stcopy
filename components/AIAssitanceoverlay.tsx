// // components/AIAssistantOverlay.tsx
// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import Modal from "react-native-modal";
// import { Feather, AntDesign } from "@expo/vector-icons";
// import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system";
// import { useChatAIStore } from "@/store/chataistore";
// import WavePulse from "./Wavepulse";
// import axios from "axios";

// const API_ENDPOINT = "https://efbede333ccb.ngrok-free.app/chatbot";
// const USER_EMAIL = "alice@example.com";

// const AIAssistantOverlay = () => {
//   const { isOpen, closeAssistant, openTranscript } = useChatAIStore();
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPlaying, setisPlaying] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const recordingRef = useRef<Audio.Recording | null>(null);
//   const soundRef = useRef<Audio.Sound | null>(null);

//   const startRecording = async () => {
//     console.log("started recording");
//     try {
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       recordingRef.current = recording;
//       setIsRecording(true);
//     } catch (err) {
//       console.error("Start recording error:", err);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       setIsRecording(false);
//       console.log("stopeed rrecorgding");
//       const recording = recordingRef.current;
//       if (!recording) return;

//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       recordingRef.current = null;

//       if (uri) {
//         setLoading(true);
//         await sendToAPI(uri);
//         await FileSystem.deleteAsync(uri, { idempotent: true });
//         setLoading(false);
//       }
//     } catch (err) {
//       console.error("Stop recording error:", err);
//     }
//   };

//   const sendToAPI = async (uri: string) => {
//     try {
//       const file = {
//         uri,
//         type: "audio/wav",
//         name: "input.wav",
//       };

//       const form = new FormData();
//       form.append("email", USER_EMAIL);
//       form.append("audio", file);
//       form.append("history", "");
//       form.append("language", "english");

//       const res = await axios.post(API_ENDPOINT, form, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       console.log(res.data);
//       const botResponse = res.data.history.find((m: any) => m.sender === "bot");
//       if (botResponse?.audio_url) {
//         await playBotAudio(botResponse.audio_url);
//         // await playBotAudio(
//         //   "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
//         // );
//       }
//     } catch (err) {
//       console.error("API Error:", err);
//     }
//   };

//   const playBotAudio = async (url: string) => {
//     try {
//       setisPlaying(true);
//       const { sound } = await Audio.Sound.createAsync(
//         { uri: url },
//         { shouldPlay: true }
//       );
//       soundRef.current = sound;
//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && status.didJustFinish) {
//           sound.unloadAsync();
//         }
//       });

//       setisPlaying(true);
//     } catch (err) {
//       console.error("Playback error:", err);
//     }
//   };

//   return (
//     <Modal
//       isVisible={isOpen}
//       onBackdropPress={closeAssistant}
//       style={{ margin: 0 }}
//     >
//       <View style={styles.overlay}>
//         <TouchableOpacity style={styles.closeButton} onPress={closeAssistant}>
//           <AntDesign name="closecircle" size={28} color="#fff" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.topLeftTranscript}
//           onPress={openTranscript}
//         >
//           <Feather name="list" size={26} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.centerWrapper}>
//           {isRecording && <WavePulse />}
//           <Image
//             source={require("../assets/images/gemini.png")}
//             style={styles.image}
//           />
//         </View>

//         <Text style={styles.text}>
//           {loading
//             ? "Processing..."
//             : isRecording
//             ? "Listening..."
//             : "Hold to Speak"}
//         </Text>

//         <Pressable
//           style={styles.bottomMicButton}
//           onPressIn={startRecording}
//           onPressOut={stopRecording}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Feather name="mic" size={28} color="#fff" />
//           )}
//         </Pressable>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "#000000dd",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   closeButton: {
//     position: "absolute",
//     top: 40,
//     right: 20,
//     zIndex: 99,
//   },
//   topLeftTranscript: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     zIndex: 99,
//   },
//   centerWrapper: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 40,
//   },
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     zIndex: 2,
//   },
//   text: {
//     color: "#fff",
//     fontSize: 18,
//     marginTop: 16,
//   },
//   bottomMicButton: {
//     position: "absolute",
//     bottom: 40,
//     alignSelf: "center",
//     width: 80,
//     height: 80,
//     backgroundColor: "#00A8E1",
//     borderRadius: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default AIAssistantOverlay;

// components/AIAssistantOverlay.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import { Feather, AntDesign } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useChatAIStore } from "@/store/chataistore";
import WavePulse from "./Wavepulse";

const AIAssistantOverlay = () => {
  const { isOpen, closeAssistant, openTranscript } = useChatAIStore();
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOutputting, setIsOutputting] = useState(false);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    console.log("Started recording...");
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error("Start recording error:", err);
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopped recording.");
      setIsRecording(false);

      const recording = recordingRef.current;
      if (recording) {
        await recording.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      // Simulate processing and output phases
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        setIsOutputting(true);

        // Simulate output duration (6 sec)
        setTimeout(() => {
          setIsOutputting(false);
        }, 6000);
      }, 3000);
    } catch (err) {
      console.error("Stop recording error:", err);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPickedImageUri(result.assets[0].uri);
      console.log("Selected image URI:", result.assets[0].uri);
    }
  };

  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={closeAssistant}
      style={{ margin: 0 }}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={closeAssistant}>
          <AntDesign name="closecircle" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topLeftTranscript}
          onPress={openTranscript}
        >
          <Feather name="list" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.imagePickerIcon} onPress={pickImage}>
          <Feather name="camera" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.centerWrapper}>
          {(isRecording || isOutputting) && <WavePulse />}
          <View style={styles.imageBorder}>
            <Image
              source={
                pickedImageUri
                  ? { uri: pickedImageUri }
                  : require("../assets/images/gemini.png")
              }
              style={styles.image}
            />
          </View>
        </View>

        <Text style={styles.text}>
          {loading
            ? " Processing..."
            : isOutputting
            ? " Responding..."
            : isRecording
            ? " Listening..."
            : ` Hello!\n\nHow may I help you?\n\nHold to speak `}
        </Text>

        <Pressable
          style={styles.bottomMicButton}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={loading || isOutputting}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Feather name="mic" size={28} color="#fff" />
          )}
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 99,
  },
  topLeftTranscript: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 99,
  },
  imagePickerIcon: {
    position: "absolute",
    top: 100,
    left: 20,
    zIndex: 99,
  },
  centerWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  imageBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#00A8E1",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 75,
    backgroundColor: "#fff",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginTop: 30,
    textAlign: "center",
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  bottomMicButton: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    width: 70,
    height: 70,
    backgroundColor: "#00A8E1",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AIAssistantOverlay;
