import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const DiseaseInfoCard = ({ data }: { data: any }) => {
  if (!data) return null;

  const {
    crop,
    disease,
    confidence,
    symptoms,
    cause,
    favorable_conditions,
    recommended_practices,
    locally_available_solutions,
    precaution,
    last_updated,
  } = data;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {crop} - {disease}
      </Text>
      <Text style={styles.confidence}>Confidence: {confidence}</Text>

      <Section title="Symptoms" items={symptoms} />
      <Section title="Cause" content={cause} />
      <Section title="Favorable Conditions" items={favorable_conditions} />

      <Text style={styles.sectionTitle}>Recommended Practices</Text>

      <Section
        title="Cultural Controls"
        items={recommended_practices.cultural_controls}
      />
      <Section title="Organic Remedies">
        {recommended_practices.organic_remedies.map((item, index) => (
          <View key={index} style={styles.subItem}>
            <Text style={styles.bold}>
              {index + 1}. {item.name}
            </Text>
            {item.ingredients && (
              <Text style={styles.detail}>
                Ingredients: {item.ingredients.join(", ")}
              </Text>
            )}
            {item.application && (
              <Text style={styles.detail}>Application: {item.application}</Text>
            )}
          </View>
        ))}
      </Section>

      <Section title="Chemical Controls">
        {recommended_practices.chemical_controls.map((item, index) => (
          <View key={index} style={styles.subItem}>
            <Text style={styles.bold}>
              {index + 1}. {item.name}
            </Text>
            <Text style={styles.detail}>Dosage: {item.dosage}</Text>
            <Text style={styles.detail}>Note: {item.note}</Text>
          </View>
        ))}
      </Section>

      <Section
        title="Locally Available Solutions"
        items={locally_available_solutions}
      />
      <Section title="Precaution" content={precaution} />
      <Text style={styles.updated}>Last Updated: {last_updated}</Text>
    </View>
  );
};

const Section = ({ title, items, content, children }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {items &&
      items.map((item: string, index: number) => (
        <Text key={index} style={styles.item}>
          • {item}
        </Text>
      ))}
    {content && <Text style={styles.item}>{content}</Text>}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  confidence: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  item: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  subItem: {
    marginBottom: 6,
  },
  bold: {
    fontWeight: "600",
    fontSize: 14,
  },
  detail: {
    fontSize: 13,
    color: "#444",
    marginLeft: 8,
  },
  updated: {
    fontSize: 12,
    color: "#888",
    marginTop: 10,
    textAlign: "right",
  },
});

export default DiseaseInfoCard;
