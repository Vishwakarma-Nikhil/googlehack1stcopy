import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import ImageUploader from "../common/ImageUploader";
import ActionButton from "../common/ActionButton";
import ResultCard from "../common/ResultCard";
import HistoryItem from "../common/HistoryItem";
import {
  fetchDiseasePrediction,
  fetchDiseaseHistory,
} from "../../../utils/forecast/api";
import { useUserStore } from "../../../store/userStore";

type DiseaseHistoryItem = {
  file_id: string;
  plant_name: string;
  disease_name: string;
  confidence: number;
  uploaded_at: string;
  file_url?: string;
};

type DiseaseTabProps = {
  colors: {
    text: string;
    textSecondary: string;
    [key: string]: string;
  };
  diseaseHistory: DiseaseHistoryItem[];
  setDiseaseHistory: (history: DiseaseHistoryItem[]) => void;
};

const DiseaseTab: React.FC<DiseaseTabProps> = ({
  colors,
  diseaseHistory,
  setDiseaseHistory,
}) => {
  const [diseaseImage, setDiseaseImage] = useState<any>(null);
  const [diseaseResult, setDiseaseResult] = useState<DiseaseHistoryItem | null>(
    null
  );
  const [loadingDisease, setLoadingDisease] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user } = useUserStore();

  // Load disease history when component mounts or user changes
  useEffect(() => {
    if (user?.email) {
      // Only call the API when we have a user email
      console.log("User email available, loading disease history");
      loadDiseaseHistory();
      setIsInitialLoad(false);
    } else if (isInitialLoad) {
      // On initial load with no user, set empty history without errors
      console.log("No user email available, skipping disease history fetch");
      setDiseaseHistory([]);
      setIsInitialLoad(false);
    }
  }, [user?.email]); // Only re-run when user email changes

  const loadDiseaseHistory = async () => {
    if (!user?.email) {
      console.log(
        "No user email available in loadDiseaseHistory, skipping fetch"
      );
      return;
    }

    setErrorMessage(null);
    try {
      console.log("Loading disease history for user:", user.email);
      const historyData = await fetchDiseaseHistory(user.email);
      setDiseaseHistory(historyData.history || []);
    } catch (error) {
      console.error("Error loading disease history:", error);
      // Only show error to user if it's not the initial load error
      if (!isInitialLoad) {
        setErrorMessage(
          `Failed to load history: ${
            error instanceof Error ? error.message : "Network error"
          }`
        );
      }
      setDiseaseHistory([]);
    }
  };

  const handleDiseasePrediction = async () => {
    if (!diseaseImage || !user?.email) {
      console.log("Missing image or user email");
      return;
    }

    setLoadingDisease(true);
    setErrorMessage(null);
    try {
      console.log("Predicting disease for user:", user.email);
      console.log(
        "Image details (full):",
        JSON.stringify(diseaseImage, null, 2)
      );

      // Check the structure of diseaseImage and extract URI correctly
      let imageUri;
      if (typeof diseaseImage === "string") {
        imageUri = diseaseImage;
      } else if (diseaseImage && typeof diseaseImage === "object") {
        // Try to extract URI from common image object formats
        imageUri = diseaseImage.uri || diseaseImage.path || diseaseImage.file;
      } else {
        throw new Error("Invalid image format. Please select another image.");
      }

      console.log("Extracted image URI:", imageUri);

      if (!imageUri || typeof imageUri !== "string") {
        throw new Error("Invalid image format. Please select another image.");
      }

      // Create FormData for the file upload
      const formData = new FormData();

      // Get filename from the uri
      const filename = imageUri.split("/").pop() || "plant_image.jpg";

      // Get file type from extension
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      console.log(`Using filename: ${filename}, type: ${type}`);

      // Create file object for FormData - following the exact pattern from CropTab
      formData.append("file", {
        uri:
          Platform.OS === "android"
            ? imageUri
            : imageUri.replace("file://", ""),
        name: filename,
        type,
      } as any);

      // Direct API call like in CropTab
      const apiUrl = `https://efbede333ccb.ngrok-free.app/predictions/disease?email=${encodeURIComponent(
        user.email
      )}&store=true&language=english`;

      console.log("Sending disease prediction request to:", apiUrl);

      // Make the API call without Content-Type header
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // No Content-Type header - let the browser set it with correct boundary
        },
      });

      console.log("Fetch response received, status:", response.status);

      if (!response.ok) {
        const errorText = await response.text().catch((e) => {
          console.error("Error reading response text:", e);
          return "Could not read error response";
        });
        console.error(`API error: ${response.status}`, errorText);
        throw new Error(
          `Failed to predict disease: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Disease prediction API response:", result);

      setDiseaseResult(result);

      // Refresh history after prediction
      await loadDiseaseHistory();
    } catch (error) {
      console.error("Error predicting disease:", error);

      // Display a user-friendly error message
      let displayMessage = "Prediction failed: ";

      if (error instanceof Error) {
        if (error.message.includes("Network request failed")) {
          displayMessage +=
            "Could not connect to the server. Please check your internet connection and try again.";
        } else {
          displayMessage += error.message;
        }
      } else {
        displayMessage += "An unexpected error occurred.";
      }

      setErrorMessage(displayMessage);
      setDiseaseResult(null);
    } finally {
      setLoadingDisease(false);
    }
  };

  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          <Text>Plant Disease Detection</Text>
        </Text>
        <Text
          style={[styles.sectionDescription, { color: colors.textSecondary }]}
        >
          <Text>Upload a plant image to detect diseases</Text>
        </Text>

        {!user?.email ? (
          <View
            style={[styles.warningContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.warningText, { color: colors.text }]}>
              Please log in to use disease detection features.
            </Text>
          </View>
        ) : (
          <>
            <ImageUploader
              image={diseaseImage}
              setImage={setDiseaseImage}
              uploadButtonText="Upload Plant Image"
              colors={colors}
            />

            <ActionButton
              title="Detect Disease"
              onPress={handleDiseasePrediction}
              isLoading={loadingDisease}
              isDisabled={!diseaseImage}
              icon={null}
              style={{}}
              colors={colors}
            />
          </>
        )}

        {errorMessage && !isInitialLoad && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: colors.notification },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.text }]}>
              {errorMessage}
            </Text>
            <Text
              style={[styles.errorHelpText, { color: colors.textSecondary }]}
            >
              If the problem persists, please check your internet connection or
              try again later.
            </Text>
          </View>
        )}

        {diseaseResult && (
          <ResultCard
            title="Disease Detection Result"
            data={[
              { label: "Plant:", value: diseaseResult.plant_name },
              { label: "Disease:", value: diseaseResult.disease_name },
              { label: "Confidence:", value: `${diseaseResult.confidence}%` },
              {
                label: "Date:",
                value: new Date(diseaseResult.uploaded_at).toLocaleDateString(),
              },
            ]}
            colors={colors}
          />
        )}
      </View>

      {diseaseHistory.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Text>History</Text>
          </Text>

          {diseaseHistory.map((item, index) => (
            <HistoryItem
              key={index}
              item={item}
              properties={[
                { key: "plant_name", label: "Plant:" },
                { key: "disease_name", label: "Disease:" },
                {
                  key: "confidence",
                  label: "Confidence:",
                  valueFormatter: (value: number) => `${value}%`,
                },
                {
                  key: "uploaded_at",
                  label: "Date:",
                  valueFormatter: (value: string) =>
                    new Date(value).toLocaleDateString(),
                },
              ]}
              colors={colors}
              imageUrl={item.file_url}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: "400",
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  errorHelpText: {
    fontSize: 12,
  },
  warningContainer: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  warningText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default DiseaseTab;
