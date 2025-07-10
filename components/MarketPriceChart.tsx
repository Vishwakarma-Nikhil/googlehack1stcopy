import React from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

type Props = {
  dates: string[]; // not used in this case
  prices: string[];
};

const MarketPriceChart = ({ prices }: Props) => {
  const visiblePrices = prices.slice(0, 20).map((p) => Number(p));

  const hardcodedLabels = ["2021", "2022", "2023", "2024", "2025"];

  return (
    <View>
      <LineChart
        data={{
          labels: hardcodedLabels,
          datasets: [{ data: visiblePrices }],
        }}
        width={screenWidth - 32}
        height={260}
        yAxisSuffix="₹"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#f0f0f0",
          backgroundGradientTo: "#f0f0f0",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: "3",
            strokeWidth: "2",
            stroke: "#1E90FF",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 12,
          marginLeft: 16,
        }}
      />
    </View>
  );
};

export default MarketPriceChart;
