import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { Weather } from "../store/farmStore";
import { Thermometer, Droplet, Wind } from "react-native-feather";
import Cloud from "./Cloud";
import { Card } from "./Card";
import { Typography } from "./Typography";

interface WeatherWidgetProps {
  weather: Weather;
}



const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  const { colors, spacing, radius } = useTheme();
  const [pathWidth, setPathWidth] = React.useState(0);

  // Calculate the position for the sun indicator based on current time
  const calculateSunPosition = () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    // Parse sunrise and sunset times with am/pm format
    const parseTime = (timeString: string) => {
      const [time, period] = timeString.split(" ");
      const [hours, minutes] = time.split(":").map(Number);

      let hour24 = hours;
      if (period?.toLowerCase() === "pm" && hours !== 12) {
        hour24 = hours + 12;
      } else if (period?.toLowerCase() === "am" && hours === 12) {
        hour24 = 0;
      }

      return hour24 * 60 + (minutes || 0);
    };

    // const sunriseTimeInMinutes = parseTime(weather.sunrise)
    const sunriseTimeInMinutes = parseTime(weather.sunrise);
    const sunsetTimeInMinutes = parseTime(weather.sunset);

    // Debug logging (remove in production)
    console.log(
      "Current time:",
      `${currentHours}:${currentMinutes}`,
      currentTimeInMinutes
    );
    console.log("Sunrise:", weather.sunrise, sunriseTimeInMinutes);
    console.log("Sunset:", weather.sunset, sunsetTimeInMinutes);

    // If current time is before sunrise, sun is at the start (0)
    if (currentTimeInMinutes < sunriseTimeInMinutes) {
      console.log("Before sunrise, position: 0");
      return 0;
    }

    // If current time is after sunset, sun is at the end (1)
    if (currentTimeInMinutes > sunsetTimeInMinutes) {
      console.log("After sunset, position: 1");
      return 1;
    }

    // Calculate position between sunrise and sunset (0 to 1)
    const dayLength = sunsetTimeInMinutes - sunriseTimeInMinutes;
    const elapsed = currentTimeInMinutes - sunriseTimeInMinutes;
    const position = elapsed / dayLength;

    console.log(
      "Day position:",
      position,
      "elapsed:",
      elapsed,
      "dayLength:",
      dayLength
    );
    return position;
  };

  const sunPosition = calculateSunPosition();
  const sunLeftPosition = pathWidth > 0 ? sunPosition * (pathWidth - 14) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.temperatureContainer}>
        <View style={styles.cloudIcon}>
          <Cloud width={52} height={52} stroke="white" fill="#00D4FF" />
        </View>
        <Typography variant="headingLarge" style={styles.temperatureText}>
          {weather.temperature}°C
        </Typography>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Thermometer width={22} height={22} stroke="#00D4FF" />
          <Typography variant="bodyLarge" style={styles.metricValue}>
            {weather.soilTemperature}°C
          </Typography>
          <Typography variant="small" style={styles.metricLabel}>
            Soil temp
          </Typography>
        </View>

        <View style={styles.metricItem}>
          <Droplet width={22} height={22} stroke="#00D4FF" />
          <Typography variant="bodyLarge" style={styles.metricValue}>
            {weather.humidity}%
          </Typography>
          <Typography variant="small" style={styles.metricLabel}>
            Humidity
          </Typography>
        </View>

        <View style={styles.metricItem}>
          <Wind width={22} height={22} stroke="#00D4FF" />
          <Typography variant="bodyLarge" style={styles.metricValue}>
            {weather.wind} m/s
          </Typography>
          <Typography variant="small" style={styles.metricLabel}>
            Wind
          </Typography>
        </View>

        <View style={styles.metricItem}>
          <Droplet width={22} height={22} stroke="#00D4FF" />
          <Typography variant="bodyLarge" style={styles.metricValue}>
            {weather.precipitation} mm
          </Typography>
          <Typography variant="small" style={styles.metricLabel}>
            Rain
          </Typography>
        </View>
      </View>

      <View style={styles.sunTracker}>
        <View
          style={styles.sunPath}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setPathWidth(width);
          }}
        >
          <View
            style={[
              styles.sunIndicator,
              {
                backgroundColor: "#00D4FF",
                left: sunLeftPosition,
              },
            ]}
          />
          <View
            style={[
              styles.sunPathLine,
              { backgroundColor: "rgba(255, 255, 255, 0.3)" },
            ]}
          />
        </View>
        <View style={styles.sunTimes}>
          <View>
            <Typography variant="caption" style={styles.sunTimeText}>
              {weather.sunrise}
            </Typography>
            <Typography variant="small" style={styles.metricLabel}>
              Sunrise
            </Typography>
          </View>
          <View>
            <Typography variant="caption" style={styles.sunTimeText}>
              {weather.sunset}
            </Typography>
            <Typography variant="small" style={styles.metricLabel}>
              Sunset
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  temperatureContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  cloudIcon: {
    marginRight: 20,
  },
  temperatureText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  metricItem: {
    alignItems: "center",
    gap: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },
  sunTracker: {
    marginTop: 16,
  },
  sunPath: {
    height: 32,
    justifyContent: "center",
    position: "relative",
  },
  sunPathLine: {
    height: 3,
    width: "100%",
    borderRadius: 1.5,
  },
  sunIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "absolute",
    top: "50%",
    marginTop: -7,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sunTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  sunTimeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default WeatherWidget;
