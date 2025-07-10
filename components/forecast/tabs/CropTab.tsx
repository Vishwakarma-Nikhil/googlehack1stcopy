import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  Platform,
  Modal,
} from "react-native";
import { Card } from "../../Card";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useUserStore } from "@/store/userStore";
import PredictionHistoryItem from "../history/PredictionHistoryItem";
import PriceHistoryItem from "../history/PriceHistoryItem";

interface CropTabProps {
  colors: {
    background: string;
    text: string;
    primary: string;
    card: string;
    border: string;
  };
}

// Updated interface to match API response
interface CropRecommendation {
  crop_name: string;
  recommendation_score?: number;
  suitability?: "high" | "medium" | "low"; // For backward compatibility
  prices?: number[];
  dates?: string[];
  yield_per_kg?: number;
  contracts?: string[];
  rank?: number;
  waterRequirement?: string; // For backward compatibility
  growthPeriod?: string; // For backward compatibility
  notes?: string; // For backward compatibility
  explanation_points?: Array<{
    reason_type: string;
    detail: string;
    ai_component?: string;
  }>;
  key_metrics?: {
    expected_yield_range?: string;
    price_forecast_trend?: string;
    estimated_input_cost_category?: string;
    primary_fertilizer_needs?: string;
  };
  primary_risks?: string[];
  suggested_pesticides?: Array<{
    chemical_name: string;
    target_pest: string;
    timing_stage: string;
  }>;
  relevant_news?: Array<{
    headline: string;
    url: string;
    source: string;
    date: string;
  }>;
  plotting_data?: {
    price_forecast_chart?: {
      description?: string;
      data: Array<{
        date: string;
        predicted_price_min: number;
        predicted_price_max: number;
      }>;
    };
    water_need_chart?: {
      description?: string;
      data: Array<{
        growth_stage: string;
        relative_need_level: number;
      }>;
    };
    fertilizer_schedule_chart?: {
      description?: string;
      data: Array<{
        stage: string;
        timing: string;
        nutrients: string;
      }>;
    };
  };
}

interface WeatherPrediction {
  month: string;
  temperature_2m_max: number;
  temperature_2m_min: number;
  precipitation_sum: number;
  wind_speed_10m_max: number;
  shortwave_radiation_sum: number;
}

interface CropPredictionResponse {
  soil_type: string;
  soil_type_confidence: number;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  weather_predictions: WeatherPrediction[];
  land_size: number;
  crops_data: CropRecommendation[];
  subsidies: string[];
  request_details?: {
    soil_type?: string;
    latitude?: number;
    longitude?: number;
    land_size_acres?: number;
    planting_date_estimate?: string;
    timestamp?: string;
  };
  news_headlines_considered?: string[];
  news_impact_summary_llm?: string;
  overall_llm_summary?: string;
  weather_context_summary?: string;
}

const CropTab: React.FC<CropTabProps> = ({ colors }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>(
    []
  );
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 3))
  );
  const [acres, setAcres] = useState("5");
  const [soilType, setSoilType] = useState<string>("");
  const [soilImage, setSoilImage] = useState<string | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [predictionResponse, setPredictionResponse] =
    useState<CropPredictionResponse | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryTab, setSelectedHistoryTab] = useState("predictions");
  const { user } = useUserStore();
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(
    null
  );
  const [showCropDetail, setShowCropDetail] = useState(false);
  const [pricePredictionLoading, setPricePredictionLoading] = useState(false);
  const [pricePredictionData, setPricePredictionData] = useState<{
    dates: string[];
    prices: number[];
  } | null>(null);

  const soilTypes = [
    "Sandy",
    "Clay",
    "Loamy",
    "Silty",
    "Peaty",
    "Chalky",
    "Saline",
  ];

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else {
      setEmail("farmer@example.com"); // Default email if user is not logged in
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      setError("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSoilImage(result.assets[0].uri);
      setSoilType(""); // Clear soil type if image is selected
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const fetchCropRecommendations = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!soilType && !soilImage) {
      setError("Please select a soil type or upload a soil image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create the base URL with query parameters that apply to both cases
      let apiUrl = `https://efbede333ccb.ngrok-free.app/predictions/crop_prediction?email=${encodeURIComponent(
        email
      )}&end_date=${formatDate(endDate)}&acres=${acres}&start_date=${formatDate(
        startDate
      )}&language=english`;

      // For JSON request with soil_type
      if (soilType) {
        // Add soil_type to the URL
        apiUrl += `&soil_type=${encodeURIComponent(soilType)}`;

        console.log("Sending request to:", apiUrl);

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error: ${response.status}`, errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log("API Response:", data);

          // Process the API response
          processApiResponse(data);
        } catch (apiError) {
          console.error("API call failed:", apiError);
          throw apiError; // Re-throw to be caught by the outer catch
        }
      }
      // For FormData request with file
      else if (soilImage) {
        try {
          // Create FormData for the file upload
          const formData = new FormData();

          // Add file
          const filename = soilImage.split("/").pop() || "soil_image.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";

          formData.append("file", {
            uri:
              Platform.OS === "android"
                ? soilImage
                : soilImage.replace("file://", ""),
            name: filename,
            type,
          } as any);

          console.log("Sending form data with file to:", apiUrl);

          // Make the API call with proper multipart/form-data
          const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
              "Content-Type": "multipart/form-data",
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error: ${response.status}`, errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log("API Response:", data);

          // Process the API response
          processApiResponse(data);
        } catch (apiError) {
          console.error("API call failed with file:", apiError);
          throw apiError; // Re-throw to be caught by the outer catch
        }
      }
    } catch (err) {
      setError("Failed to fetch crop recommendations. Please try again.");
      console.error("Error fetching crop recommendations:", err);

      // Fallback to mock data for testing
      const mockResponse: CropPredictionResponse = {
        soil_type: soilType || "Loamy",
        soil_type_confidence: 95.0,
        latitude: 28.7041,
        longitude: 77.1025,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        weather_predictions: [
          {
            month: "04",
            temperature_2m_max: 30.5,
            temperature_2m_min: 29.4,
            precipitation_sum: 0.0,
            wind_speed_10m_max: 22.5,
            shortwave_radiation_sum: 25.26,
          },
          {
            month: "05",
            temperature_2m_max: 32.1,
            temperature_2m_min: 30.0,
            precipitation_sum: 1.2,
            wind_speed_10m_max: 20.0,
            shortwave_radiation_sum: 24.5,
          },
        ],
        land_size: parseInt(acres),
        crops_data: [
          {
            crop_name: "Wheat",
            prices: [100, 105, 110, 108, 112],
            dates: [
              formatDate(new Date(startDate.getTime())),
              formatDate(new Date(startDate.getTime() + 86400000)),
              formatDate(new Date(startDate.getTime() + 86400000 * 2)),
              formatDate(new Date(startDate.getTime() + 86400000 * 3)),
              formatDate(new Date(startDate.getTime() + 86400000 * 4)),
            ],
            contracts: ["id1"],
            yield_per_kg: 2500,
            recommendation_score: 85,
          },
          {
            crop_name: "Rice",
            prices: [150, 155, 153, 160, 158],
            dates: [
              formatDate(new Date(startDate.getTime())),
              formatDate(new Date(startDate.getTime() + 86400000)),
              formatDate(new Date(startDate.getTime() + 86400000 * 2)),
              formatDate(new Date(startDate.getTime() + 86400000 * 3)),
              formatDate(new Date(startDate.getTime() + 86400000 * 4)),
            ],
            contracts: ["id2"],
            yield_per_kg: 2200,
            recommendation_score: 72,
          },
          {
            crop_name: "Maize",
            prices: [90, 92, 94, 95, 97],
            dates: [
              formatDate(new Date(startDate.getTime())),
              formatDate(new Date(startDate.getTime() + 86400000)),
              formatDate(new Date(startDate.getTime() + 86400000 * 2)),
              formatDate(new Date(startDate.getTime() + 86400000 * 3)),
              formatDate(new Date(startDate.getTime() + 86400000 * 4)),
            ],
            contracts: ["id3"],
            yield_per_kg: 3000,
            recommendation_score: 78,
          },
        ],
        subsidies: ["id1", "id2"],
      };

      setPredictionResponse(mockResponse);
      setRecommendations(
        mockResponse.crops_data.sort(
          (a, b) =>
            (b.recommendation_score || 0) - (a.recommendation_score || 0)
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process API response
  const processApiResponse = (data: any) => {
    if (!data) {
      throw new Error("Empty response received");
    }

    // Extract crops data and recommendations from the new API response format
    if (data.recommendations && Array.isArray(data.recommendations)) {
      const cropsData = data.recommendations.map((rec: any) => ({
        ...rec,
        crop_name: rec.crop_name,
        recommendation_score: rec.recommendation_score,
        explanation_points: rec.explanation_points,
        key_metrics: rec.key_metrics,
        primary_risks: rec.primary_risks,
        suggested_pesticides: rec.suggested_pesticides,
        plotting_data: rec.plotting_data,
        relevant_news: rec.relevant_news,
      }));

      // Sort by recommendation score
      const sortedCrops = cropsData.sort(
        (a: any, b: any) =>
          (b.recommendation_score || 0) - (a.recommendation_score || 0)
      );

      // Update prediction response and recommendations
      setPredictionResponse({
        soil_type: data.request_details?.soil_type || "Unknown",
        soil_type_confidence: 0,
        latitude: data.request_details?.latitude || 0,
        longitude: data.request_details?.longitude || 0,
        start_date:
          data.request_details?.planting_date_estimate || formatDate(startDate),
        end_date: formatDate(endDate),
        weather_predictions: [], // We'll need to extract weather data if available
        land_size: data.request_details?.land_size_acres || parseInt(acres),
        crops_data: sortedCrops,
        subsidies: [],
        request_details: data.request_details,
        news_headlines_considered: data.news_headlines_considered,
        news_impact_summary_llm: data.news_impact_summary_llm,
        overall_llm_summary: data.overall_llm_summary,
        weather_context_summary: data.weather_context_summary,
      });
      setRecommendations(sortedCrops);
    } else {
      throw new Error(
        "Invalid API response format: missing recommendations array"
      );
    }
  };

  // Function to fetch price prediction for a specific crop
  const fetchPricePrediction = async (cropName: string) => {
    setPricePredictionLoading(true);
    setPricePredictionData(null);

    try {
      const apiUrl = `https://efbede333ccb.ngrok-free.app/predictions/prices?crop_type=${encodeURIComponent(
        cropName
      )}&email=${encodeURIComponent(email)}&end_date=${formatDate(
        new Date(Date.now() + 86400000 * 90)
      )}&start_date=${formatDate(new Date())}&store=true&language=english`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to predict prices: ${response.status}`);
      }

      const data = await response.json();

      if (
        data &&
        data.dates &&
        data.prices &&
        Array.isArray(data.dates) &&
        Array.isArray(data.prices)
      ) {
        setPricePredictionData({
          dates: data.dates,
          prices: data.prices,
        });
      } else {
        throw new Error("Invalid price prediction response format");
      }
    } catch (err) {
      console.error("Error predicting prices:", err);
      // Set some mock data for fallback
      setPricePredictionData({
        dates: [
          formatDate(new Date()),
          formatDate(new Date(Date.now() + 86400000 * 30)),
          formatDate(new Date(Date.now() + 86400000 * 60)),
          formatDate(new Date(Date.now() + 86400000 * 90)),
        ],
        prices: [100, 105, 110, 115],
      });
    } finally {
      setPricePredictionLoading(false);
    }
  };

  // Function to show crop detail
  const showCropDetails = (crop: CropRecommendation) => {
    setSelectedCrop(crop);
    setShowCropDetail(true);
    fetchPricePrediction(crop.crop_name);
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return "#4CAF50"; // high - green
    if (score >= 60) return "#FFC107"; // medium - amber
    return "#F44336"; // low - red
  };

  const renderWeatherPredictions = () => {
    if (
      !predictionResponse?.weather_predictions ||
      predictionResponse.weather_predictions.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.weatherContainer}>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          <Text>Weather Forecast</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {predictionResponse.weather_predictions.map((prediction, index) => (
            <Card
              key={index}
              style={[styles.weatherCard, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.weatherMonth, { color: colors.text }]}>
                Month: {prediction.month}
              </Text>
              <View style={styles.weatherDetail}>
                <Text style={[styles.weatherLabel, { color: colors.text }]}>
                  Max Temp:
                </Text>
                <Text style={[styles.weatherValue, { color: colors.text }]}>
                  {prediction.temperature_2m_max}°C
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={[styles.weatherLabel, { color: colors.text }]}>
                  Min Temp:
                </Text>
                <Text style={[styles.weatherValue, { color: colors.text }]}>
                  {prediction.temperature_2m_min}°C
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={[styles.weatherLabel, { color: colors.text }]}>
                  Rainfall:
                </Text>
                <Text style={[styles.weatherValue, { color: colors.text }]}>
                  {prediction.precipitation_sum}mm
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={[styles.weatherLabel, { color: colors.text }]}>
                  Wind Speed:
                </Text>
                <Text style={[styles.weatherValue, { color: colors.text }]}>
                  {prediction.wind_speed_10m_max}km/h
                </Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Function to simplify price data for better visualization
  const simplifyChartData = (
    dates: string[],
    prices: number[],
    maxPoints = 6
  ) => {
    if (dates.length <= maxPoints) return { dates, prices };

    const step = Math.ceil(dates.length / maxPoints);
    const simplifiedDates: string[] = [];
    const simplifiedPrices: number[] = [];

    for (let i = 0; i < dates.length; i += step) {
      // Take average of prices in this segment
      let sum = 0;
      let count = 0;

      for (let j = i; j < i + step && j < prices.length; j++) {
        sum += prices[j];
        count++;
      }

      simplifiedDates.push(dates[i]);
      simplifiedPrices.push(Math.round(sum / count));
    }

    return { dates: simplifiedDates, prices: simplifiedPrices };
  };

  const renderPriceChart = (crop: CropRecommendation) => {
    if (!crop.prices || !crop.dates || crop.prices.length === 0) return null;

    const screenWidth = Dimensions.get("window").width - 40;
    const { dates, prices } = simplifyChartData(crop.dates, crop.prices);

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Price Trend
        </Text>
        <LineChart
          data={{
            labels: dates.map((date) => {
              const d = new Date(date);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }),
            datasets: [
              {
                data: prices,
                strokeWidth: 3,
              },
            ],
          }}
          width={screenWidth}
          height={180}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => colors.text,
            style: {
              borderRadius: 8,
            },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: colors.primary,
            },
            propsForBackgroundLines: {
              strokeDasharray: "",
              strokeWidth: 1,
              stroke: colors.text + "20",
            },
          }}
          bezier
          style={styles.chart}
          fromZero={false}
        />
      </View>
    );
  };

  const navigateToHistory = () => {
    // Navigate to the history screen
    setShowHistory(true);
  };

  const renderHistoryModal = () => {
    return (
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              History
            </Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Text style={[styles.closeButton, { color: colors.primary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedHistoryTab === "predictions" && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setSelectedHistoryTab("predictions")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      selectedHistoryTab === "predictions"
                        ? colors.primary
                        : colors.text,
                  },
                ]}
              >
                Predictions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedHistoryTab === "prices" && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setSelectedHistoryTab("prices")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      selectedHistoryTab === "prices"
                        ? colors.primary
                        : colors.text,
                  },
                ]}
              >
                Prices
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {selectedHistoryTab === "predictions" ? (
              <PredictionHistoryItem
                email={email}
                colors={colors}
                getSuitabilityColor={getSuitabilityColor}
              />
            ) : (
              <PriceHistoryItem email={email} colors={colors} />
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Render crop detail modal
  const renderCropDetailModal = () => {
    if (!selectedCrop) return null;

    return (
      <Modal
        visible={showCropDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCropDetail(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedCrop.crop_name}
            </Text>
            <TouchableOpacity onPress={() => setShowCropDetail(false)}>
              <Text style={[styles.closeButton, { color: colors.primary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Recommendation Score */}
            <View style={styles.detailSection}>
              <View style={styles.scoreContainer}>
                <View
                  style={[
                    styles.scoreBadge,
                    {
                      backgroundColor: getSuitabilityColor(
                        selectedCrop.recommendation_score || 0
                      ),
                    },
                  ]}
                >
                  <Text style={styles.scoreText}>
                    {(selectedCrop.recommendation_score || 0).toFixed(1)}%
                  </Text>
                </View>
                <Text style={[styles.scoreLabel, { color: colors.text }]}>
                  Recommendation Score
                </Text>
              </View>

              {/* Key Metrics */}
              {selectedCrop.key_metrics && (
                <View style={styles.metricsContainer}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Key Metrics
                  </Text>

                  {selectedCrop.key_metrics.expected_yield_range && (
                    <View style={styles.metricRow}>
                      <Text
                        style={[styles.metricLabel, { color: colors.text }]}
                      >
                        Expected Yield:
                      </Text>
                      <Text
                        style={[styles.metricValue, { color: colors.text }]}
                      >
                        {selectedCrop.key_metrics.expected_yield_range}
                      </Text>
                    </View>
                  )}

                  {selectedCrop.key_metrics.price_forecast_trend && (
                    <View style={styles.metricRow}>
                      <Text
                        style={[styles.metricLabel, { color: colors.text }]}
                      >
                        Price Trend:
                      </Text>
                      <Text
                        style={[styles.metricValue, { color: colors.text }]}
                      >
                        {selectedCrop.key_metrics.price_forecast_trend}
                      </Text>
                    </View>
                  )}

                  {selectedCrop.key_metrics.estimated_input_cost_category && (
                    <View style={styles.metricRow}>
                      <Text
                        style={[styles.metricLabel, { color: colors.text }]}
                      >
                        Input Cost:
                      </Text>
                      <Text
                        style={[styles.metricValue, { color: colors.text }]}
                      >
                        {selectedCrop.key_metrics.estimated_input_cost_category}
                      </Text>
                    </View>
                  )}

                  {selectedCrop.key_metrics.primary_fertilizer_needs && (
                    <View style={styles.metricRow}>
                      <Text
                        style={[styles.metricLabel, { color: colors.text }]}
                      >
                        Fertilizer Needs:
                      </Text>
                      <Text
                        style={[styles.metricValue, { color: colors.text }]}
                      >
                        {selectedCrop.key_metrics.primary_fertilizer_needs}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Price Prediction */}
              <View style={styles.priceContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Price Forecast
                </Text>

                {pricePredictionLoading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : pricePredictionData ? (
                  <LineChart
                    data={{
                      labels: simplifyChartData(
                        pricePredictionData.dates,
                        pricePredictionData.prices
                      ).dates.map((date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }),
                      datasets: [
                        {
                          data: simplifyChartData(
                            pricePredictionData.dates,
                            pricePredictionData.prices
                          ).prices,
                          strokeWidth: 3,
                        },
                      ],
                    }}
                    width={Dimensions.get("window").width - 60}
                    height={200}
                    chartConfig={{
                      backgroundColor: colors.card,
                      backgroundGradientFrom: colors.card,
                      backgroundGradientTo: colors.card,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                      labelColor: (opacity = 1) => colors.text,
                      style: {
                        borderRadius: 8,
                      },
                      propsForDots: {
                        r: "5",
                        strokeWidth: "2",
                        stroke: colors.primary,
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: "",
                        strokeWidth: 1,
                        stroke: colors.text + "20",
                      },
                    }}
                    bezier
                    style={styles.chart}
                    fromZero={false}
                  />
                ) : (
                  <Text style={[styles.noDataText, { color: colors.text }]}>
                    No price forecast data available
                  </Text>
                )}

                {pricePredictionData && (
                  <View style={styles.priceSummary}>
                    <View style={styles.priceRangeItem}>
                      <Text
                        style={[styles.priceRangeLabel, { color: colors.text }]}
                      >
                        Min Price:
                      </Text>
                      <Text
                        style={[styles.priceRangeValue, { color: colors.text }]}
                      >
                        ₹{Math.min(...pricePredictionData.prices)}
                      </Text>
                    </View>
                    <View style={styles.priceRangeItem}>
                      <Text
                        style={[styles.priceRangeLabel, { color: colors.text }]}
                      >
                        Max Price:
                      </Text>
                      <Text
                        style={[styles.priceRangeValue, { color: colors.text }]}
                      >
                        ₹{Math.max(...pricePredictionData.prices)}
                      </Text>
                    </View>
                    <View style={styles.priceRangeItem}>
                      <Text
                        style={[styles.priceRangeLabel, { color: colors.text }]}
                      >
                        Avg Price:
                      </Text>
                      <Text
                        style={[styles.priceRangeValue, { color: colors.text }]}
                      >
                        ₹
                        {Math.round(
                          pricePredictionData.prices.reduce(
                            (a, b) => a + b,
                            0
                          ) / pricePredictionData.prices.length
                        )}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Explanation Points */}
              {selectedCrop.explanation_points &&
                selectedCrop.explanation_points.length > 0 && (
                  <View style={styles.explanationContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Analysis
                    </Text>

                    {selectedCrop.explanation_points.map((point, index) => (
                      <View key={index} style={styles.explanationPoint}>
                        <Text
                          style={[
                            styles.explanationTitle,
                            { color: colors.primary },
                          ]}
                        >
                          {point.reason_type}
                        </Text>
                        <Text
                          style={[
                            styles.explanationDetail,
                            { color: colors.text },
                          ]}
                        >
                          {point.detail}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* Primary Risks */}
              {selectedCrop.primary_risks &&
                selectedCrop.primary_risks.length > 0 && (
                  <View style={styles.risksContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Risks
                    </Text>

                    {selectedCrop.primary_risks.map((risk, index) => (
                      <View key={index} style={styles.riskItem}>
                        <Text style={[styles.riskText, { color: colors.text }]}>
                          • {risk}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* Pesticides */}
              {selectedCrop.suggested_pesticides &&
                selectedCrop.suggested_pesticides.length > 0 && (
                  <View style={styles.pesticidesContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Suggested Pesticides
                    </Text>

                    {selectedCrop.suggested_pesticides
                      .slice(0, 3)
                      .map((pesticide, index) => (
                        <Card
                          key={index}
                          style={[
                            styles.pesticideCard,
                            { backgroundColor: colors.card },
                          ]}
                        >
                          <Text
                            style={[
                              styles.pesticideName,
                              { color: colors.text },
                            ]}
                          >
                            {pesticide.chemical_name}
                          </Text>
                          <View style={styles.pesticideDetail}>
                            <Text
                              style={[
                                styles.pesticideLabel,
                                { color: colors.text },
                              ]}
                            >
                              Target:
                            </Text>
                            <Text
                              style={[
                                styles.pesticideValue,
                                { color: colors.text },
                              ]}
                            >
                              {pesticide.target_pest}
                            </Text>
                          </View>
                          <View style={styles.pesticideDetail}>
                            <Text
                              style={[
                                styles.pesticideLabel,
                                { color: colors.text },
                              ]}
                            >
                              When:
                            </Text>
                            <Text
                              style={[
                                styles.pesticideValue,
                                { color: colors.text },
                              ]}
                            >
                              {pesticide.timing_stage}
                            </Text>
                          </View>
                        </Card>
                      ))}

                    {selectedCrop.suggested_pesticides.length > 3 && (
                      <Text
                        style={[
                          styles.morePesticidesText,
                          { color: colors.primary },
                        ]}
                      >
                        +{selectedCrop.suggested_pesticides.length - 3} more
                        pesticides
                      </Text>
                    )}
                  </View>
                )}

              {/* Relevant News */}
              {selectedCrop.relevant_news &&
                selectedCrop.relevant_news.length > 0 && (
                  <View style={styles.newsContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Related News
                    </Text>

                    {selectedCrop.relevant_news.map((news, index) => (
                      <View key={index} style={styles.newsItem}>
                        <Text
                          style={[styles.newsHeadline, { color: colors.text }]}
                        >
                          • {news.headline}
                        </Text>
                        <Text
                          style={[
                            styles.newsSource,
                            { color: colors.text + "80" },
                          ]}
                        >
                          {news.source} -{" "}
                          {new Date(news.date).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* Overall Summary */}
              {predictionResponse?.overall_llm_summary && (
                <View style={styles.summaryContainer}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    AI Summary
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    {predictionResponse.overall_llm_summary}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          <Text>Crop Recommendations</Text>
        </Text>

        <Text style={[styles.paragraph, { color: colors.text }]}>
          <Text>
            Get personalized crop recommendations based on your soil, local
            weather, and market prices.
          </Text>
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            <Text>Start Date</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dateInput, { borderColor: colors.border }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={{ color: colors.text }}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) setStartDate(selectedDate);
              }}
            />
          )}

          <Text style={[styles.label, { color: colors.text }]}>
            <Text>End Date</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dateInput, { borderColor: colors.border }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={{ color: colors.text }}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) setEndDate(selectedDate);
              }}
            />
          )}

          <Text style={[styles.label, { color: colors.text }]}>
            <Text>Acres</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            value={acres}
            onChangeText={setAcres}
            placeholder="e.g. 5"
            placeholderTextColor={colors.text + "80"}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: colors.text }]}>
            <Text>Soil Information</Text>
          </Text>

          <View style={styles.soilContainer}>
            <View style={styles.soilTypeContainer}>
              <Text style={[styles.soilLabel, { color: colors.text }]}>
                Select Soil Type:
              </Text>
              <View
                style={[styles.pickerContainer, { borderColor: colors.border }]}
              >
                <Picker
                  selectedValue={soilType}
                  onValueChange={(itemValue) => {
                    setSoilType(itemValue);
                    setSoilImage(null); // Clear soil image if soil type is selected
                  }}
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.text}
                >
                  <Picker.Item label="Select soil type..." value="" />
                  {soilTypes.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>

            <Text
              style={[styles.soilLabel, { color: colors.text, marginTop: 10 }]}
            >
              OR
            </Text>

            <View style={styles.imageUploadContainer}>
              <Text style={[styles.soilLabel, { color: colors.text }]}>
                Upload Soil Image:
              </Text>
              <TouchableOpacity
                style={[
                  styles.imagePickerButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={pickImage}
              >
                <Text style={styles.buttonText}>Select Image</Text>
              </TouchableOpacity>

              {soilImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: soilImage }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSoilImage(null)}
                  >
                    <Text style={{ color: "white" }}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={fetchCropRecommendations}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  <Text>Recommendation</Text>
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.historyButton,
                { backgroundColor: colors.card, borderColor: colors.primary },
              ]}
              onPress={navigateToHistory}
              disabled={loading}
            >
              <Text
                style={[styles.historyButtonText, { color: colors.primary }]}
              >
                <Text>View History</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {predictionResponse && renderWeatherPredictions()}

        {recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              <Text>Recommended Crops for Your Area</Text>
            </Text>

            {recommendations.map((crop, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => showCropDetails(crop)}
                activeOpacity={0.7}
              >
                <Card style={[styles.card, { backgroundColor: colors.card }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cropName, { color: colors.text }]}>
                      {crop.crop_name}
                    </Text>
                    <View
                      style={[
                        styles.suitabilityBadge,
                        {
                          backgroundColor: getSuitabilityColor(
                            crop.recommendation_score || 0
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.suitabilityText}>
                        <Text>
                          {(crop.recommendation_score || 0).toFixed(1)}%
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {crop.yield_per_kg && (
                    <View style={styles.cropDetails}>
                      <Text
                        style={[styles.detailLabel, { color: colors.text }]}
                      >
                        <Text>Yield Estimate:</Text>
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {crop.yield_per_kg} kg per acre
                      </Text>
                    </View>
                  )}

                  <View style={styles.cropDetails}>
                    <Text style={[styles.detailLabel, { color: colors.text }]}>
                      <Text>Average Price:</Text>
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {crop.prices && crop.prices.length > 0
                        ? `₹${(
                            crop.prices.reduce((a, b) => a + b, 0) /
                            crop.prices.length
                          ).toFixed(2)} per kg`
                        : "Not available"}
                    </Text>
                  </View>

                  {crop.prices && crop.dates && renderPriceChart(crop)}

                  {predictionResponse?.soil_type && (
                    <View style={styles.cropDetails}>
                      <Text
                        style={[styles.detailLabel, { color: colors.text }]}
                      >
                        <Text>Soil Compatibility:</Text>
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {predictionResponse.soil_type}
                        {predictionResponse.soil_type_confidence
                          ? ` (${predictionResponse.soil_type_confidence.toFixed(
                              1
                            )}% confidence)`
                          : ""}
                      </Text>
                    </View>
                  )}

                  {crop.contracts && crop.contracts.length > 0 && (
                    <View style={styles.contractBadge}>
                      <Text style={styles.contractText}>
                        Contract Available
                      </Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {renderHistoryModal()}
      {renderCropDetailModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16, // Reduced from 20 for consistency
  },
  title: {
    fontSize: 24, // Increased from 22
    fontWeight: "700", // Changed from 'bold'
    marginBottom: 8, // Reduced from 15
    marginLeft: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20, // Increased from 18
    fontWeight: "700", // Changed from 'bold'
    marginBottom: 16, // Increased from 15
    marginTop: 32, // Increased from 20
    letterSpacing: -0.3,
  },
  paragraph: {
    fontSize: 16,
    marginLeft: 20,
    lineHeight: 24,
    marginBottom: 24, // Increased from 20
    fontWeight: "400",
    opacity: 0.8,
  },
  inputContainer: {
    backgroundColor: "transparent", // Add background for better visual separation
    borderRadius: 16,
    padding: 20,
    marginBottom: 32, // Increased from 25
    gap: 16, // Add gap instead of individual margins
  },
  label: {
    fontSize: 16,
    fontWeight: "600", // Increased from normal
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12, // Increased from 8
    padding: 16, // Increased from 12
    fontSize: 16,
    fontWeight: "400",
    minHeight: 48, // Add minimum height
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 12, // Increased from 8
    padding: 16, // Increased from 12
    fontSize: 16,
    justifyContent: "center",
    minHeight: 48, // Add minimum height
  },
  soilContainer: {
    gap: 16, // Add gap instead of margins
  },
  soilTypeContainer: {
    // Remove marginBottom
  },
  soilLabel: {
    fontSize: 15, // Increased from 14
    fontWeight: "500",
    marginBottom: 8, // Increased from 5
    letterSpacing: -0.1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12, // Increased from 8
    minHeight: 48,
  },
  imageUploadContainer: {
    marginTop: 8, // Reduced from 10
  },
  imagePickerButton: {
    borderRadius: 12, // Increased from 8
    padding: 16, // Increased from 10
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16, // Increased from 10
    minHeight: 48,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16, // Increased from 10
    alignItems: "center",
  },
  imagePreview: {
    width: 160, // Increased from 150
    height: 160, // Increased from 150
    borderRadius: 12, // Increased from 8
  },
  removeImageButton: {
    position: "absolute",
    top: 8, // Increased from 5
    right: 8, // Increased from 5
    width: 28, // Increased from 24
    height: 28, // Increased from 24
    borderRadius: 14, // Increased from 12
    backgroundColor: "rgba(0,0,0,0.7)", // Increased opacity
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12, // Add gap instead of margin
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12, // Increased from 8
    padding: 16, // Increased from 14
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600", // Changed from 'bold'
    letterSpacing: -0.2,
  },
  errorText: {
    color: "#F44336",
    marginTop: 16, // Increased from 10
    fontSize: 15, // Increased from 14
    fontWeight: "500",
    lineHeight: 20,
  },
  recommendationsContainer: {
    marginTop: 16, // Increased from 10
    gap: 20, // Add gap between cards
  },
  card: {
    borderRadius: 16, // Increased from 8
    padding: 20, // Increased from 15
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // Increased from 12
  },
  cropName: {
    fontSize: 20, // Increased from 18
    fontWeight: "700", // Changed from 'bold'
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 12,
  },
  suitabilityBadge: {
    paddingHorizontal: 12, // Increased from 10
    paddingVertical: 6, // Increased from 4
    borderRadius: 16, // Increased from 12
    minWidth: 60,
    alignItems: "center",
  },
  suitabilityText: {
    color: "white",
    fontWeight: "700", // Changed from 'bold'
    fontSize: 13, // Increased from 12
    letterSpacing: -0.1,
  },
  cropDetails: {
    flexDirection: "row",
    marginBottom: 8, // Increased from 6
    alignItems: "flex-start",
  },
  detailLabel: {
    fontWeight: "600", // Changed from 'bold'
    marginRight: 8, // Increased from 5
    fontSize: 15,
    minWidth: 120,
    letterSpacing: -0.1,
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  contractBadge: {
    marginTop: 16, // Increased from 10
    backgroundColor: "#673AB7",
    alignSelf: "flex-start",
    paddingHorizontal: 12, // Increased from 10
    paddingVertical: 6, // Increased from 4
    borderRadius: 16, // Increased from 12
  },
  contractText: {
    color: "white",
    fontWeight: "600", // Changed from 'bold'
    fontSize: 13, // Increased from 12
    letterSpacing: -0.1,
  },
  chartContainer: {
    marginVertical: 20, // Increased from 15
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 12,
  },
  chartTitle: {
    fontSize: 17, // Increased from 16
    fontWeight: "600", // Changed from 'bold'
    marginBottom: 12, // Increased from 10
    letterSpacing: -0.2,
  },
  chart: {
    borderRadius: 12, // Increased from 8
  },
  weatherContainer: {
    marginTop: 32, // Increased from 20
    marginBottom: 20,
  },
  weatherCard: {
    padding: 20, // Increased from 15
    borderRadius: 16, // Increased from 8
    marginRight: 16, // Increased from 15
    width: 220, // Increased from 200
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  weatherMonth: {
    fontSize: 18, // Increased from 16
    fontWeight: "700", // Changed from 'bold'
    marginBottom: 16, // Increased from 10
    letterSpacing: -0.2,
  },
  weatherDetail: {
    flexDirection: "row",
    marginBottom: 8, // Increased from 5
    alignItems: "center",
  },
  weatherLabel: {
    fontWeight: "600", // Changed from 'bold'
    width: 100, // Increased from 90
    fontSize: 15,
    letterSpacing: -0.1,
  },
  weatherValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  historyButton: {
    flex: 1,
    borderRadius: 12, // Increased from 8
    padding: 16, // Increased from 14
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 48,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "600", // Changed from 'bold'
    letterSpacing: -0.2,
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 24, // Increased from 20
    borderTopRightRadius: 24, // Increased from 20
    padding: 24, // Increased from 20
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24, // Increased from 20
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 22, // Increased from 20
    fontWeight: "700", // Changed from 'bold'
    letterSpacing: -0.3,
  },
  closeButton: {
    fontSize: 17, // Increased from 16
    fontWeight: "600", // Changed from 'bold'
    letterSpacing: -0.2,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24, // Increased from 20
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12, // Increased from 10
    paddingTop: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600", // Changed from 'bold'
    letterSpacing: -0.2,
  },
  // Crop detail modal styles
  detailSection: {
    marginBottom: 24, // Increased from 20
  },
  scoreContainer: {
    alignItems: "center",
    marginVertical: 20, // Increased from 15
  },
  scoreBadge: {
    width: 90, // Increased from 80
    height: 90, // Increased from 80
    borderRadius: 45, // Increased from 40
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12, // Increased from 10
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  scoreText: {
    color: "white",
    fontSize: 24, // Increased from 22
    fontWeight: "700", // Changed from 'bold'
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 17, // Increased from 16
    fontWeight: "600", // Changed from 'bold'
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontSize: 20, // Increased from 18
    fontWeight: "700", // Changed from 'bold'
    marginBottom: 16, // Increased from 10
    marginTop: 24, // Increased from 20
    letterSpacing: -0.3,
  },
  metricsContainer: {
    marginTop: 16, // Increased from 10
    gap: 12, // Add gap instead of margins
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  metricLabel: {
    fontWeight: "600", // Changed from 'bold'
    width: 140, // Increased from 120
    fontSize: 15,
    letterSpacing: -0.1,
  },
  metricValue: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  priceContainer: {
    marginTop: 16, // Increased from 10
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 24, // Increased from 20
    fontStyle: "italic",
    fontSize: 15,
    lineHeight: 20,
  },
  explanationContainer: {
    marginTop: 16, // Increased from 10
    gap: 16, // Add gap instead of margins
  },
  explanationPoint: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 16,
  },
  explanationTitle: {
    fontWeight: "600", // Changed from 'bold'
    marginBottom: 8, // Increased from 5
    fontSize: 17, // Increased from 16
    letterSpacing: -0.2,
  },
  explanationDetail: {
    lineHeight: 22, // Increased from 20
    fontSize: 15,
    fontWeight: "400",
  },
  risksContainer: {
    marginTop: 16, // Increased from 10
    gap: 12, // Add gap instead of margins
  },
  riskItem: {
    // Remove marginBottom
  },
  riskText: {
    lineHeight: 22, // Increased from 20
    fontSize: 15,
    fontWeight: "400",
  },
  pesticidesContainer: {
    marginTop: 16, // Increased from 10
    gap: 12, // Add gap instead of margins
  },
  pesticideCard: {
    padding: 16, // Increased from 12
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pesticideName: {
    fontWeight: "600", // Changed from 'bold'
    fontSize: 17, // Increased from 16
    marginBottom: 12, // Increased from 8
    letterSpacing: -0.2,
  },
  pesticideDetail: {
    flexDirection: "row",
    marginBottom: 6, // Increased from 5
    alignItems: "flex-start",
  },
  pesticideLabel: {
    fontWeight: "600", // Changed from 'bold'
    width: 70, // Increased from 60
    fontSize: 14,
    letterSpacing: -0.1,
  },
  pesticideValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
  },
  morePesticidesText: {
    textAlign: "center",
    fontWeight: "600", // Changed from 'bold'
    marginTop: 8, // Increased from 5
    fontSize: 15,
    letterSpacing: -0.1,
  },
  newsContainer: {
    marginTop: 16, // Increased from 10
    gap: 16, // Add gap instead of margins
  },
  newsItem: {
    // Remove marginBottom
  },
  newsHeadline: {
    fontWeight: "500",
    marginBottom: 6, // Increased from 4
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  newsSource: {
    fontSize: 13, // Increased from 12
    marginLeft: 16, // Increased from 15
    fontWeight: "400",
    lineHeight: 16,
  },
  summaryContainer: {
    marginTop: 16, // Increased from 10
    marginBottom: 40, // Increased from 30
  },
  summaryText: {
    lineHeight: 24, // Increased from 22
    fontSize: 15,
    fontWeight: "400",
  },
  priceSummary: {
    marginTop: 20, // Increased from 15
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 16, // Add gap
  },
  priceRangeItem: {
    alignItems: "center",
    paddingHorizontal: 12, // Increased from 10
    paddingVertical: 8, // Increased from 5
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  priceRangeLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4, // Increased from 2
    letterSpacing: -0.1,
  },
  priceRangeValue: {
    fontSize: 17, // Increased from 16
    fontWeight: "700", // Changed from 'bold'
    letterSpacing: -0.2,
  },
});

export default CropTab;
