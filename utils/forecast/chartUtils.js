// Chart utilities for data visualization

export const getMonthName = (monthNumber) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[parseInt(monthNumber) - 1];
};

export const prepareTemperatureChartData = (weatherData) => {
  return {
    labels: weatherData.map(item => getMonthName(item.month)),
    datasets: [
      {
        data: weatherData.map(item => item.temperature_2m_max),
        color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`, // Tomato color for max temp
        strokeWidth: 2,
        id: 'max-temp',
      },
      {
        data: weatherData.map(item => item.temperature_2m_min),
        color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`, // Steel blue for min temp
        strokeWidth: 2,
        id: 'min-temp',
      },
    ],
    legend: ["Max Temp (°C)", "Min Temp (°C)"]
  };
};

export const preparePrecipitationChartData = (weatherData) => {
  return {
    labels: weatherData.map(item => getMonthName(item.month)),
    datasets: [
      {
        data: weatherData.map(item => item.precipitation_sum),
        color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`, // Royal blue
        strokeWidth: 2,
        id: 'precipitation',
      }
    ],
    legend: ["Precipitation (mm)"]
  };
};

export const prepareWindSpeedChartData = (weatherData) => {
  return {
    labels: weatherData.map(item => getMonthName(item.month)),
    datasets: [
      {
        data: weatherData.map(item => item.wind_speed_10m_max),
        color: (opacity = 1) => `rgba(60, 179, 113, ${opacity})`, // Medium sea green
        strokeWidth: 2,
        id: 'wind-speed',
      }
    ],
    legend: ["Max Wind Speed (km/h)"]
  };
};

export const prepareRadiationChartData = (weatherData) => {
  return {
    labels: weatherData.map(item => getMonthName(item.month)),
    datasets: [
      {
        data: weatherData.map(item => item.shortwave_radiation_sum),
        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange
        strokeWidth: 2,
        id: 'radiation',
      }
    ],
    legend: ["Solar Radiation (MJ/m²)"]
  };
};

export const preparePriceChartData = (chartData) => {
  // Extract months and dates for x-axis labels
  const labels = chartData.map(item => {
    const date = new Date(item.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${day} ${month}`;
  });
  
  // Create datasets for min and max prices
  const minPrices = chartData.map(item => item.predicted_price_min);
  const maxPrices = chartData.map(item => item.predicted_price_max);
  
  // Calculate the average price for a trend line
  const avgPrices = chartData.map((item) => 
    (item.predicted_price_min + item.predicted_price_max) / 2
  );
  
  // Find min and max values for better y-axis scaling
  const allPrices = [...minPrices, ...maxPrices];
  const minPrice = Math.min(...allPrices) * 0.95; // Add 5% padding
  const maxPrice = Math.max(...allPrices) * 1.05; // Add 5% padding
  
  return {
    labels,
    datasets: [
      {
        data: avgPrices,
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
        strokeWidth: 3,
        withDots: true,
        id: 'avg-price',
      },
      {
        data: minPrices,
        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
        strokeWidth: 2,
        withDots: false,
        id: 'min-price',
      },
      {
        data: maxPrices,
        color: (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
        strokeWidth: 2,
        withDots: false,
        id: 'max-price',
      }
    ],
    legend: ["Average Price", "Minimum Price", "Maximum Price"],
    yAxisRange: [minPrice, maxPrice]
  };
};

export const prepareWaterNeedData = (chartData) => {
  // Convert the water needs to a 0-1 scale for the progress chart
  return {
    labels: chartData.map(item => {
      const stageName = item.growth_stage.split('(')[0].trim();
      return stageName.length > 10 ? stageName.substring(0, 10) + "..." : stageName;
    }),
    data: chartData.map(item => item.relative_need_level / 5), // Scale to 0-1 range
    colors: [
      'rgba(66, 133, 244, 0.8)',
      'rgba(52, 168, 83, 0.8)',
      'rgba(251, 188, 5, 0.8)',
      'rgba(234, 67, 53, 0.8)'
    ],
    strokeWidth: 5
  };
};
