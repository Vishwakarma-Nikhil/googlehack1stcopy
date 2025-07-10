import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Card } from "../../Card";

// Import the CropRecommendation interface to ensure type compatibility
interface KeyMetrics {
  expected_yield_range?: string;
  price_forecast_trend?: string;
  estimated_input_cost_category?: string;
  primary_fertilizer_needs?: string;
}

// Make sure this matches the interface in CropTab.tsx
interface CropRecommendation {
  crop_name: string;
  recommendation_score?: number;
  rank?: number;
  key_metrics?: KeyMetrics;
  explanation_points?: Array<{
    reason_type: string;
    detail: string;
    ai_component?: string;
  }>;
  primary_risks?: string[];
  suggested_pesticides?: Array<{
    chemical_name: string;
    target_pest: string;
    timing_stage: string;
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
  relevant_news?: Array<{
    headline: string;
    url: string;
    source: string;
    date: string;
  }>;
  // Optional fields for backward compatibility
  suitability?: "high" | "medium" | "low";
  prices?: number[];
  dates?: string[];
  yield_per_kg?: number;
  contracts?: string[];
  waterRequirement?: string;
  growthPeriod?: string;
  notes?: string;
}

interface PredictionHistoryItem {
  user_id: string;
  requested_at: string;
  input: {
    email: string;
    start_date: string;
    end_date: string;
    acres: number;
    soil_type: string;
  };
  output: {
    request_details?: {
      soil_type?: string;
      latitude?: number;
      longitude?: number;
      [key: string]: any;
    };
    recommendations: CropRecommendation[];
    weather_context_summary?: string;
    news_headlines_considered?: string[];
    news_impact_summary_llm?: string;
    overall_llm_summary?: string;
  };
  id?: string;
  created_at?: string;
  updated_at?: string;
}

interface PredictionHistoryItemProps {
  email: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    card: string;
    border: string;
  };
  getSuitabilityColor: (score: number) => string;
}

const PredictionHistoryItem: React.FC<PredictionHistoryItemProps> = ({
  email,
  colors,
  getSuitabilityColor,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(
    null
  );
  const [showCropDetails, setShowCropDetails] = useState(false);

  useEffect(() => {
    fetchPredictionHistory();
  }, [email]);

  const fetchPredictionHistory = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://efbede333ccb.ngrok-free.app/predictions/crop_prediction/history?email=${encodeURIComponent(
          email
        )}&language=english`
      );

      if (!response.ok) {
        throw new Error(`Error fetching history: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.history && Array.isArray(data.history)) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error fetching prediction history:", err);
      setError("Failed to load prediction history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const onSelectCrop = (crop: CropRecommendation) => {
    setSelectedCrop(crop);
    setShowCropDetails(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading prediction history...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: "red" }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchPredictionHistory}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No prediction history found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {history.map((item, index) => (
        <Card
          key={index}
          style={[styles.historyCard, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.historyDate, { color: colors.text }]}>
            {new Date(item.requested_at).toLocaleDateString()}
          </Text>

          <View style={styles.historyDetail}>
            <Text style={[styles.historyLabel, { color: colors.text }]}>
              Dates:
            </Text>
            <Text style={[styles.historyValue, { color: colors.text }]}>
              {item.input.start_date} to {item.input.end_date}
            </Text>
          </View>

          <View style={styles.historyDetail}>
            <Text style={[styles.historyLabel, { color: colors.text }]}>
              Acres:
            </Text>
            <Text style={[styles.historyValue, { color: colors.text }]}>
              {item.input.acres}
            </Text>
          </View>

          <View style={styles.historyDetail}>
            <Text style={[styles.historyLabel, { color: colors.text }]}>
              Input Soil:
            </Text>
            <Text style={[styles.historyValue, { color: colors.text }]}>
              {typeof item.input.soil_type === "string" &&
              item.input.soil_type.startsWith("http")
                ? "Image Upload"
                : item.input.soil_type}
            </Text>
          </View>

          {item.output.request_details?.soil_type && (
            <View style={styles.historyDetail}>
              <Text style={[styles.historyLabel, { color: colors.text }]}>
                Analyzed Soil:
              </Text>
              <Text style={[styles.historyValue, { color: colors.text }]}>
                {item.output.request_details.soil_type}
              </Text>
            </View>
          )}

          {item.output.weather_context_summary && (
            <View style={styles.historyDetail}>
              <Text style={[styles.historyLabel, { color: colors.text }]}>
                Weather:
              </Text>
              <Text style={[styles.historyValue, { color: colors.text }]}>
                {item.output.weather_context_summary}
              </Text>
            </View>
          )}

          {/* Location details if available */}
          {item.output.request_details?.latitude && (
            <View style={styles.historyDetail}>
              <Text style={[styles.historyLabel, { color: colors.text }]}>
                Location:
              </Text>
              <Text style={[styles.historyValue, { color: colors.text }]}>
                {item.output.request_details.latitude.toFixed(4)},{" "}
                {item.output.request_details.longitude?.toFixed(4)}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.historySubtitle,
              { color: colors.text, marginTop: 12 },
            ]}
          >
            Recommended Crops:
          </Text>

          {item.output.recommendations.slice(0, 3).map((rec, recIndex) => (
            <TouchableOpacity
              key={recIndex}
              style={styles.recommendationItem}
              onPress={() => onSelectCrop(rec)}
            >
              <View
                style={[
                  styles.rankBadge,
                  {
                    backgroundColor: getSuitabilityColor(
                      rec.recommendation_score || 0
                    ),
                  },
                ]}
              >
                <Text style={styles.rankText}>{rec.rank}</Text>
              </View>

              <View style={styles.recommendationContent}>
                <Text style={[styles.cropNameText, { color: colors.text }]}>
                  {rec.crop_name} ({rec.recommendation_score?.toFixed(1)}%)
                </Text>

                {rec.key_metrics?.expected_yield_range && (
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: colors.text }]}>
                      Yield:
                    </Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {rec.key_metrics.expected_yield_range}
                    </Text>
                  </View>
                )}

                {rec.key_metrics?.price_forecast_trend && (
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: colors.text }]}>
                      Price:
                    </Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {rec.key_metrics.price_forecast_trend}
                    </Text>
                  </View>
                )}

                <Text
                  style={[styles.viewDetailsText, { color: colors.primary }]}
                >
                  View Details
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {item.output.recommendations.length > 3 && (
            <Text style={[styles.moreText, { color: colors.primary }]}>
              +{item.output.recommendations.length - 3} more crops
            </Text>
          )}

          {item.output.news_headlines_considered &&
            item.output.news_headlines_considered.length > 0 && (
              <>
                <Text
                  style={[
                    styles.historySubtitle,
                    { color: colors.text, marginTop: 12 },
                  ]}
                >
                  News Headlines:
                </Text>
                {item.output.news_headlines_considered
                  .slice(0, 2)
                  .map((headline, headlineIndex) => (
                    <Text
                      key={headlineIndex}
                      style={[styles.newsHeadlineText, { color: colors.text }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      • {headline}
                    </Text>
                  ))}
                {item.output.news_headlines_considered.length > 2 && (
                  <Text style={[styles.moreText, { color: colors.primary }]}>
                    +{item.output.news_headlines_considered.length - 2} more
                    headlines
                  </Text>
                )}
              </>
            )}

          {item.output.overall_llm_summary && (
            <>
              <Text
                style={[
                  styles.historySubtitle,
                  { color: colors.text, marginTop: 12 },
                ]}
              >
                Summary:
              </Text>
              <TouchableOpacity>
                <Text
                  style={[styles.summaryText, { color: colors.text }]}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {item.output.overall_llm_summary}
                </Text>
                <Text style={[styles.readMoreText, { color: colors.primary }]}>
                  Read more
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  historyCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyDetail: {
    flexDirection: "row",
    marginBottom: 5,
  },
  historyLabel: {
    fontWeight: "bold",
    width: 120,
  },
  historyValue: {
    flex: 1,
  },
  historySubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  rankText: {
    color: "white",
    fontWeight: "bold",
  },
  recommendationContent: {
    flex: 1,
  },
  cropNameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  metricRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  metricLabel: {
    fontWeight: "bold",
    marginRight: 5,
  },
  metricValue: {
    flex: 1,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  moreText: {
    fontWeight: "bold",
    marginTop: 10,
  },
  newsHeadlineText: {
    marginTop: 5,
    paddingLeft: 10,
  },
  summaryText: {
    marginTop: 5,
  },
  readMoreText: {
    fontWeight: "bold",
    marginTop: 5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    marginBottom: 15,
  },
  retryButton: {
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default PredictionHistoryItem;
