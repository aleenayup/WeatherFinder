// WEATHER FINDER - COMPLETE VERSION WITH OPEN-METEO API

document.addEventListener('DOMContentLoaded', function() {
    console.log('Weather Finder loaded - using Open-Meteo API');
    
    // Add city name mapping for API compatibility
    function getAPICityName(cityName) {
        const cityMappings = {
            "Quebec City": "Québec",
            "Québec": "Québec",
        };
        
        return cityMappings[cityName] || cityName;
    }
    
    // TOP 10 CITIES FEATURE
    const cityItems = document.querySelectorAll('#top10 li');
    cityItems.forEach(item => {
        item.addEventListener('click', function() {
            const cityName = this.getAttribute('data-city') || this.textContent.trim();
            const apiCityName = getAPICityName(cityName);
            console.log(`Top 10 city clicked: ${cityName} -> ${apiCityName}`);
            document.getElementById('status').textContent = `Loading weather for ${cityName}...`;
            document.getElementById('error').textContent = '';
            
            // Update the search input with clicked city
            document.getElementById('cityInput').value = cityName;
            
            // Call fetchWeather function with real API
            fetchWeather(apiCityName);
        });
    });
    
    // VIEW CITY BUTTON FEATURE
    const viewButton = document.getElementById('viewCityBtn');
    const cityInput = document.getElementById('cityInput');
    
    viewButton.addEventListener('click', function() {
        const selectedCity = cityInput.value.trim();
        
        // Validate input
        if (!selectedCity) {
            document.getElementById('error').textContent = 'Please enter a city name';
            document.getElementById('status').textContent = '';
            return;
        }
        
        const apiCityName = getAPICityName(selectedCity);
        console.log(`View city button clicked: ${selectedCity} -> ${apiCityName}`);
        document.getElementById('status').textContent = `Fetching weather for ${selectedCity}...`;
        document.getElementById('error').textContent = '';
        
        // Call fetchWeather function with real API
        fetchWeather(apiCityName);
    });
    
    // Allow pressing Enter key in search input
    cityInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            viewButton.click();
        }
    });
});

// Weather fetching function with ACTUAL Open-Meteo API
async function fetchWeather(city) {
    try {
        // Show loading state
        const weatherDiv = document.getElementById('weather');
        weatherDiv.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading weather data for ${city}...</p>
            </div>
        `;
        
        document.getElementById('error').textContent = '';
        
        // 1. Get coordinates using Open-Meteo Geocoding API
        console.log(`Fetching coordinates for: ${city}`);
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json&country=ca`
        );
        
        if (!geoResponse.ok) {
            throw new Error(`Geocoding API failed: ${geoResponse.status}`);
        }
        
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found. Please check the spelling.`);
        }
        
        const { latitude, longitude, name, country } = geoData.results[0];
        console.log(`Found: ${name}, ${country} at ${latitude}, ${longitude}`);
        
        // 2. Get weather data using Open-Meteo Weather API (SIMPLIFIED)
        console.log(`Fetching weather data for coordinates: ${latitude}, ${longitude}`);
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto&forecast_days=1`
        );
        
        if (!weatherResponse.ok) {
            throw new Error(`Weather API failed: ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();
        console.log('Weather data received:', weatherData.current);
        
        // 3. Display the weather data
        const displayName = `${name}, ${country}`;
        displayWeather(displayName, weatherData.current);
        document.getElementById('status').textContent = `Weather loaded for ${displayName}`;
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        
        // Show error to user
        document.getElementById('error').textContent = `Error: ${error.message}`;
        
        // Show error in weather display
        const weatherDiv = document.getElementById('weather');
        weatherDiv.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 30px; color: var(--danger);">
                <h3 style="margin-bottom: 10px;">Failed to Load Weather</h3>
                <p style="margin-bottom: 15px;">${error.message}</p>
                <div style="background: rgba(229, 62, 62, 0.1); padding: 15px; border-radius: 10px; font-size: 0.9rem;">
                    <p style="margin: 5px 0;">Try checking the city name spelling</p>
                    <p style="margin: 5px 0;">Or select a different city</p>
                    <p style="margin: 5px 0;">The API might be temporarily unavailable</p>
                </div>
            </div>
        `;
        
        // Clear status message on error
        document.getElementById('status').textContent = '';
    }
}

function displayWeather(city, currentWeather) {
    const weatherDiv = document.getElementById('weather');
    
    weatherDiv.innerHTML = `
        <div class="weather-result">
            <div class="weather-header">
                <h3><i class="fas fa-city"></i> ${city}</h3>
            </div>
            
            <div class="temp-display">
                <div class="temp-main">
                    <div class="temp-value">${currentWeather.temperature_2m}°C</div>
                </div>
            </div>
            
            <div class="weather-info">
                <div class="weather-item">
                    <i class="fas fa-wind"></i>
                    <span class="label">Wind:</span>
                    <span class="value">${currentWeather.wind_speed_10m} km/h</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-code"></i>
                    <span class="label">Weather Code:</span>
                    <span class="value">${currentWeather.weather_code}</span>
                </div>
            </div>
        </div>
    `;
}