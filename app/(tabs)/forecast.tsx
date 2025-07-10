import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

// Components
import TabNavigation from "../../components/forecast/TabNavigation";
import SoilInfoCard from "@/components/soilinfocard";
import DiseaseInfoCard from "@/components/desiscardinfo"; // create similar to SoilInfoCard

// Static data
import blacksoil from "../../components/blacksoil.json";
import earlyblight from "../../components/earlyblight.json";

function ForecastScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("soil");

  // Soil states
  const [soilImage, setSoilImage] = useState(null);
  const [soilLoading, setSoilLoading] = useState(false);
  const [showSoilAnalysis, setShowSoilAnalysis] = useState(false);

  // Disease states
  const [diseaseImage, setDiseaseImage] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [showDiseaseAnalysis, setShowDiseaseAnalysis] = useState(false);

  const pickImage = async (setImage: any, resetAnalysis: any) => {
    resetAnalysis(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const classifyImage = (setLoading: any, setShow: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShow(true);
    }, 2000);
  };

  const resetSoilAnalysis = () => {
    setSoilImage(null);
    setShowSoilAnalysis(false);
  };

  const resetDiseaseAnalysis = () => {
    setDiseaseImage(null);
    setShowDiseaseAnalysis(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={{
          backgroundColor: colors.text,
          marginBottom: 20,
          paddingBottom: 10,
        }}
      >
        <Text style={[styles.screenTitle, { color: colors.background }]}>
          Agricultural Predictions
        </Text>
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          colors={colors}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {activeTab === "soil" && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Soil Classification
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
              Upload a soil image to classify its type
            </Text>

            {showSoilAnalysis ? (
              <>
                <Text style={[styles.previewLabel, { color: colors.text }]}>
                  Uploaded Image:
                </Text>
                <Image
                  source={{ uri: soilImage }}
                  style={styles.resultImage}
                  resizeMode="cover"
                />
                <SoilInfoCard soil={blacksoil} />
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={resetSoilAnalysis}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.uploadArea,
                    {
                      borderColor: soilImage ? "transparent" : colors.text,
                      backgroundColor: soilImage ? "#f0f0f0" : "transparent",
                    },
                  ]}
                  onPress={() => pickImage(setSoilImage, setShowSoilAnalysis)}
                >
                  {soilImage ? (
                    <Image
                      source={{ uri: soilImage }}
                      style={styles.uploadedImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.uploadContent}>
                      <Text style={[styles.uploadIcon, { color: colors.text }]}>
                        📷
                      </Text>
                      <Text style={[styles.uploadText, { color: colors.text }]}>
                        Please upload soil image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.classifyButton,
                    {
                      backgroundColor: soilImage
                        ? colors.primary || "#007AFF"
                        : "#cccccc",
                      opacity: soilImage ? 1 : 0.6,
                    },
                  ]}
                  onPress={() =>
                    classifyImage(setSoilLoading, setShowSoilAnalysis)
                  }
                  disabled={!soilImage || soilLoading}
                >
                  {soilLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.classifyButtonText}>Classify Soil</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {activeTab === "disease" && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Plant Disease Classification
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
              Upload a plant image to identify its disease
            </Text>

            {showDiseaseAnalysis ? (
              <>
                <Text style={[styles.previewLabel, { color: colors.text }]}>
                  Uploaded Image:
                </Text>
                <Image
                  source={{ uri: diseaseImage }}
                  style={styles.resultImage}
                  resizeMode="cover"
                />
                <DiseaseInfoCard data={earlyblight} />
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={resetDiseaseAnalysis}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.uploadArea,
                    {
                      borderColor: diseaseImage ? "transparent" : colors.text,
                      backgroundColor: diseaseImage ? "#f0f0f0" : "transparent",
                    },
                  ]}
                  onPress={() =>
                    pickImage(setDiseaseImage, setShowDiseaseAnalysis)
                  }
                >
                  {diseaseImage ? (
                    <Image
                      source={{ uri: diseaseImage }}
                      style={styles.uploadedImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.uploadContent}>
                      <Text style={[styles.uploadIcon, { color: colors.text }]}>
                        📷
                      </Text>
                      <Text style={[styles.uploadText, { color: colors.text }]}>
                        Please upload plant image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.classifyButton,
                    {
                      backgroundColor: diseaseImage
                        ? colors.primary || "#007AFF"
                        : "#cccccc",
                      opacity: diseaseImage ? 1 : 0.6,
                    },
                  ]}
                  onPress={() =>
                    classifyImage(setDiseaseLoading, setShowDiseaseAnalysis)
                  }
                  disabled={!diseaseImage || diseaseLoading}
                >
                  {diseaseLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.classifyButtonText}>
                      Classify Disease
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginVertical: 15,
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  uploadContent: {
    alignItems: "center",
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500",
  },
  uploadedImage: {
    width: "100%",
    aspectRatio: 4 / 3, // or use 1 for square
    borderRadius: 10,
  },
  resultImage: {
    width: "100%",
    aspectRatio: 4 / 3, // same aspect ratio for consistency
    borderRadius: 10,
    marginBottom: 20,
  },

  previewLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  classifyButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  classifyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  resetButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ForecastScreen;
