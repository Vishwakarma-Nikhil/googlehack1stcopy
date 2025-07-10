import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const SoilInfoCard = ({ soil }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🌱 {soil.soil} Classification</Text>
      <Text style={styles.subheading}>Confidence: {soil.confidence}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Soil Characteristics</Text>
        {Object.entries(soil.soil_characteristics).map(([key, value]) => (
          <Text key={key} style={styles.item}>
            • {key.replace(/_/g, " ")}: <Text style={styles.bold}>{value}</Text>
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌾 Recommended Crops (Ranked)</Text>
        {soil.recommended_crops_ranked.map((crop, i) => (
          <View key={i} style={styles.cropCard}>
            <Text style={styles.cropTitle}>
              #{crop.rank}. {crop.crop} — ₹{crop.market_price_per_quintal}/qt
            </Text>
            <Text style={styles.item}>
              📦 Yield: {crop.average_yield_per_acre_kg} kg/acre
            </Text>
            <Text style={styles.item}>
              💰 Expected Income: ₹{crop.expected_income_per_acre}
            </Text>
            <Text style={styles.subsectionTitle}>Why Recommended:</Text>
            {crop.reasons.map((r, idx) => (
              <Text key={idx} style={styles.bullet}>
                • {r}
              </Text>
            ))}
            <Text style={styles.subsectionTitle}>Inputs Needed:</Text>
            {crop.input_requirements.map((r, idx) => (
              <Text key={idx} style={styles.bullet}>
                • {r}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧑‍🌾 General Recommendations</Text>
        <Text style={styles.item}>
          ➤ Organic: {soil.general_recommendations.organic_matter_addition}
        </Text>
        <Text style={styles.item}>
          ➤ Rotation: {soil.general_recommendations.crop_rotation}
        </Text>
        <Text style={styles.subsectionTitle}>Micronutrient Tips:</Text>
        {soil.general_recommendations.micronutrient_tips.map((tip, i) => (
          <Text key={i} style={styles.bullet}>
            • {tip}
          </Text>
        ))}
        <Text style={styles.item}>
          ➤ Irrigation: {soil.general_recommendations.irrigation_tip}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Locally Available Inputs</Text>
        {soil.locally_available_inputs.map((item, i) => (
          <Text key={i} style={styles.bullet}>
            • {item}
          </Text>
        ))}
      </View>

      <Text style={styles.footer}>Last Updated: {soil.last_updated}</Text>
    </ScrollView>
  );
};

export default SoilInfoCard;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: "#777",
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  subsectionTitle: {
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  item: {
    fontSize: 14,
    marginVertical: 2,
  },
  bullet: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
  },
  bold: {
    fontWeight: "500",
  },
  cropCard: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 6,
    elevation: 2,
  },
  cropTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  footer: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 30,
  },
});
