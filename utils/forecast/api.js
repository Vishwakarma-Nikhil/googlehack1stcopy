import { format } from "date-fns";

// API base URL and proxy image URL
const API_BASE_URL = "https://efbede333ccb.ngrok-free.app/predictions";
const PROXY_IMAGE_URL =
  "https://efbede333ccb.ngrok-free.app/proxy-image/?image_url=";

// Helper function to convert storage URLs to proxy URLs
export const getProxiedImageUrl = (originalUrl) => {
  if (!originalUrl) return null;
  return `${PROXY_IMAGE_URL}${encodeURIComponent(originalUrl)}`;
};

// Ensure user email is available before making API calls
const ensureEmail = (email) => {
  if (!email) {
    throw new Error("User email is required for API operations");
  }
  return email;
};

// Validate the user is authenticated
export const validateUser = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return false;
  }
  return true;
};

// Soil prediction API
export const fetchSoilPrediction = async (imageUri, email) => {
  try {
    const userEmail = ensureEmail(email);
    console.log("Soil prediction API call - Start");
    console.log("Image URI:", imageUri);

    // Skip validation for file:// URIs as they're from the device's file system
    if (!imageUri || typeof imageUri !== "string") {
      throw new Error("Invalid image format. Please select a valid image.");
    }

    const formData = new FormData();

    // Determine image type based on URI
    let imageType = "image/jpeg"; // Default
    let fileName = "soil-image.jpg";

    // Special handling for file URIs from ImagePicker
    if (imageUri.startsWith("file://")) {
      if (imageUri.toLowerCase().endsWith(".png")) {
        imageType = "image/png";
        fileName = "soil-image.png";
      }
    }

    formData.append("file", {
      uri: imageUri,
      type: imageType,
      name: fileName,
    });

    console.log(
      "Sending soil prediction request to:",
      `${API_BASE_URL}/soil_type?email=${userEmail}`
    );
    const response = await fetch(
      `${API_BASE_URL}/soil_type?email=${userEmail}`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Soil prediction API response status:", response.status);
    if (!response.ok)
      throw new Error(`Failed to predict soil type: ${response.status}`);

    const data = await response.json();
    console.log("Soil prediction API response data:", data);
    return data;
  } catch (error) {
    console.error("Soil prediction error:", error);
    console.log("Returning dummy soil data due to error");
    // Return dummy data as fallback
    return { soil_type: "Loamy", confidence: 95.0 };
  }
};

export const fetchSoilHistory = async (email) => {
  try {
    const userEmail = ensureEmail(email);
    console.log("Soil history API call - Start");
    console.log(
      "Fetching soil history from:",
      `${API_BASE_URL}/soil_type/history?email=${userEmail}`
    );

    const response = await fetch(
      `${API_BASE_URL}/soil_type/history?email=${userEmail}`
    );

    console.log("Soil history API response status:", response.status);
    if (!response.ok)
      throw new Error(`Failed to fetch soil history: ${response.status}`);

    const data = await response.json();
    console.log("Soil history API response data:", data);

    // Process image URLs through the proxy
    if (data.history && Array.isArray(data.history)) {
      data.history = data.history.map((item) => ({
        ...item,
        file_url: item.file_url ? getProxiedImageUrl(item.file_url) : null,
      }));
    }

    return data;
  } catch (error) {
    console.error("Soil history error:", error);
    console.log("Returning dummy soil history data due to error");
    // Return dummy data as fallback
    return {
      history: [
        {
          file_id: "abc123",
          file_url: "https://example.com/soil.jpg",
          soil_type: "Loamy",
          confidence: 95.0,
          uploaded_at: "2023-05-01T12:00:00.000+00:00",
        },
        {
          file_id: "def456",
          file_url: "https://example.com/soil2.jpg",
          soil_type: "Sandy",
          confidence: 87.0,
          uploaded_at: "2023-04-15T10:30:00.000+00:00",
        },
      ],
    };
  }
};

// Disease prediction API
export const fetchDiseasePrediction = async (
  imageData,
  email,
  store = true,
  language = "english"
) => {
  try {
    const userEmail = ensureEmail(email);
    console.log("Disease prediction API call - Start");
    console.log("User email:", userEmail);

    // Check if imageData is already a FormData object (from DiseaseTab component)
    let formData;
    if (imageData instanceof FormData) {
      console.log("Using provided FormData for disease prediction");
      formData = imageData;
    } else {
      // For backward compatibility - handle string URI
      console.log("Image URI:", imageData);

      // Skip validation for file:// URIs as they're from the device's file system
      if (!imageData || typeof imageData !== "string") {
        throw new Error("Invalid image format. Please select a valid image.");
      }

      // Create form data with the file and required parameters
      formData = new FormData();

      // Determine image type and extension
      let imageType = "image/jpeg"; // Default to JPEG
      let fileName = "plant-image.jpg";

      // Special handling for file URIs from ImagePicker
      if (imageData.startsWith("file://")) {
        if (imageData.toLowerCase().endsWith(".png")) {
          imageType = "image/png";
          fileName = "plant-image.png";
        } else {
          // Default to JPEG for most camera/gallery picks
          imageType = "image/jpeg";
          fileName = "plant-image.jpg";
        }
      } else {
        // For non-file URIs, try to determine type
        try {
          if (imageData.includes(".")) {
            const extension = imageData.split(".").pop().toLowerCase();
            if (extension === "png") {
              imageType = "image/png";
              fileName = "plant-image.png";
            } else if (extension === "jpg" || extension === "jpeg") {
              imageType = "image/jpeg";
              fileName = "plant-image.jpg";
            }
          }
        } catch (error) {
          console.warn("Could not determine image type from URI:", error);
          // Continue with defaults
        }
      }

      console.log(`Using image type: ${imageType}, filename: ${fileName}`);

      const imageFile = {
        uri: imageData,
        type: imageType,
        name: fileName,
      };

      console.log("Image file object:", JSON.stringify(imageFile));
      formData.append("file", imageFile);
    }

    // Add query parameters to URL - email, store, and language
    const url = `${API_BASE_URL}/disease?email=${encodeURIComponent(
      userEmail
    )}&store=${store}&language=${language}`;
    console.log("Sending disease prediction request to:", url);

    // Set a longer timeout for this request (45 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      // Don't set Content-Type header in fetch - let the browser/native code set it with boundary
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Disease prediction API response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        // Try to get the full response body for debugging
        const errorText = await response.text().catch((textError) => {
          console.error("Failed to read error response text:", textError);
          return "Could not read error response";
        });

        console.error("Error response text:", errorText);

        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error("Could not parse error response as JSON");
        }

        throw new Error(
          `Failed to predict disease: ${response.status} - ${
            errorData.message || errorText
          }`
        );
      }

      // Try to parse JSON response with better error handling
      let data;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText.substring(0, 200) + "..."); // Log start of response
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        throw new Error("Server returned invalid data. Please try again.");
      }

      console.log("Disease prediction API response data:", data);

      // Validate response has expected fields
      if (!data.plant_name || !data.disease_name) {
        console.warn("API response missing expected fields:", data);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  } catch (error) {
    // Enhancement: provide more user-friendly error messages based on error type
    let userFriendlyMessage;

    if (error.message.includes("Network request failed")) {
      userFriendlyMessage =
        "Network connection issue. Please check your internet connection and try again.";
      console.error("Network error details:", {
        original: error.message,
        userMessage: userFriendlyMessage,
      });
    } else {
      userFriendlyMessage = error.message;
    }

    const enhancedError = new Error(userFriendlyMessage);
    enhancedError.originalError = error;

    console.error("Disease prediction error details:", {
      name: error.name,
      message: error.message,
      userMessage: userFriendlyMessage,
      stack: error.stack,
      cause: error.cause,
    });

    throw enhancedError;
  }
};

export const fetchDiseaseHistory = async (email, language = "english") => {
  try {
    const userEmail = ensureEmail(email);
    console.log("Disease history API call - Start");
    const url = `${API_BASE_URL}/disease/history?email=${encodeURIComponent(
      userEmail
    )}&language=${language}`;
    console.log("Fetching disease history from:", url);

    const response = await fetch(url).catch((error) => {
      console.error("Network error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
      throw error;
    });

    console.log("Disease history API response status:", response.status);
    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Could not parse error response");
      console.error("Error response text:", errorText);

      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error("Could not parse error response as JSON");
      }

      throw new Error(
        `Failed to fetch disease history: ${response.status} - ${
          errorData.message || errorText
        }`
      );
    }

    const data = await response.json();
    console.log("Disease history API response data:", data);

    // Process image URLs through the proxy
    if (data.history && Array.isArray(data.history)) {
      data.history = data.history.map((item) => ({
        ...item,
        file_url: item.file_url ? getProxiedImageUrl(item.file_url) : null,
      }));
    }

    return data;
  } catch (error) {
    // Add more detailed logging for debugging
    console.error("Disease history error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      email: email || "NOT_PROVIDED",
    });
    throw error; // Re-throw the error instead of returning dummy data
  }
};

// Weather prediction API
export const fetchWeatherPrediction = async (startDate, endDate, email) => {
  try {
    const userEmail = ensureEmail(email);
    console.log("Weather prediction API call - Start");
    console.log(
      "Date range:",
      format(startDate, "yyyy-MM-dd"),
      "to",
      format(endDate, "yyyy-MM-dd")
    );

    const requestBody = {
      email: userEmail,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    };
    console.log("Weather prediction request body:", requestBody);
    console.log(
      "Sending weather prediction request to:",
      `${API_BASE_URL}/weather`
    );

    const response = await fetch(`${API_BASE_URL}/weather`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Weather prediction API response status:", response.status);
    if (!response.ok)
      throw new Error(`Failed to predict weather: ${response.status}`);

    const data = await response.json();
    console.log("Weather prediction API response data:", data);
    return data;
  } catch (error) {
    console.error("Weather prediction error:", error);
    console.log("Returning dummy weather data due to error");
    // Return hardcoded data as fallback
    return HARDCODED_WEATHER_DATA;
  }
};

export const fetchWeatherHistory = async (email) => {
  try {
    const userEmail = ensureEmail(email);
    console.log("Weather history API call - Start");
    console.log(
      "Fetching weather history from:",
      `${API_BASE_URL}/weather/history?email=${userEmail}`
    );

    const response = await fetch(
      `${API_BASE_URL}/weather/history?email=${userEmail}`
    );

    console.log("Weather history API response status:", response.status);
    if (!response.ok)
      throw new Error(`Failed to fetch weather history: ${response.status}`);

    const data = await response.json();
    console.log("Weather history API response data:", data);
    return data;
  } catch (error) {
    console.error("Weather history error:", error);
    console.log("Returning dummy weather history data due to error");
    // Return dummy data as fallback
    return {
      history: [
        {
          start_date: "2023-05-01",
          end_date: "2023-05-10",
          weather_data: [
            {
              month: "05",
              temperature_2m_max: 30.5,
              temperature_2m_min: 29.4,
              precipitation_sum: 0.0,
              wind_speed_10m_max: 22.5,
              shortwave_radiation_sum: 25.26,
            },
          ],
          requested_at: "2023-04-29T12:00:00.000+00:00",
        },
      ],
    };
  }
};

// Crop prediction API
export const fetchCropPrediction = async (
  startDate,
  endDate,
  acres,
  soilType,
  soilImage,
  email
) => {
  try {
    const userEmail = ensureEmail(email);
    console.log("Crop prediction API call - Start");
    console.log(
      "Date range:",
      format(startDate, "yyyy-MM-dd"),
      "to",
      format(endDate, "yyyy-MM-dd")
    );
    console.log("Acres:", acres);
    console.log("Soil type:", soilType || "Not provided");
    console.log("Soil image:", soilImage ? "Provided" : "Not provided");

    const formData = new FormData();
    formData.append("email", userEmail);
    formData.append("start_date", format(startDate, "yyyy-MM-dd"));
    formData.append("end_date", format(endDate, "yyyy-MM-dd"));
    formData.append("acres", acres.toString());

    if (soilType) {
      formData.append("soil_type", soilType);
    } else if (soilImage) {
      formData.append("file", {
        uri: soilImage,
        type: "image/jpeg",
        name: "soil-image.jpg",
      });
    }

    console.log(
      "Sending crop prediction request to:",
      `${API_BASE_URL}/crop_prediction`
    );
    const response = await fetch(`${API_BASE_URL}/crop_prediction`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Crop prediction API response status:", response.status);
    if (!response.ok)
      throw new Error(`Failed to predict crops: ${response.status}`);

    const data = await response.json();
    console.log("Crop prediction API response data:", data);
    return data;
  } catch (error) {
    console.error("Crop prediction error:", error);
    console.log("Returning dummy crop prediction data due to error");

    // Return dummy data as fallback
    return {
      request_details: {
        latitude: 22.520393976898,
        longitude: 88.007016991204,
        soil_type: "Black",
        land_size_acres: parseInt(acres),
        analysis_period: {
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
        },
        timestamp: new Date().toISOString(),
      },
      recommendations: [
        {
          rank: 1,
          crop_name: "Soybean",
          recommendation_score: 85.5,
          explanation_points: [],
          key_metrics: {
            expected_yield_range: "8-10 quintals/acre",
            price_forecast_trend: "Stable to Slightly Rising",
            estimated_input_cost_category: "Low-Medium",
            primary_fertilizer_needs:
              "Inoculant, Phosphorus, Potassium (Nitrogen fixed)",
          },
          relevant_subsidies: [],
          primary_risks: [],
          plotting_data: {
            price_forecast_chart: {
              description: "Predicted price range (INR/Quintal) near harvest.",
              data: [],
            },
            water_need_chart: {
              description:
                "Relative water requirement across growth stages (1=Low, 5=Very High).",
              data: [],
            },
            fertilizer_schedule_chart: {
              description: "Typical nutrient application timing.",
              data: [],
            },
          },
        },
      ],
      weather_context_summary:
        "Overall weather forecast indicates generally favorable conditions for planting in this region.",
    };
  }
};

// Function to handle image validation
export const validateImage = (imageUri) => {
  if (!imageUri || typeof imageUri !== "string") {
    return false;
  }

  // More flexible validation for file:// URIs from device storage
  // Expo image picker often returns URIs with unique formats
  if (imageUri.startsWith("file://")) {
    return true; // Trust file system URIs from ImagePicker
  }

  // For web and other platforms, check common extensions
  const validExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".gif"];
  return validExtensions.some((ext) => imageUri.toLowerCase().includes(ext));
};

// Hardcoded weather data for development
export const HARDCODED_WEATHER_DATA = [
  {
    month: "05",
    temperature_2m_max: 41.07,
    temperature_2m_min: 29.12,
    precipitation_sum: 0.03,
    wind_speed_10m_max: 16.73,
    shortwave_radiation_sum: 22.86,
  },
  {
    month: "06",
    temperature_2m_max: 42.65,
    temperature_2m_min: 32.3,
    precipitation_sum: 1.55,
    wind_speed_10m_max: 12.7,
    shortwave_radiation_sum: 19.39,
  },
  {
    month: "07",
    temperature_2m_max: 30.73,
    temperature_2m_min: 26.18,
    precipitation_sum: 9.78,
    wind_speed_10m_max: 11.9,
    shortwave_radiation_sum: 17.25,
  },
  {
    month: "08",
    temperature_2m_max: 31.52,
    temperature_2m_min: 25.35,
    precipitation_sum: 14.0,
    wind_speed_10m_max: 9.28,
    shortwave_radiation_sum: 16.44,
  },
  {
    month: "09",
    temperature_2m_max: 26.48,
    temperature_2m_min: 24.27,
    precipitation_sum: 3.2,
    wind_speed_10m_max: 6.25,
    shortwave_radiation_sum: 19.09,
  },
  {
    month: "10",
    temperature_2m_max: 31.8,
    temperature_2m_min: 23.8,
    precipitation_sum: 5.0,
    wind_speed_10m_max: 6.7,
    shortwave_radiation_sum: 14.21,
  },
];
