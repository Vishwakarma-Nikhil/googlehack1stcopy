import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { Feather } from "react-native-feather";
import CircularProgress from "../components/CircularProgress";
import { useUserStore } from "../store/userStore";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logoutUser } = useUserStore();

  const handleGetStarted = () => {
    router.replace("/(tabs)");
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1535912559317-99a2ae608c53?ixlib=rb-4.0.3",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.header}>
              <View
                style={[styles.logoContainer, { backgroundColor: colors.card }]}
              >
                <Feather width={24} height={24} stroke="#8B5A2B" name="leaf" />
              </View>

              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: "#8B5A2B" }]}>
                  THE NEW ERA OF
                </Text>
                <Text style={[styles.titleHighlight, { color: "#4D7C0F" }]}>
                  AGRICULTURE
                </Text>
              </View>

              <Text style={[styles.subtitle, { color: colors.text }]}>
                Sustainable farming solutions for a better tomorrow.
              </Text>
            </View>

            {/* Metrics Section */}
            <View style={styles.metricsContainer}>
              <CircularProgress
                size={90}
                strokeWidth={9}
                progress={0.12}
                progressColor="#4D7C0F"
                label="Growth"
                value="12 cm"
                icon="trending-up"
              />
              <CircularProgress
                size={90}
                strokeWidth={9}
                progress={0.75}
                progressColor="#1D4ED8"
                label="Moisture"
                value="75%"
                icon="droplet"
              />
            </View>

            {/* Button Section */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "rgba(139, 90, 43, 0.8)",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
