import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card } from "../../Card";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

interface PriceHistoryData {
  user_id: string;
  dates: string[];
  prices: number[];
  requested_at: string;
}

interface PriceHistoryItemProps {
  email: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    card: string;
    border: string;
  };
}

const PriceHistoryItem: React.FC<PriceHistoryItemProps> = ({
  email,
  colors,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PriceHistoryData[]>([]);

  useEffect(() => {
    fetchPriceHistory();
  }, [email]);

  const fetchPriceHistory = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://efbede333ccb.ngrok-free.app/predictions/prices/history?email=${encodeURIComponent(
          email
        )}&language=english`
      );

      if (!response.ok) {
        throw new Error(`Error fetching price history: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.history && Array.isArray(data.history)) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error fetching price history:", err);
      setError("Failed to load price history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading price history...
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
          onPress={fetchPriceHistory}
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
          No price history found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {history.map((item, index) => {
        const screenWidth = Dimensions.get("window").width - 60;

        return (
          <Card
            key={index}
            style={[styles.historyCard, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.historyDate, { color: colors.text }]}>
              {new Date(item.requested_at).toLocaleDateString()}
            </Text>

            <View style={styles.historyDetail}>
              <Text style={[styles.historyLabel, { color: colors.text }]}>
                Date Range:
              </Text>
              <Text style={[styles.historyValue, { color: colors.text }]}>
                {item.dates[0]} to {item.dates[item.dates.length - 1]}
              </Text>
            </View>

            <View style={styles.historyDetail}>
              <Text style={[styles.historyLabel, { color: colors.text }]}>
                Price Range:
              </Text>
              <Text style={[styles.historyValue, { color: colors.text }]}>
                ₹{Math.min(...item.prices)} to ₹{Math.max(...item.prices)}
              </Text>
            </View>

            <View style={styles.historyDetail}>
              <Text style={[styles.historyLabel, { color: colors.text }]}>
                Average Price:
              </Text>
              <Text style={[styles.historyValue, { color: colors.text }]}>
                ₹
                {(
                  item.prices.reduce((a, b) => a + b, 0) / item.prices.length
                ).toFixed(2)}
              </Text>
            </View>

            {/* Price chart */}
            {item.prices.length > 1 && (
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: item.dates.map((date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }),
                    datasets: [
                      {
                        data: item.prices,
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
                      r: "4",
                      strokeWidth: "2",
                      stroke: colors.primary,
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
            )}
          </Card>
        );
      })}
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
  chartContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
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

export default PriceHistoryItem;
