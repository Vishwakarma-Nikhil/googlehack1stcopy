import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ActionButton from '../common/ActionButton';
import { 
  prepareTemperatureChartData, 
  preparePrecipitationChartData,
  prepareWindSpeedChartData,
  prepareRadiationChartData 
} from '../../../utils/forecast/chartUtils';
import { fetchWeatherPrediction, fetchWeatherHistory } from '../../../utils/forecast/api';
import { useUserStore } from '../../../store/userStore';

// Define interfaces for API data
interface WeatherData {
  month: string;
  temperature_2m_max: number;
  temperature_2m_min: number;
  precipitation_sum: number;
  wind_speed_10m_max: number;
  shortwave_radiation_sum: number;
}

interface WeatherHistoryItem {
  start_date: string;
  end_date: string;
  weather_data: WeatherData[];
  requested_at: string;
}

interface WeatherTabProps {
  colors: any;
  weatherHistory: WeatherHistoryItem[];
  initialWeatherData: WeatherData[];
  setWeatherHistory?: (history: WeatherHistoryItem[]) => void; // Make optional with ?
}

const WeatherTab: React.FC<WeatherTabProps> = ({ 
  colors, 
  weatherHistory, 
  initialWeatherData,
  setWeatherHistory 
}) => {
  const screenWidth = Dimensions.get('window').width - 40;
  const [weatherStartDate, setWeatherStartDate] = useState(new Date());
  const [weatherEndDate, setWeatherEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 6)));
  const [weatherResult, setWeatherResult] = useState<WeatherData[]>(initialWeatherData);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [forecastRequested, setForecastRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [internalWeatherHistory, setInternalWeatherHistory] = useState<WeatherHistoryItem[]>(weatherHistory || []);
  
  const { user } = useUserStore();

  // Load weather history when component mounts
  useEffect(() => {
    if (user?.email) {
      loadWeatherHistory();
    }
  }, [user?.email]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Load weather history
  const loadWeatherHistory = async () => {
    if (!user?.email) {
      console.log('No user email available, skipping weather history fetch');
      return;
    }
    
    setLoadingHistory(true);
    setError(null);
    
    try {
      console.log('Loading weather history for user:', user.email);
      const historyData = await fetchWeatherHistory(user.email);
      
      // Update either parent state if function exists, or internal state
      if (typeof setWeatherHistory === 'function') {
        setWeatherHistory(historyData.history || []);
      } else {
        console.log('Using internal state for weather history as setWeatherHistory is not provided');
        setInternalWeatherHistory(historyData.history || []);
      }
    } catch (error) {
      console.error('Error loading weather history:', error);
      setError(`Failed to load history: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle weather prediction
  const handleWeatherPrediction = async () => {
    if (!user?.email) {
      setError('Please log in to get weather predictions');
      return;
    }
    
    setLoadingWeather(true);
    setError(null);
    
    try {
      console.log('Predicting weather for user:', user.email);
      console.log('Date range:', formatDate(weatherStartDate), 'to', formatDate(weatherEndDate));
      
      const result = await fetchWeatherPrediction(weatherStartDate, weatherEndDate, user.email);
      setWeatherResult(result);
      setForecastRequested(true);
      
      // Refresh history after prediction
      await loadWeatherHistory();
    } catch (error) {
      console.error('Error predicting weather:', error);
      setError(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Chart configuration
  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
    },
  };

  // Prepare chart data
  const temperatureData = prepareTemperatureChartData(weatherResult);
  const precipitationData = preparePrecipitationChartData(weatherResult);
  const windSpeedData = prepareWindSpeedChartData(weatherResult);
  const radiationData = prepareRadiationChartData(weatherResult);

  // Get the history from either props or internal state
  const currentWeatherHistory = typeof setWeatherHistory === 'function' ? weatherHistory : internalWeatherHistory;

  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          <Text>Weather Forecast</Text>
        </Text>
        <Text style={[styles.sectionDescription, {color: colors.textSecondary}]}>
          <Text>Get weather forecasts for your region</Text>
        </Text>
        
        {!user?.email ? (
          <View style={[styles.warningContainer, {backgroundColor: colors.card}]}>
            <Text style={[styles.warningText, {color: colors.text}]}>
              Please log in to use weather prediction features.
            </Text>
          </View>
        ) : (
          <View style={[styles.weatherDateRangeCard, {backgroundColor: colors.card}]}>
            {/* Start Date Picker */}
            <Text style={[styles.dateLabel, {color: colors.text}]}>Start Date</Text>
            <TouchableOpacity
              style={[styles.dateInput, {borderColor: colors.border}]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={{color: colors.text}}>{formatDate(weatherStartDate)}</Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={weatherStartDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) setWeatherStartDate(selectedDate);
                }}
              />
            )}
            
            {/* End Date Picker */}
            <Text style={[styles.dateLabel, {color: colors.text}]}>End Date</Text>
            <TouchableOpacity
              style={[styles.dateInput, {borderColor: colors.border}]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={{color: colors.text}}>{formatDate(weatherEndDate)}</Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={weatherEndDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) setWeatherEndDate(selectedDate);
                }}
              />
            )}
            
            <ActionButton
              title="Update Forecast"
              onPress={handleWeatherPrediction}
              isLoading={loadingWeather}
              isDisabled={loadingWeather}
              icon={<Feather name="cloud" size={18} color="#fff" />}
              colors={colors}
              style={{marginTop: 10, marginBottom: 5}}
            />
            
            {error && (
              <View style={[styles.errorContainer, {backgroundColor: colors.notification}]}>
                <Text style={[styles.errorText, {color: colors.text}]}>{error}</Text>
              </View>
            )}
          </View>
        )}

        {/* Only show weather data when forecast is requested */}
        {forecastRequested && weatherResult && weatherResult.length > 0 ? (
          <>
            {/* Weather summary card */}
            <View style={[styles.weatherSummaryCard, {backgroundColor: colors.card}]}>
              <Text style={[styles.weatherSummaryTitle, {color: colors.text}]}>
                <Text>Weather Summary</Text>
              </Text>
              <View style={styles.weatherMetricsContainer}>
                <View style={styles.weatherMetric}>
                  <Feather name="thermometer" size={24} color={colors.primary} />
                  <Text style={[styles.metricValue, {color: colors.text}]}>
                    {Math.round(weatherResult.reduce((acc, item) => acc + item.temperature_2m_max, 0) / weatherResult.length)}°C
                  </Text>
                  <Text style={[styles.metricLabel, {color: colors.textSecondary}]}>Avg Max Temp</Text>
                </View>
                <View style={styles.weatherMetric}>
                  <Feather name="cloud-rain" size={24} color={colors.primary} />
                  <Text style={[styles.metricValue, {color: colors.text}]}>
                    {Math.round(weatherResult.reduce((acc, item) => acc + item.precipitation_sum, 0))}mm
                  </Text>
                  <Text style={[styles.metricLabel, {color: colors.textSecondary}]}>Total Rain</Text>
                </View>
                <View style={styles.weatherMetric}>
                  <Feather name="wind" size={24} color={colors.primary} />
                  <Text style={[styles.metricValue, {color: colors.text}]}>
                    {Math.round(weatherResult.reduce((acc, item) => acc + item.wind_speed_10m_max, 0) / weatherResult.length)}km/h
                  </Text>
                  <Text style={[styles.metricLabel, {color: colors.textSecondary}]}>Avg Wind</Text>
                </View>
              </View>
            </View>
            
            {/* Temperature chart */}
            <View style={[styles.chartCard, {backgroundColor: colors.card}]}>
              <Text style={[styles.chartTitle, {color: colors.text}]}>
                <Text>Temperature Trends</Text>
              </Text>
              <LineChart
                data={temperatureData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
                }}
                bezier
                style={styles.chart}
                fromZero={false}
                yAxisSuffix="°C"
              />
            </View>
            
            {/* Precipitation chart */}
            <View style={[styles.chartCard, {backgroundColor: colors.card}]}>
              <Text style={[styles.chartTitle, {color: colors.text}]}>
                <Text>Precipitation</Text>
              </Text>
              <BarChart
                data={precipitationData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
                }}
                style={styles.chart}
                fromZero={true}
                yAxisSuffix="mm"
              />
            </View>
            
            {/* Wind speed chart */}
            <View style={[styles.chartCard, {backgroundColor: colors.card}]}>
              <Text style={[styles.chartTitle, {color: colors.text}]}>
                <Text>Wind Speed</Text>
              </Text>
              <LineChart
                data={windSpeedData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
                }}
                style={styles.chart}
                fromZero={true}
                yAxisSuffix="km/h"
              />
            </View>
            
            {/* Radiation chart */}
            <View style={[styles.chartCard, {backgroundColor: colors.card}]}>
              <Text style={[styles.chartTitle, {color: colors.text}]}>
                <Text>Solar Radiation</Text>
              </Text>
              <LineChart
                data={radiationData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
                }}
                style={styles.chart}
                fromZero={true}
              />
            </View>
          </>
        ) : (
          !loadingWeather && (
            <View style={styles.noForecastContainer}>
              <View style={[styles.noForecastIcon, {backgroundColor: `${colors.primary}10`}]}>
                <Feather name="cloud-rain" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.noForecastText, {color: colors.textSecondary}]}>
                <Text>
                  Click "Update Forecast" to view detailed weather data for your selected date range.
                </Text>
              </Text>
            </View>
          )
        )}
        
        {/* Weather History Section */}
        {currentWeatherHistory && currentWeatherHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, {color: colors.text, marginTop: 20}]}>
              <Text>Weather History</Text>
            </Text>
            
            {loadingHistory ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
              currentWeatherHistory.map((item, index) => (
                <View key={index} style={[styles.historyItem, {backgroundColor: colors.card}]}>
                  <View style={styles.historyHeader}>
                    <Text style={[styles.historyTitle, {color: colors.text}]}>
                      {new Date(item.start_date).toLocaleDateString()} to {new Date(item.end_date).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.historyDate, {color: colors.textSecondary}]}>
                      Requested: {new Date(item.requested_at).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.weatherMetricsContainer}>
                    {item.weather_data.slice(0, 2).map((weather, wIndex) => (
                      <View key={wIndex} style={styles.historyMetrics}>
                        <Text style={[styles.historyMonth, {color: colors.primary}]}>Month {weather.month}</Text>
                        <Text style={[styles.historyDetail, {color: colors.text}]}>
                          Temp: {weather.temperature_2m_min}°C - {weather.temperature_2m_max}°C
                        </Text>
                        <Text style={[styles.historyDetail, {color: colors.text}]}>
                          Rain: {weather.precipitation_sum}mm
                        </Text>
                      </View>
                    ))}
                    
                    {item.weather_data.length > 2 && (
                      <Text style={[styles.moreMonths, {color: colors.primary}]}>
                        +{item.weather_data.length - 2} more months
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
  },
  weatherDateRangeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  weatherSummaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  weatherMetricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  weatherMetric: {
    alignItems: 'center',
    padding: 10,
    minWidth: 80,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  metricLabel: {
    fontSize: 14,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  noForecastContainer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noForecastIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  noForecastText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  warningContainer: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historySection: {
    marginTop: 10,
  },
  historyItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  historyHeader: {
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 12,
    marginTop: 2,
  },
  historyMetrics: {
    flex: 1,
    marginRight: 10,
    marginBottom: 10,
    minWidth: '45%',
  },
  historyMonth: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  historyDetail: {
    fontSize: 13,
    lineHeight: 20,
  },
  moreMonths: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
  loader: {
    marginVertical: 20,
  },
});

export default WeatherTab;
