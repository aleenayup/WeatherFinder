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