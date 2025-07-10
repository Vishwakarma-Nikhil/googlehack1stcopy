import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Typography } from "../../components/Typography";
import { useState } from "react";
import { Card } from "../../components/Card";
import { Check } from "react-native-feather";

// New Simplified Schemes List

const governmentSchemes = [
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM‑Kisan)",
    description:
      "Annual income support of ₹6,000 (paid in three ₹2,000 installments) to small and marginal farmer families.",
    apply_link: "https://pmkisan.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
  },
  {
    name: "Pradhan Mantri Kisan Maan Dhan Yojana",
    description:
      "Voluntary pension scheme providing ₹3,000/month after age 60; beneficiaries are current PM‑Kisan recipients aged 18–40.",
    apply_link: "https://pmkisan.gov.in (via Maan Dhan section)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description:
      "Crop insurance scheme offering financial protection against natural calamities, pests, and diseases.",
    apply_link: "https://pmfby.gov.in",
    ministry: "Ministry of Agriculture & Farmers Welfare",
  },
  {
    name: "PM KUSUM Scheme",
    description:
      "Subsidy (up to 60%) for solar-powered irrigation pumps to reduce diesel dependency and provide clean energy income.",
    apply_link: "https://en.wikipedia.org/wiki/PM_Kusum_Scheme",
    ministry: "Ministry of New & Renewable Energy",
  },
  {
    name: "Kisan Credit Card (KCC)",
    description:
      "Affordable short‑term crop and investment credit, with insurance coverage for farmers.",
    apply_link:
      "https://services.india.gov.in/service/detail/pm-kisan-samman-nidhi-1 (via KCC link)",
    ministry: "Ministry of Agriculture & Farmers Welfare / NABARD",
  },
];

export default function SchemeScreen() {
  const { colors, radius, spacing } = useTheme();
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const handleApply = (url: string, id: string) => {
    setAppliedIds((prev) => [...prev, id]);
    Linking.openURL(url);
  };

  const renderSchemeCard = ({ item, index }: { item: any; index: number }) => {
    const isApplied = appliedIds.includes(item.name);
    return (
      <Card style={[styles.subsidyCard, { backgroundColor: colors.card }]}>
        <View style={styles.subsidyHeader}>
          <Typography variant="bodyLarge" style={styles.subsidyTitle}>
            {item.name}
          </Typography>
        </View>

        <Typography
          variant="body"
          color="textSecondary"
          style={styles.subsidyDescription}
        >
          {item.description}
        </Typography>

        <View style={styles.subsidyDetails}>
          <View style={styles.fieldRow}>
            <Typography style={styles.fieldLabel}>Ministry:</Typography>
            <Typography style={styles.fieldValue}>{item.ministry}</Typography>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isApplied ? colors.success : colors.primary,
            },
          ]}
          onPress={() => handleApply(item.apply_link, item.name)}
          disabled={isApplied}
        >
          <Typography variant="small" style={{ color: colors.background }}>
            {isApplied ? "Applied" : "Apply Now"}
          </Typography>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: colors.text }]}>
          <Typography variant="heading" style={{ color: colors.background }}>
            Government Schemes
          </Typography>
        </View>

        <FlatList
          data={governmentSchemes}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContainer}
          renderItem={renderSchemeCard}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  errorSubtext: {
    marginTop: 8,
    textAlign: "center",
  },
  detailedErrorContainer: {
    marginTop: 16,
    width: "100%",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 8,
  },
  detailedErrorText: {
    color: "#666",
    fontSize: 12,
    fontFamily: "monospace",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    textAlign: "center",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  subsidyCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  subsidyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subsidyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  subsidyDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  subsidyDetails: {
    marginBottom: 18,
    backgroundColor: "#FAFAFA",
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB", // Default primary blue color
  },
  fieldRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  fieldLabel: {
    fontWeight: "600",
    marginRight: 8,
  },
  fieldValue: {
    flex: 1,
  },
  recipientsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "#F8F8F8",
    padding: 10,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 14,
  },
  actionButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  requestCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  requestTitle: {
    flex: 1,
    fontWeight: "700",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  requestDetails: {
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 8,
    marginBottom: 16,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  fulfillButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
