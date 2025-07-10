import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import ImageUploader from "../common/ImageUploader";
import ActionButton from "../common/ActionButton";
import ResultCard from "../common/ResultCard";
import HistoryItem from "../common/HistoryItem";
import {
  fetchSoilPrediction,
  fetchSoilHistory,
} from "../../../utils/forecast/api";
import { useUserStore } from "../../../store/userStore";

type SoilHistoryItem = {
  file_id: string;
  soil_type: string;
  confidence: number;
  uploaded_at: string;
  file_url?: string;
};

type SoilTabProps = {
  colors: {
    text: string;
    textSecondary: string;
    [key: string]: any;
  };
  soilHistory: SoilHistoryItem[];
  setSoilHistory?: (history: SoilHistoryItem[]) => void;
};

const SoilTab: React.FC<SoilTabProps> = ({
  colors,
  soilHistory,
  setSoilHistory,
}) => {
  const [soilImage, setSoilImage] = useState<any>(null);
  const [soilResult, setSoilResult] = useState<SoilHistoryItem | null>(null);
  const [loadingSoil, setLoadingSoil] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [internalSoilHistory, setInternalSoilHistory] = useState<
    SoilHistoryItem[]
  >(soilHistory || []);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user } = useUserStore();

  // Load soil history when component mounts or user changes
  useEffect(() => {
    if (user?.email && user.email.trim()) {
      console.log(
        "User email available, loading soil history for:",
        user.email
      );
      loadSoilHistory();
    } else {
      console.log("No valid user email available, skipping soil history fetch");
      // Clear any existing history and errors when no user
      if (typeof setSoilHistory === "function") {
        setSoilHistory([]);
      } else {
        setInternalSoilHistory([]);
      }
      setErrorMessage(null);
    }
    setIsInitialLoad(false);
  }, [user?.email]);

  // Load soil history
  const loadSoilHistory = async () => {
    if (!user?.email || !user.email.trim()) {
      console.log("No valid user email available, skipping soil history fetch");
      return;
    }

    setLoadingHistory(true);
    setErrorMessage(null);

    try {
      console.log("Loading soil history for user:", user.email);
      const historyData = await fetchSoilHistory(user.email);

      // Update either parent state if function exists, or internal state
      if (typeof setSoilHistory === "function") {
        setSoilHistory(historyData.history || []);
      } else {
        setInternalSoilHistory(historyData.history || []);
      }
    } catch (error) {
      console.error("Error loading soil history:", error);

      // Only show error message if it's not related to missing user email
      const errorMessage =
        error instanceof Error ? error.message : "Network error";
      if (!errorMessage.toLowerCase().includes("user email is required")) {
        setErrorMessage(`Failed to load history: ${errorMessage}`);
      }

      // Clear history on error
      if (typeof setSoilHistory === "function") {
        setSoilHistory([]);
      } else {
        setInternalSoilHistory([]);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle soil prediction
  const handleSoilPrediction = async () => {
    if (!user?.email || !user.email.trim()) {
      setErrorMessage("Please log in to use soil classification features");
      return;
    }

    if (!soilImage) {
      setErrorMessage("Please upload a soil image first");
      return;
    }

    setLoadingSoil(true);
    setErrorMessage(null);

    try {
      console.log("Predicting soil type for user:", user.email);
      console.log("Image details (full):", JSON.stringify(soilImage, null, 2));

      // Check the structure of soilImage and extract URI correctly
      let imageUri;
      if (typeof soilImage === "string") {
        imageUri = soilImage;
      } else if (soilImage && typeof soilImage === "object") {
        // Try to extract URI from common image object formats
        imageUri = soilImage.uri || soilImage.path || soilImage.file;
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
      const filename = imageUri.split("/").pop() || "soil_image.jpg";

      // Get file type from extension
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      console.log(`Using filename: ${filename}, type: ${type}`);

      // Create file object for FormData
      formData.append("file", {
        uri:
          Platform.OS === "android"
            ? imageUri
            : imageUri.replace("file://", ""),
        name: filename,
        type,
      } as any);

      // API endpoint with query parameters
      const apiUrl = `https://3c160def8258.ngrok-free.app/predictions/soil_type?email=${encodeURIComponent(
        user.email
      )}&store=true&language=english`;

      console.log("Sending soil classification request to:", apiUrl);

      // Make the API call
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // Don't set Content-Type header - let fetch set it with the correct boundary
        },
      });

      console.log("Soil classification response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text().catch((e) => {
          console.error("Error reading response text:", e);
          return "Could not read error response";
        });
        console.error(`API error: ${response.status}`, errorText);
        throw new Error(
          `Failed to classify soil: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Soil classification API response:", result);

      setSoilResult(result);

      // Refresh history after prediction
      await loadSoilHistory();
    } catch (error) {
      console.error("Error classifying soil:", error);

      // Display a user-friendly error message
      let displayMessage = "Classification failed: ";

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
      setSoilResult(null);
    } finally {
      setLoadingSoil(false);
    }
  };

  // Get the history from either props or internal state
  const currentSoilHistory =
    typeof setSoilHistory === "function" ? soilHistory : internalSoilHistory;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.sectionContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          <Text>Soil Classification</Text>
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            { color: colors.text, opacity: 0.8 },
          ]}
        >
          <Text>Upload a soil image to classify its type</Text>
        </Text>

        {!user?.email || !user.email.trim() ? (
          <View
            style={[
              styles.warningContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={[styles.warningText, { color: colors.text }]}>
              Please log in to use soil classification features.
            </Text>
          </View>
        ) : (
          <View style={styles.contentWrapper}>
            <ImageUploader
              image={soilImage}
              setImage={setSoilImage}
              uploadButtonText="Upload Soil Image"
              colors={{
                ...colors,
                text: colors.text,
                background: colors.background,
                card: colors.text,
                border: colors.textSecondary,
              }}
            />

            <ActionButton
              title="Classify Soil"
              onPress={handleSoilPrediction}
              isLoading={loadingSoil}
              isDisabled={!soilImage}
              icon={null}
              colors={{
                ...colors,
                primary: colors.primary,
                text: colors.text,
              }}
              style={styles.actionButton}
            />
          </View>
        )}

        {errorMessage && !isInitialLoad && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: colors.error + "20" },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.error }]}>
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

        {soilResult && (
          <ResultCard
            title="Soil Classification Result"
            data={[
              { label: "Soil Type:", value: soilResult.soil_type },
              { label: "Confidence:", value: `${soilResult.confidence}%` },
              {
                label: "Date:",
                value: new Date(soilResult.uploaded_at).toLocaleDateString(),
              },
            ]}
            colors={colors}
          />
        )}
      </View>

      {user?.email && user.email.trim() && currentSoilHistory.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Text>History</Text>
          </Text>

          {loadingHistory ? (
            <View style={styles.loadingContainer}>
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Loading history...
              </Text>
            </View>
          ) : (
            currentSoilHistory.map((item, index) => (
              <HistoryItem
                key={index}
                item={item}
                properties={[
                  { key: "soil_type", label: "Soil Type:" },
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
            ))
          )}
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
  contentWrapper: {
    gap: 16,
  },
  actionButton: {
    marginTop: 8,
  },
  warningContainer: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
  },
  warningText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    lineHeight: 20,
  },
  errorHelpText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "400",
  },
});

export default SoilTab;
