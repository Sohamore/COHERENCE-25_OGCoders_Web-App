// Initialize Map
var map = tt.map({
    key: 'B7Y3JRmvidZS7cUakcGNiZf9GAsgLMeu', // TomTom API Key
    container: 'map',
    center: [-74.0060, 40.7128], // Default coordinates (New York City)
    zoom: 12
});

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var userLocation = [position.coords.longitude, position.coords.latitude];
        map.setCenter(userLocation);
        findSafeLocations(userLocation);
    }, function (error) {
        console.error('Error fetching geolocation:', error.message);
    });
} else {
    console.error('Geolocation is not supported by this browser.');
}

// Find Safe Locations (Police Stations, Hospitals, etc.)
function findSafeLocations(userLocation) {
    var categories = '7319,7321'; // Police Station, Hospital or Polyclinic
    var radius = 5000; // Search radius in meters
    var url = `https://api.tomtom.com/search/2/nearbySearch/.json?key=B7Y3JRmvidZS7cUakcGNiZf9GAsgLMeu&lat=${userLocation[1]}&lon=${userLocation[0]}&radius=${radius}&categorySet=${categories}`;

    fetch(url)
        .then(response => response.json())
        .then(data => displaySafeLocations(data.results))
        .catch(error => console.error('Error fetching safe locations:', error));
}

function displaySafeLocations(locations) {
    locations.forEach(function (location) {
        var marker = new tt.Marker()
            .setLngLat([location.position.lon, location.position.lat])
            .addTo(map);

        var popup = new tt.Popup({ offset: 35 }).setHTML(`
            <strong>${location.poi.name}</strong><br>
            ${location.address.freeformAddress}<br>
            <em>Contact: ${location.poi.phone || 'Not Available'}</em>
        `);
        marker.setPopup(popup);
    });
}

// Fetch Air Quality Index (AQI)
const apiKey = '88861cfe801f5a07440a8239f44bc16b'; // OpenWeather API Key

async function getAQI(city) {
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('errorMessage');
    city = city.trim().toLowerCase();

    if (!city) {
        errorDiv.textContent = 'Please enter a valid city name.';
        resultDiv.style.display = 'none';
        return;
    }

    try {
        // Fetch city coordinates
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            errorDiv.textContent = 'City not found. Please check the name.';
            return;
        }

        const { lat, lon } = geoData[0];

        // Fetch AQI data
        const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const aqiData = await aqiResponse.json();

        displayAQIResults(city, aqiData.list[0].main.aqi, aqiData.list[0].components);

    } catch (error) {
        console.error('Error fetching AQI data:', error);
        errorDiv.textContent = 'Something went wrong. Please try again later.';
    }
}

function displayAQIResults(city, aqiValue, components) {
    const resultDiv = document.getElementById('result');
    const cityNameDiv = document.getElementById('cityName');
    const aqiInfoDiv = document.getElementById('aqiInfo');
    const pollutantsDiv = document.getElementById('pollutants');

    cityNameDiv.textContent = `City: ${capitalize(city)}`;
    aqiInfoDiv.textContent = `AQI: ${aqiValue} (${getAQILevel(aqiValue)})`;
    aqiInfoDiv.className = 'aqi-info ' + getAQIClass(aqiValue);

    renderPollutants(components, pollutantsDiv);

    resultDiv.style.display = 'block';
    displayPollutantsChart(components); // Call graph function
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function getAQILevel(aqi) {
    return ['Unknown', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi] || 'Unknown';
}

function getAQIClass(aqi) {
    return ['unknown', 'good', 'fair', 'moderate', 'poor', 'very-poor'][aqi] || '';
}

function renderPollutants(components, container) {
    container.innerHTML = '<h4>Pollutant Concentrations (μg/m³):</h4>';
    const pollutants = [
        { name: 'Carbon Monoxide (CO)', value: components.co },
        { name: 'Nitrogen Monoxide (NO)', value: components.no },
        { name: 'Nitrogen Dioxide (NO₂)', value: components.no2 },
        { name: 'Ozone (O₃)', value: components.o3 },
        { name: 'Sulphur Dioxide (SO₂)', value: components.so2 },
        { name: 'Fine Particles (PM2.5)', value: components.pm2_5 },
        { name: 'Coarse Particles (PM10)', value: components.pm10 },
        { name: 'Ammonia (NH₃)', value: components.nh3 }
    ];

    pollutants.forEach(pollutant => {
        const div = document.createElement('div');
        div.textContent = `${pollutant.name}: ${pollutant.value} μg/m³`;
        container.appendChild(div);
    });
}

// Display pollutants graph
function displayPollutantsChart(components) {
    const ctx = document.getElementById('pollutantsChart').getContext('2d');
    const pollutants = [
        { name: 'CO', value: components.co },
        { name: 'NO', value: components.no },
        { name: 'NO₂', value: components.no2 },
        { name: 'O₃', value: components.o3 },
        { name: 'SO₂', value: components.so2 },
        { name: 'PM2.5', value: components.pm2_5 },
        { name: 'PM10', value: components.pm10 },
        { name: 'NH₃', value: components.nh3 }
    ];

    const labels = pollutants.map(p => p.name);
    const data = pollutants.map(p => p.value);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pollutant Concentration (μg/m³)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    grid: {
                        color: '#FFFFFF', // White gridlines
                    },
                    ticks: {
                        color: '#FFFFFF', // White tick labels
                    }
                },
                y: {
                    grid: {
                        color: '#FFFFFF', // White gridlines
                    },
                    ticks: {
                        color: '#FFFFFF', // White tick labels
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFFFFF', // White legend text
                    }
                }
            }
        }
    });
}





// weather js

async function getWeatherAndPlotChart() {
    const apiKey = "88861cfe801f5a07440a8239f44bc16b"; // Replace with your OpenWeather API key
    const city = document.getElementById("city").value;

    if (!city) {
        document.getElementById("weather-info").innerHTML = `<p style="color: red;">Please enter a city name</p>`;
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const dates = data.list.map(item => item.dt_txt.split(' ')[0]);
            const temperatures = data.list.map(item => item.main.temp);

            document.getElementById("weather-info").innerHTML = `
                <p><strong>Weather forecast for ${data.city.name}</strong></p>
                <p>Displaying temperature trends...</p>
            `;

            const ctx = document.getElementById('weatherChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temperatures,
                        borderColor: '#00ffdd', /* Neon blue line */
                        backgroundColor: 'rgba(0, 255, 221, 0.2)', /* Neon blue shade */
                        borderWidth: 2,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#00ffdd' /* Neon blue legend */
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#00ffdd' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: { color: '#00ffdd' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else {
            document.getElementById("weather-info").innerHTML = `<p style="color: red;">${data.message}</p>`;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("weather-info").innerHTML = `<p style="color: red;">Failed to fetch weather data</p>`;
    }
}



// noti js

async function fetchWeatherAndPredict() {
    const apiKey = 'B7Y3JRmvidZS7cUakcGNiZf9GAsgLMeu'; // Replace with your OpenWeather API key
    const lat = 19.39; // Example latitude
    const lon = 72.82; // Example longitude

    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.list && data.list.length > 0) {
            const eveningForecast = data.list.find(item => item.dt_txt.includes("18:00:00")); // Evening at 6 PM

            if (eveningForecast) {
                const temp = eveningForecast.main.temp; // Temperature
                const condition = eveningForecast.weather[0].description; // Weather condition

                // Predict based on temperature and condition
                if (temp > 20 && temp < 30 && condition.includes("clear")) {
                    showNotification(`Good weather expected this evening: ${temp}°C and ${condition}`);
                } else if (condition.includes("rain")) {
                    showNotification(`Rain is expected this evening: ${condition}`);
                } else {
                    showNotification(`Evening weather: ${temp}°C and ${condition}`);
                }
            } else {
                showNotification("No evening forecast data available.");
            }
        } else {
            showNotification("Unable to fetch forecast data.");
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showNotification("Failed to fetch weather data.");
    }
}

// Function to show the notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    // Hide the notification after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Call the function on page load
window.onload = fetchWeatherAndPredict;