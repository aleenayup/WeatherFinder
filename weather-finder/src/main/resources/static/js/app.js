document.addEventListener('DOMContentLoaded', function() {

    function getAPICityName(cityName) {
        const cityMappings = {
            "Quebec City": "Québec",
            "Québec": "Québec",
        };
        return cityMappings[cityName] || cityName;
    }

    const cityItems = document.querySelectorAll('#top10 li');
    cityItems.forEach(item => {
        item.addEventListener('click', function() {
            const cityName = this.getAttribute('data-city') || this.textContent.trim();
            const apiCityName = getAPICityName(cityName);
            document.getElementById('cityInput').value = cityName;
            fetchWeather(apiCityName);
        });
    });

    const viewButton = document.getElementById('viewCityButton');
    const cityInput = document.getElementById('cityInput');

    viewButton.addEventListener('click', function() {
        const selectedCity = cityInput.value.trim();
        if (!selectedCity) return;
        fetchWeather(getAPICityName(selectedCity));
    });

    
    cityInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') viewButton.click();
    });

});


async function fetchWeather(city) {
    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = `<div class="loading"><p>Loading weather for ${city}...</p></div>`;

    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json&country=ca`
        );
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found.`);
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto&forecast_days=1`
        );
        const weatherData = await weatherResponse.json();

        displayWeather(`${name}, ${country}`, weatherData.current);

    } catch (error) {
        weatherDiv.innerHTML = `<p style="color: var(--danger)">${error.message}</p>`;
    }
}

function displayWeather(city, current) {
    // differnt comment
    document.getElementById('weather').innerHTML = `
        <div class="weather-result">
            <div class="weather-header">
                <h3>${city}</h3>
            </div>
            <div class="temp-display">
                <div class="temp-value">${current.temperature_2m}°C</div>
            </div>
            <div class="weather-info">
                <div class="weather-item">
                    <span class="label">Wind</span>
                    <span class="value">${current.wind_speed_10m} km/h</span>
                </div>
                <div class="weather-item">
                    <span class="label">Weather Code</span>
                    <span class="value">${current.weather_code}</span>
                </div>
            </div>
        </div>
    `;
}