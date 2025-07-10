import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useFarmStore } from "../../store/farmStore";
import {
  MapPin,
  LogOut,
  CloudRain,
  Wind,
  Thermometer,
  Calendar,
  ExternalLink,
  AlertTriangle,
} from "lucide-react-native";
import WeatherWidget from "../../components/WeatherWidget";
import { Link } from "expo-router";
import { Typography } from "../../components/Typography";
import { Card } from "../../components/Card";
import { useUserStore } from "../../store/userStore";
import { LanguagePicker } from "../../components/LanguagePicker";
import { useLanguageStore } from "../../store/languageStore";
import axios from "axios";

// // 7-day weather forecast data
// const weatherForecast = [
//   {
//     date: "2025-05-04",
//     rainfall: 0.25,
//     rainfall_description: "low",
//     wind_speed: 13.1,
//     temperature: 32.85,
//   },
//   {
//     date: "2025-05-05",
//     rainfall: 0.08,
//     rainfall_description: "low",
//     wind_speed: 9.2,
//     temperature: 33.29,
//   },
//   {
//     date: "2025-05-06",
//     rainfall: 0.0,
//     rainfall_description: "none",
//     wind_speed: 9.3,
//     temperature: 33.62,
//   },
//   {
//     date: "2025-05-07",
//     rainfall: 0.0,
//     rainfall_description: "none",
//     wind_speed: 11.1,
//     temperature: 34.56,
//   },
//   {
//     date: "2025-05-08",
//     rainfall: 0.0,
//     rainfall_description: "none",
//     wind_speed: 7.4,
//     temperature: 33.99,
//   },
//   {
//     date: "2025-05-09",
//     rainfall: 0.12,
//     rainfall_description: "low",
//     wind_speed: 10.97,
//     temperature: 33.31,
//   },
//   {
//     date: "2025-05-10",
//     rainfall: 0.1,
//     rainfall_description: "low",
//     wind_speed: 6.97,
//     temperature: 34.04,
//   },
// ];

// News data
const newsItems = [
  {
    date: "2025-07-8T14:07:33+00:00",
    headline:
      "Time to break-free from paddy for sustainable agriculture in India",
    source: "Business Standard",
    url: "https://news.google.com/read/CBMi0wFBVV95cUxOLTJEek5wRVlLczVzS0N6OFd5dXlMQkh1UEdHdXB0b2RDZllwc0c1MmY0b0RGdFd1UFVkSE1Fc0xpUEdSbkJ4Sk8waEhCZGJQY1huNGJsbUVuenNsaGw3NDB0NXA4c3F1RUNKZjliSm94enlKS2JGS1Vwc050T0gzazA2MkhwY3lqTVpFZ2ZNT20zcmRhNk8xOWREQWM3amVxRUJDZWJDWi1Lb2xmUXRIZUY4SnB0RjJkVFFWcVc5MjNuMHQwQW9OdXJtQ21uMUlJNUlB0gHYAUFVX3lxTE9lQVk3YWpNRVA5V1M0QkxldzNObDhJUG9XSGt0a1pBdnFJVktock1tX19zZVVwNVdRYWhZODBEZW91cjVlNW1KakgyRUJvck12Z0RoMXk3X1Y3b1dwWmRLdmtnMU1IQkV3X196TUpQRzFJWFVpSWdmdlJLemhETGhUeFJES0twbUcxUEV3SkFRb3djZ1FRQzd3TXFKdExNcG1UeTEzMGFCTkNNQ3hacmdNWUR1d0xqYnFxbXF4b0VkSTl4VnlwNzMxNldSQlF5SEtZM0FfVVNkNQ?hl=en-IN&gl=IN&ceid=IN%3Aen",
  },
  {
    date: "2025-07-07T08:00:00+00:00",
    headline:
      "Return of winter chill may benefit wheat crop, prices ruling above MSP",
    source: "Business Standard",
    url: "https://news.google.com/read/CBMi3AFBVV95cUxQclJZMC1aQXQ0VXNPM1lWRHFwNzVDaWhDOS1WSkdmT210UUdDeUQ4ZmVIc1FBYXYtZWdsdG9sWFRfQjlwdTBFeVJDWVBOMllRSXNpOXItd25hQlpfR0YtbTRjOUJ3T3pmWk1NcFJlNVVEWmFmYlc2Z2RKa25HOUNEQWVacV9ZZTFVWDg1NzJ6QUtGalNnU1cxTjhxVVBPOURydUw5S1liSmp4TDRrY2t4SjVOTmRjd3lxbnE5cVRqdzk5SGtmcEg5V3B3eFNsdlZ4RElSelNqbDVlTHdP0gHiAUFVX3lxTFBlMUlPeDR2X21mc1VUM3VFQnlSRnkwNDRLX1pDbGFMUHBnOGxQeU5sV0E2RUFobm5qNXBub3hwVDNNTTQ0d2lzdVJwOTNtemNQZy1WWHBxelI0NVcwMDBKaFRsVWtlcU9JdHBPcVNERmJmWURjNG52UlgwRlQ2UUlpOWx2dllKMmtzMmtaUXI4Rk5vVnVYNHUySjhNdWt3c245bWxYYk5jRHhIVUpkVFk5SjhGdllLVXJlR1RfMHJERlVrRmdqX212R2tLRkhOeGswUDk3bzZaV29hTVJ2QmhWbFE?hl=en-IN&gl=IN&ceid=IN%3Aen",
  },
  {
    date: "2025-07-06T07:00:00+00:00",
    headline:
      "Wheat vs. Jowar: Can India\u2019s MSP Strategy Avert a Groundwater Crisis -1?",
    source: "NewsClick",
    url: "https://news.google.com/read/CBMilAFBVV95cUxPZ0VLQV9EbjBLTGRPMHJ4aHFaRHVXajBMQzNZT1FBQkpDcmVXb0FKc0lVQUdjSzdVekhENERkaXlUaVB0T3JjS0U4dFN3cDU3TGxvTHRITVNNVXNxbW9ESE5IbENkakNkbXI0NUxrdnFNNlR1TEwzYk93c09fVWJraTVHMjE3SEJ5TFhQR0xiN04yQjVE0gGaAUFVX3lxTFBnLTEzYUlPYlZWTDFnNDRzOC1ULVhWTFJFb0NVVG5NM3V6QjBOMHVmOEJyVnY3Uzl1MFdEY1hSek15bnJwWlRGOF9yZGFmYl9IZ3dmTjhSelhQT182YjVvc2pKRkVTNFFjcmNfSDlXTzZqWnlkTjZBaWpaV2tldDFUcVh4MlIzRzEtazJFakNla1ZTU0ZVQ0JvSUE?hl=en-IN&gl=IN&ceid=IN%3Aen",
  },
];

// Sample accepted bids data from API
const acceptedBids = [
  {
    listing_id: "681764d9000897482828",
    buyer_id: "681764d9003904012399",
    quantity: 20,
    price_per_kg: 20,
    status: "accepted",
    timestamp: "2025-05-10T13:00:09.849+00:00",
    $id: "681764d90010e521efb0",
    $createdAt: "2025-05-04T13:00:09.859+00:00",
    $updatedAt: "2025-05-04T13:00:09.859+00:00",
    $permissions: [],
    $databaseId: "agri_marketplace",
    $collectionId: "bids",
    // Added for UI display
    crop: "Wheat",
  },
  {
    listing_id: "681764d9000897482828",
    buyer_id: "681764d90009e3cdc0c5",
    quantity: 15,
    price_per_kg: 21,
    status: "accepted",
    timestamp: "2025-05-12T13:00:09.849+00:00",
    $id: "681764d900389369d9f8",
    $createdAt: "2025-05-04T13:00:09.864+00:00",
    $updatedAt: "2025-05-04T13:00:09.864+00:00",
    $permissions: [],
    $databaseId: "agri_marketplace",
    $collectionId: "bids",
    // Added for UI display
    crop: "Rice",
  },
];

// Sample subsidies data from API
// const availableSubsidies = [
//   {
//     type: "asset",
//     max_recipients: 45,
//     status: "listed",
//     dynamic_fields:
//       '{"includes_training": true, "kit_components": ["resilient seeds", "bio-fertilizer", "weather booklet"], "contact_info": "climate@nudge.org.in", "application_link": "https://thenudge.org/climate-kit"}',
//     locations: ["CHHATTISGARH", "Bihar"],
//     recipients_accepted: 0,
//     provider: "The/Nudge Institute",
//     program: "Climate Resilience Kit",
//     description: "Kit of tools and inputs for climate-resilient farming",
//     eligibility: "Farmers in flood/drought-prone blocks of CHHATTISGARH",
//     benefits: "Resilient seeds, fertilizers, weather training",
//     application_process: "Block-level application through agriculture officer",
//     $id: "681764d9001a71c8c0bd",
//     $createdAt: "2025-05-04T13:00:09.971+00:00",
//     $updatedAt: "2025-05-04T13:00:09.971+00:00",
//     $permissions: [],
//     $databaseId: "agri_marketplace",
//     $collectionId: "subsidies",
//   },
//   {
//     type: "cash",
//     max_recipients: 60,
//     status: "listed",
//     dynamic_fields:
//       '{"requires_shg_membership": true, "training_included": true, "contact_info": "womenfarming@nudge.org.in", "application_link": "https://thenudge.org/women-farm"}',
//     locations: ["CHHATTISGARH", "Jharkhand"],
//     recipients_accepted: 0,
//     provider: "The/Nudge Institute",
//     program: "Women in Farming",
//     description: "Empowerment grant for women-led farms and SHGs",
//     eligibility:
//       "Women farmers or SHG leaders registered in any rural CHHATTISGARH panchayat",
//     benefits: "INR 7,500 + optional training",
//     application_process: "Apply via SHG recommendation letter and ID proof",
//     $id: "681764d9000decffd525",
//     $createdAt: "2025-05-04T13:00:09.965+00:00",
//     $updatedAt: "2025-05-04T13:00:09.965+00:00",
//     $permissions: [],
//     $databaseId: "agri_marketplace",
//     $collectionId: "subsidies",
//   },
//   {
//     type: "cash",
//     max_recipients: 35,
//     status: "listed",
//     dynamic_fields:
//       '{"machinery_type": "tractor/power tiller", "subsidy_limit": "INR 25,000", "contact_info": "mechanize@nudge.org.in", "application_link": "https://thenudge.org/mechanization"}',
//     locations: ["CHHATTISGARH", "Telangana"],
//     recipients_accepted: 0,
//     provider: "The/Nudge Institute",
//     program: "Farm Mechanization Support",
//     description: "Subsidy for renting or purchasing farm machinery",
//     eligibility: "Smallholder farmers with <5 acres landholding",
//     benefits: "Upto 50% subsidy on machinery rentals or purchase",
//     application_process:
//       "Apply online with landholding certificate and quotation from supplier",
//     $id: "681764d900324db9bef0",
//     $createdAt: "2025-05-04T13:00:09.959+00:00",
//     $updatedAt: "2025-05-04T13:00:09.959+00:00",
//     $permissions: [],
//     $databaseId: "agri_marketplace",
//     $collectionId: "subsidies",
//   },
// ];

const availableSubsidies = [
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

// Sample action items data (if not already present in the farm store)
const sampleActionItems = [
  {
    id: "action1",
    title: "Apply fertilizer to wheat field",
    description: "Time to apply second round of fertilizer to improve yield",
    dueDate: "2025-05-10",
    priority: "high",
  },
  {
    id: "action2",
    title: "Irrigation maintenance",
    description: "Check and repair water pump system for summer irrigation",
    dueDate: "2025-05-15",
    priority: "medium",
  },
];

// Weather day item component
const WeatherDayItem = ({ day, colors, radius }) => {
  const date = new Date(day.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
  });

  return (
    <Card style={[styles.weatherDayCard, { borderRadius: radius.md }]}>
      <Typography variant="caption" centered>
        {formattedDate}
      </Typography>
      <Text style={styles.temperatureText}>
        {Math.round(day.temperature)}°C
      </Text>
      <View style={styles.weatherDetail}>
        <CloudRain width={14} height={14} stroke={colors.textSecondary} />
        <Typography
          variant="small"
          color="textSecondary"
          style={{ marginLeft: 4 }}
        >
          {day.rainfall} mm
        </Typography>
      </View>
      <View style={styles.weatherDetail}>
        <Wind width={14} height={14} stroke={colors.textSecondary} />
        <Typography
          variant="small"
          color="textSecondary"
          style={{ marginLeft: 4 }}
        >
          {day.wind_speed} km/h
        </Typography>
      </View>
    </Card>
  );
};

// News item component
const NewsItem = ({ item, colors, radius, onPress }) => {
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      style={[
        styles.newsItem,
        { borderRadius: radius.md, backgroundColor: colors.card },
      ]}
      onPress={onPress}
    >
      <View style={styles.newsHeader}>
        <Typography variant="caption" color="textSecondary">
          {formattedDate} • {item.source}
        </Typography>
        <ExternalLink width={14} height={14} stroke={colors.primary} />
      </View>
      <Typography variant="bodyLarge" style={styles.newsHeadline}>
        {item.headline}
      </Typography>
    </TouchableOpacity>
  );
};

// Custom Action Item Card component
const ActionItemCard = ({ item, colors, radius }) => {
  const date = new Date(item.dueDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  const priorityColors = {
    high: colors.error,
    medium: colors.warning,
    low: colors.success,
  };

  return (
    <Card style={[styles.actionItemCard, { borderRadius: radius.md }]}>
      <View style={styles.actionItemHeader}>
        <View
          style={[
            styles.priorityIndicator,
            {
              backgroundColor: priorityColors[item.priority] || colors.primary,
            },
          ]}
        />
        <Typography variant="bodyLarge">{item.title}</Typography>
      </View>
      <Typography
        variant="body"
        color="textSecondary"
        style={styles.actionItemDescription}
      >
        {item.description}
      </Typography>
      <View style={styles.actionItemFooter}>
        <View style={styles.actionItemDate}>
          <Calendar width={14} height={14} stroke={colors.textSecondary} />
          <Typography
            variant="small"
            color="textSecondary"
            style={{ marginLeft: 4 }}
          >
            Due: {formattedDate}
          </Typography>
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary + "20", borderRadius: radius.sm },
          ]}
        >
          <Typography variant="small" color="primary">
            Complete
          </Typography>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

// Add a new component for rendering the UI of a subsidy item
// const SubsidyCard = ({ subsidy, colors, radius, spacing, translate }) => {
//   const [isApplied, setIsApplied] = useState(false);

//   // Parse dynamic fields if they exist
//   let dynamicFields = {};
//   try {
//     if (subsidy.dynamic_fields) {
//       dynamicFields = JSON.parse(subsidy.dynamic_fields);
//     }
//   } catch (error) {
//     console.log("Error parsing dynamic fields", error);
//   }

//   // Format application link
//   const applicationLink = dynamicFields.application_link || "";

//   // Create a local state variable to hold the button text
//   const [buttonText, setButtonText] = useState(translate("applyNow"));

//   const handleApply = () => {
//     // Immediately update the button text
//     setButtonText(translate("applied"));
//     setIsApplied(true);
//     if (applicationLink) {
//       Linking.openURL(applicationLink);
//     }
//   };

//   return (
//     <Card style={[styles.subsidyCard, { borderRadius: radius.md }]}>
//       <View style={styles.subsidyHeader}>
//         <Typography variant="bodyLarge" style={styles.subsidyTitle}>
//           {subsidy.program}
//         </Typography>
//         <View
//           style={[
//             styles.subsidyTypeTag,
//             {
//               backgroundColor:
//                 subsidy.type === "cash"
//                   ? colors.primary + "20"
//                   : colors.success + "20",
//               borderRadius: radius.sm,
//             },
//           ]}
//         >
//           <Typography
//             variant="small"
//             color={subsidy.type === "cash" ? "primary" : "success"}
//           >
//             {subsidy.type.toUpperCase()}
//           </Typography>
//         </View>
//       </View>

//       <Typography
//         variant="body"
//         color="textSecondary"
//         style={styles.subsidyDescription}
//       >
//         {subsidy.description}
//       </Typography>

//       <View style={styles.subsidyDetail}>
//         <Typography
//           variant="body"
//           color="textSecondary"
//           style={styles.subsidyLabel}
//         >
//           Provider:
//         </Typography>
//         <Typography variant="body" style={{ marginLeft: spacing.sm, flex: 1 }}>
//           {subsidy.provider}
//         </Typography>
//       </View>

//       <View style={styles.subsidyDetail}>
//         <Typography
//           variant="body"
//           color="textSecondary"
//           style={styles.subsidyLabel}
//         >
//           Benefits:
//         </Typography>
//         <Typography variant="body" style={{ marginLeft: spacing.sm, flex: 1 }}>
//           {subsidy.benefits}
//         </Typography>
//       </View>

//       <View style={styles.subsidyDetail}>
//         <Typography
//           variant="body"
//           color="textSecondary"
//           style={styles.subsidyLabel}
//         >
//           Eligibility:
//         </Typography>
//         <Typography variant="body" style={{ marginLeft: spacing.sm, flex: 1 }}>
//           {subsidy.eligibility}
//         </Typography>
//       </View>

//       <TouchableOpacity
//         style={[
//           styles.applyButton,
//           {
//             backgroundColor: isApplied ? colors.success : colors.primary,
//             borderRadius: radius.sm,
//             opacity: isApplied ? 0.8 : 1,
//           },
//         ]}
//         onPress={handleApply}
//         disabled={isApplied}
//       >
//         <Typography variant="small" style={{ color: colors.background }}>
//           {buttonText}
//         </Typography>
//       </TouchableOpacity>
//     </Card>
//   );
// };
const SubsidyCard = ({ subsidy, colors, radius, spacing, translate }) => {
  const [isApplied, setIsApplied] = useState(false);
  const [buttonText, setButtonText] = useState(translate("applyNow"));

  const handleApply = () => {
    setButtonText(translate("applied"));
    setIsApplied(true);
    if (subsidy.apply_link) {
      Linking.openURL(subsidy.apply_link);
    }
  };

  return (
    <Card style={[styles.subsidyCard, { borderRadius: radius.md }]}>
      {/* Title */}
      <Typography variant="bodyLarge" style={styles.subsidyTitle}>
        {subsidy.name}
      </Typography>

      {/* Description */}
      <Typography
        variant="body"
        color="textSecondary"
        style={styles.subsidyDescription}
      >
        {subsidy.description}
      </Typography>

      {/* Ministry / Provider */}
      <View style={styles.subsidyDetail}>
        <Typography
          variant="body"
          color="textSecondary"
          style={styles.subsidyLabel}
        >
          Ministry:
        </Typography>
        <Typography variant="body" style={{ marginLeft: spacing.sm, flex: 1 }}>
          {subsidy.ministry}
        </Typography>
      </View>

      {/* Apply Button */}
      <TouchableOpacity
        style={[
          styles.applyButton,
          {
            backgroundColor: isApplied ? colors.success : colors.primary,
            borderRadius: radius.sm,
            opacity: isApplied ? 0.8 : 1,
          },
        ]}
        onPress={handleApply}
        disabled={isApplied}
      >
        <Typography variant="small" style={{ color: colors.background }}>
          {buttonText}
        </Typography>
      </TouchableOpacity>
    </Card>
  );
};

// Section divider component for better visual separation
const SectionDivider = ({ colors }) => (
  <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
);

export default function DashboardScreen() {
  const { colors, spacing, radius } = useTheme();
  const { weather } = useFarmStore();
  const { user, logoutUser } = useUserStore();

  // Get action items from farm store or use sample data if not available
  const actionItems =
    useFarmStore((state) => state.actionItems) || sampleActionItems;

  // Fix: Use primitive selectors instead of object selector to prevent infinite re-renders
  const language = useLanguageStore((state) => state.language);
  const translate = useLanguageStore((state) => state.translate);
  const addTranslations = useLanguageStore((state) => state.addTranslations);

  // Initialize translations
  useEffect(() => {
    // Add translations for this page
    addTranslations({
      en: {
        hello: "Hello",
        welcome: "Welcome ",
        weatherForecast: "7-Day Weather Forecast",
        newsAndUpdates: "Agricultural News & Updates",
        viewMore: "View More",
        acceptedBids: "Pending Delivery",
        availableSubsidies: "Available Subsidies",
        noBids: "No accepted bids yet",
        noSubsidies: "No available subsidies",
        crop: "Crop",
        amount: "Amount",
        buyer: "Buyer",
        date: "Date",
        deadline: "Deadline",
        status: "Status",
        applyNow: "Apply Now",
        actionItems: "Action Items",
        applied: "Applied",
        price: "Price",
        quantity: "Quantity",
        complete: "Complete",
        due: "Due",
        provider: "Provider",
        benefits: "Benefits",
        eligibility: "Eligibility",
      },
      hi: {
        hello: "नमस्ते",
        welcome: "प्रगति में आपका स्वागत है",
        weatherForecast: "7-दिन का मौसम पूर्वानुमान",
        newsAndUpdates: "कृषि समाचार और अपडेट",
        viewMore: "और देखें",
        acceptedBids: "आपकी स्वीकृत बोलियां",
        availableSubsidies: "उपलब्ध सब्सिडी",
        noBids: "अभी तक कोई स्वीकृत बोली नहीं",
        noSubsidies: "कोई उपलब्ध सब्सिडी नहीं",
        crop: "फसल",
        amount: "राशि",
        buyer: "खरीदार",
        date: "तिथि",
        deadline: "समय सीमा",
        status: "स्थिति",
        applyNow: "अभी आवेदन करें",
        actionItems: "कार्य सूची",
        applied: "आवेदित",
        price: "मूल्य",
        quantity: "मात्रा",
        complete: "पूर्ण करें",
        due: "नियत तारीख",
        provider: "प्रदाता",
        benefits: "लाभ",
        eligibility: "पात्रता",
      },
      mr: {
        hello: "नमस्कार",
        welcome: "प्रगतीमध्ये आपले स्वागत आहे",
        weatherForecast: "7-दिवसांचा हवामान अंदाज",
        newsAndUpdates: "कृषी बातम्या आणि अपडेट्स",
        viewMore: "अधिक पहा",
        acceptedBids: "तुमच्या स्वीकृत बोली",
        availableSubsidies: "उपलब्ध अनुदान",
        noBids: "अद्याप कोणतीही स्वीकृत बोली नाही",
        noSubsidies: "कोणतेही उपलब्ध अनुदान नाही",
        crop: "पीक",
        amount: "रक्कम",
        buyer: "खरेदीदार",
        date: "तारीख",
        deadline: "अंतिम तारीख",
        status: "स्थिती",
        applyNow: "आत्ताच अर्ज करा",
        actionItems: "कृती आयटम",
        applied: "अर्ज केला",
        price: "किंमत",
        quantity: "प्रमाण",
        complete: "पूर्ण करा",
        due: "नियत तारीख",
        provider: "प्रदाता",
        benefits: "लाभ",
        eligibility: "पात्रता",
      },
    });
  }, [addTranslations]);

  const openNewsLink = (url) => {
    Linking.openURL(url);
  };

  ///my fixing
  //full

  interface RawForecast {
    date: string;
    day_condition: string;
    night_condition: string;
    humidity_day: number;
    humidity_night: number;
    max_temp_c: number;
    min_temp_c: number;
    precipitation_chance_day: number;
    precipitation_chance_night: number;
    wind_speed_day_kph: number;
    wind_speed_night_kph: number;
    sunrise: string;
    sunset: string;
  }

  interface Weather {
    temperature: string;
    soilTemperature: string;
    humidity: number;
    wind: number;
    precipitation: number;
    sunrise: string;
    sunset: string;
  }

  const [fullForecast, setFullForecast] = useState<RawForecast[]>([]);
  const [summaryForecast, setSummaryForecast] = useState<any[]>([]);

  const getRainfallDescription = (rainfall: number): string => {
    if (rainfall === 0) return "none";
    if (rainfall < 0.3) return "low";
    if (rainfall < 0.7) return "moderate";
    return "high";
  };

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(
        `https://efbede333ccb.ngrok-free.app/utility/weather/forecast?email=alice@example.com`
      );

      const data = response.data;
      setFullForecast(data); // store full API response

      const summary = data.map((item) => {
        const rainfall =
          Math.max(
            item.precipitation_chance_day,
            item.precipitation_chance_night
          ) / 100;

        return {
          date: item.date,
          rainfall,
          rainfall_description: getRainfallDescription(rainfall),
          wind_speed: Math.max(
            item.wind_speed_day_kph,
            item.wind_speed_night_kph
          ),
          temperature: ((item.max_temp_c + item.min_temp_c) / 2).toFixed(2),
        };
      });

      setSummaryForecast(summary);
    } catch (err) {
      console.error("Failed to fetch weather data", err);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);
  const value = fullForecast[0];
  let weather2: Weather | null = null;

  if (value) {
    weather2 = {
      temperature: ((value.max_temp_c + value.min_temp_c) / 2).toFixed(1),
      soilTemperature: ((value.max_temp_c + value.min_temp_c) / 2).toFixed(1),
      humidity: value.humidity_day,
      wind: Math.max(value.wind_speed_day_kph, value.wind_speed_night_kph),
      precipitation:
        Math.max(
          value.precipitation_chance_day,
          value.precipitation_chance_night
        ) / 10,
      sunrise: new Date(value.sunrise).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sunset: new Date(value.sunset).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  const wval: Weather = weather2 ?? weather;

  console.log(fullForecast);
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[styles.headerContainer, { backgroundColor: colors.text }]}
        >
          <View style={styles.header}>
            <View style={styles.userSection}>
              <Typography
                variant="heading"
                style={[styles.greeting, { color: colors.background }]}
              >
                <Text>
                  {translate("hello")} {"Ajay"}
                </Text>
              </Typography>
              <Typography
                variant="body"
                style={[styles.welcomeText, { color: colors.background }]}
              >
                <Text>{translate("Welcome")}</Text>
              </Typography>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={logoutUser}
                style={[styles.modernIconButton, styles.logoutButton]}
              >
                <LogOut width={18} height={18} stroke="#FF6B6B" />
              </TouchableOpacity>

              <View style={[styles.modernIconButton, styles.languageButton]}>
                <LanguagePicker />
              </View>
            </View>
          </View>

          <View style={styles.modernLocationContainer}>
            <Typography
              variant="caption"
              style={[styles.modernLocationText, { color: colors.background }]}
            >
              {weather.location}
            </Typography>
          </View>
        </View>

        <View
          style={[
            styles.weatherWidgetContainer,
            { backgroundColor: colors.text },
          ]}
        >
          <WeatherWidget weather={wval} />
        </View>

        {/* 7-Day Weather Forecast */}
        <View
          style={[
            styles.sectionContainer,
            styles.sectionWithBackground,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Typography variant="subheading" style={styles.sectionTitle}>
            <Text>{translate("weatherForecast")}</Text>
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastContainer}
          >
            {summaryForecast.map((date, index) => (
              <WeatherDayItem
                key={index}
                day={date}
                colors={colors}
                radius={radius}
              />
            ))}
          </ScrollView>
        </View>

        {/* News Section */}
        <View
          style={[styles.sectionContainer, { backgroundColor: colors.text }]}
        >
          <Typography
            variant="subheading"
            style={[styles.sectionTitle, { color: colors.background }]}
          >
            <Text>{translate("newsAndUpdates")}</Text>
          </Typography>
          <View style={styles.newsContainer}>
            {newsItems.map((item, index) => (
              <NewsItem
                key={index}
                item={item}
                colors={colors}
                radius={radius}
                onPress={() => openNewsLink(item.url)}
              />
            ))}
          </View>
        </View>

        {/* Accepted Bids Section
        <View
          style={[
            styles.sectionContainer,
            styles.sectionWithBackground,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Typography variant="subheading" style={styles.sectionTitle}>
            <Text>{translate("acceptedBids")}</Text>
          </Typography>
          <View style={styles.bidsContainer}>
            {acceptedBids.length > 0 ? (
              <>
                <View
                  style={[
                    styles.bidHeader,
                    {
                      backgroundColor: colors.background,
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <Typography
                    variant="small"
                    color="textSecondary"
                    style={styles.bidHeaderItem}
                  >
                    {translate("crop")}
                  </Typography>
                  <Typography
                    variant="small"
                    color="textSecondary"
                    style={styles.bidHeaderItem}
                  >
                    {translate("price")}
                  </Typography>
                  <Typography
                    variant="small"
                    color="textSecondary"
                    style={styles.bidHeaderItem}
                  >
                    {translate("quantity")}
                  </Typography>
                  <Typography
                    variant="small"
                    color="textSecondary"
                    style={styles.bidHeaderItem}
                  >
                    {translate("date")}
                  </Typography>
                </View>
                {acceptedBids.map((bid, index) => {
                  const date = new Date(bid.timestamp);
                  const formattedDate = date.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <View
                      key={bid.$id}
                      style={[
                        styles.bidRow,
                        {
                          backgroundColor:
                            index % 2 === 0
                              ? colors.card
                              : colors.backgroundSecondary,
                          borderRadius: radius.sm,
                        },
                      ]}
                    >
                      <Typography variant="body" style={styles.bidItem}>
                        {bid.crop}
                      </Typography>
                      <Typography variant="body" style={styles.bidItem}>
                        ₹{bid.price_per_kg}/kg
                      </Typography>
                      <Typography variant="body" style={styles.bidItem}>
                        {bid.quantity} kg
                      </Typography>
                      <Typography variant="body" style={styles.bidItem}>
                        {formattedDate}
                      </Typography>
                    </View>
                  );
                })}
              </>
            ) : (
              <Typography variant="body" color="textSecondary" centered>
                {translate("noBids")}
              </Typography>
            )}
          </View>
        </View> */}
        {/* Available Subsidies Section */}
        <View style={styles.sectionContainer}>
          <Typography variant="subheading" style={styles.sectionTitle}>
            <Text>{("New Subsidies")}</Text>
          </Typography>
          <View style={styles.subsidiesContainer}>
            {availableSubsidies.length > 0 ? (
              availableSubsidies.map((subsidy) => (
                <SubsidyCard
                  key={subsidy.$id}
                  subsidy={subsidy}
                  colors={colors}
                  radius={radius}
                  spacing={spacing}
                  translate={translate}
                />
              ))
            ) : (
              <Typography variant="body" color="textSecondary" centered>
                {translate("noSubsidies")}
              </Typography>
            )}
          </View>
        </View>
        <View
          style={[
            styles.sectionContainer,
            styles.sectionWithBackground,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          {/* <Typography variant="subheading" style={styles.sectionTitle}>
            <Text>{translate("actionItems")}</Text>
          </Typography>
          <View style={styles.actionItemsContainer}>
            {actionItems.slice(0, 2).map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                colors={colors}
                radius={radius}
              />
            ))}
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    marginHorizontal: -20,
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 12,
    paddingBottom: 20,
    marginBottom: 18,
  },
  userSection: {
    flex: 1,
    paddingRight: 16,
    marginLeft: 16,
  },
  greeting: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1.0,
    marginBottom: 8,
    lineHeight: 40,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
    opacity: 0.88,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 4,
  },
  modernIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 107, 107, 0.18)",
    borderColor: "rgba(255, 107, 107, 0.35)",
  },
  languageButton: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.28)",
    marginRight: 10,
  },
  modernLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 16,
    marginLeft: 16,
    paddingVertical: 12,
    borderRadius: 22,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 4,
  },
  locationIconWrapper: {
    marginRight: 10,
  },
  modernLocationText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  weatherWidgetContainer: {
    paddingTop: 0,
    paddingBottom: 28,
    marginHorizontal: -20,
    paddingHorizontal: 24,
    marginTop: 0,
    marginBottom: 0,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  sectionContainer: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  sectionWithBackground: {
    marginHorizontal: 0,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 36,
  },
  sectionTitle: {
    marginBottom: 24,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  sectionDivider: {
    height: 1,
    width: "100%",
    marginVertical: 20,
  },
  forecastContainer: {
    paddingVertical: 16,
    paddingRight: 16,
  },
  weatherDayCard: {
    padding: 16,
    marginRight: 16,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  temperatureText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  weatherDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  newsContainer: {
    marginTop: 16,
  },
  newsItem: {
    padding: 20,
    marginBottom: 16,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  newsHeadline: {
    lineHeight: 24,
  },
  bidsContainer: {
    marginTop: 16,
  },
  bidHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  bidHeaderItem: {
    flex: 1,
    fontWeight: "600",
  },
  bidRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  bidItem: {
    flex: 1,
  },
  subsidiesContainer: {
    marginTop: 16,
  },
  subsidyCard: {
    padding: 20,
    marginBottom: 16,
  },
  subsidyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subsidyTitle: {
    flex: 1,
    paddingRight: 12,
  },
  subsidyTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  subsidyDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  subsidyDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  subsidyLabel: {
    width: 80,
    fontWeight: "500",
  },
  applyButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  actionItemsContainer: {
    marginTop: 16,
  },
  actionItemCard: {
    padding: 20,
    marginBottom: 16,
  },
  actionItemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  actionItemDescription: {
    marginTop: 12,
    marginLeft: 16,
    lineHeight: 20,
  },
  actionItemFooter: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionItemDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
