// Main display elements
const locationName = document.querySelector('.location-name');
const forecastItems = document.querySelectorAll('.forecast-item');

// Individual elements within each forecast item
const dayNames = document.querySelectorAll('.day-name');
const precipitations = document.querySelectorAll('.precipitation');
const weatherIcons = document.querySelectorAll('.weather-icon');
const tempHighs = document.querySelectorAll('.temp-high');
const tempLows = document.querySelectorAll('.temp-low');
const weatherDescs = document.querySelectorAll('.weather-desc');

// Error and loading elements
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const loading = document.getElementById('loading');



const weatherIconMap = {
  'sunny': '☀️',
  'clear': '☀️',
  'partly cloudy': '🌤️',
  'cloudy': '☁️',
  'overcast': '☁️',
  'rain': '🌧️',
  'light rain': '🌦️',
  'heavy rain': '🌧️',
  'thunderstorm': '🌩️',
  'snow': '❄️'
};



// Store API data
let currentLocation = {};
let forecastData = [];
let coordinates = { lat: null, lon: null };



// Function 1: Get user's location (using Mike's structure)
const findMe = () => {
  const success = (position) => {
    console.log(position);
    // Extract latitude and longitude from the position object
    const { latitude, longitude } = position.coords;
    
    // Store coordinates in our storage variables
    coordinates.lat = latitude;
    coordinates.lon = longitude;
    
    console.log("Got coordinates:", coordinates);
    // Call next function once we have coordinates
    getWeatherData();
  };
  
  const error = () => {
    showError("Could not get your location");
  };

  navigator.geolocation.getCurrentPosition(success, error);
};

// Function 2: Get weather data from API
const getWeatherData = async () => {
  try {
    showLoading(true);
    
    // First API call - get grid info
    const pointsResponse = await fetch(`https://api.weather.gov/points/${coordinates.lat},${coordinates.lon}`);
    const pointsData = await pointsResponse.json();
    currentLocation = pointsData.properties;
    
    // Second API call - get actual forecast
    const forecastUrl = currentLocation.forecast;
    const forecastResponse = await fetch(forecastUrl);
    const forecastJson = await forecastResponse.json();
    forecastData = forecastJson.properties.periods;
    
    showLoading(false);
    updateDisplay();
    
  } catch (error) {
    showError("Could not get weather data");
    showLoading(false);
  }
};

// Function 3: Update the page with weather data
const updateDisplay = () => {
  // Update location name
  locationName.textContent = currentLocation.relativeLocation.properties.city;
  
  // Loop through first 7 day periods and update display
  for (let i = 0; i < 7; i++) {
    const period = forecastData[i * 2]; // Skip night periods
    dayNames[i].textContent = period.name;
    tempHighs[i].textContent = period.temperature + '°';
    weatherDescs[i].textContent = period.shortForecast;
    weatherIcons[i].textContent = getWeatherIcon(period.shortForecast);
  }
};

// Helper functions
const showError = (message) => {
  errorText.textContent = message;
  errorMessage.style.display = 'block';
};

const showLoading = (show) => {
  loading.style.display = show ? 'block' : 'none';
};

const getWeatherIcon = (forecast) => {
  const condition = forecast.toLowerCase();
  for (let key in weatherIconMap) {
    if (condition.includes(key)) {
      return weatherIconMap[key];
    }
  }
  return '🌤️'; // default icon
};

findMe();