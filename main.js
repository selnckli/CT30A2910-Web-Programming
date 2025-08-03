// API Config
const apikey = '4f64522ab2d94486af9191212250308'
const apiurl = 'http://api.weatherapi.com/v1'

// search by location name
document.getElementById('weather').addEventListener('submit', function (event) {
    event.preventDefault()
    const locationInput = document.getElementById('input-loc').value
    fetchWeatherByLocation(locationInput)
});

// ask device's current location for weather search
document.getElementById('myLoc').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude
            const lon = position.coords.longitude
            fetchWeatherByCoordinates(lat, lon)
        })
    } else {
        alert('Geolocation is not supported by your browser. Enter a location manually broski.')
    }
})
let currentWeatherData = null; // To hold the last fetched data
let currentUnit = 'C';

const weatherIcons = {
    wind: '💨',
    humidity: '💧',
    feelslike: '🤗'

};

// unit toggle logic
document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', function() {
        currentUnit = this.value;
        if (currentWeatherData) {
            renderWeather(currentWeatherData);
        }
        if (document.getElementById("hourly-forecast")) {
            renderHourly(currentWeatherData);
        }
    });
});

// favorites bar logic
function updateFavoritesBar() {
    const bar = document.getElementById('favorites-bar');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.length) {
        bar.innerHTML = '';
        return;
    }
    bar.innerHTML = '<b>Favorites:</b> ';
    favorites.forEach(loc => {
        const btn = document.createElement('button');
        btn.textContent = loc;
        btn.onclick = () => fetchWeatherByLocation(loc);
        bar.appendChild(btn);
    });
}

function toggleFavorite(loc) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(loc)) {
        favorites = favorites.filter(x => x !== loc);
    } else {
        favorites.push(loc);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesBar();
}

// get weather data by location name
function fetchWeatherByLocation(location) {
    const url = `${apiurl}/forecast.json?key=${apikey}&q=${location}&days=7`

    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderWeather(data)
        })
        .catch(error => console.error('I guess something went wrong fetching the weather data. Please try again. :(', error))
}

// get data using coordinates (latitude, longitude)
function fetchWeatherByCoordinates(lat, lon) {
    const url = `${apiurl}/forecast.json?key=${apikey}&q=${lat},${lon}&days=7`

    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderWeather(data)
        })
        .catch(error => console.error('I guess something went wrong fetching the weather data. Please try again. :(', error))
}

// show weather on UI
function renderWeather(data) {
    const weatherInfo = document.getElementById('weather-info')
    const current = data.current
    const forecast = data.forecast.forecastday
    applyTheme(current.temp_c)

    // convert temp
    const temp = convertTemp(current.temp_c, current.temp_f, currentUnit);
    const feelsLike = convertTemp(current.feelslike_c, current.feelslike_f, currentUnit);
    const tempUnit = unitSymbol(currentUnit);

    // fav button logic
    const locationName = `${data.location.name}, ${data.location.region}`;
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorite = favorites.includes(data.location.name);
    const favBtnText = isFavorite ? "★ Remove Favorite" : "☆ Add to Favorites";


    weatherInfo.innerHTML = `
        <h3>Current Weather in ${locationName}</h3>
        <button id="fav-btn">${favBtnText}</button>
        <div class="big-temp-row">
            <span class="big-temp" id="temp">${temp}</span>
            <span class="big-unit">${tempUnit}</span>
        </div>
        <p>Condition: ${current.condition.text}</p>
        <img src="https:${current.condition.icon}" alt="weather-icon">
        <div class="extra-details">
            <span title="Feels like">${weatherIcons.feelslike} Feels like: ${feelsLike}${tempUnit}</span>
            <span title="Humidity">${weatherIcons.humidity} Humidity: ${current.humidity}%</span>
            <span title="Wind">${weatherIcons.wind} Wind: ${current.wind_kph} km/h</span>
        </div>
        <div>
            <b>7-day forecast:</b>
        </div>
    `;

    forecast.forEach(day => {
        const dTemp = convertTemp(day.day.avgtemp_c, day.day.avgtemp_f, currentUnit);
        weatherInfo.innerHTML += `
            <div>
                <p>${day.date}: ${day.day.avgtemp_c}°C - ${day.day.condition.text}</p>
                <img src="https:${day.day.condition.icon}" alt="forecast-icon">
            </div>
        `;
    });

    // hourly forecast row
    weatherInfo.innerHTML += `<div><b>Next 24 hours:</b></div><div id="hourly-forecast" class="forecast-row"></div>`;

    // add event to favorite button
    setTimeout(() => {
        document.getElementById("fav-btn").onclick = () => {
            toggleFavorite(data.location.name);
            renderWeather(currentWeatherData);
        };
    }, 10);

    // ender hourly
    renderHourly(data);
    updateFavoritesBar();
}

// background color based on temperature
// cold < 10°C, warm 10°C - 25°C, hot >
function applyTheme(tempC) {
    const body = document.body

    if (tempC < 10) {
        body.classList.add('cold')
    } else if (tempC > 25) {
        body.classList.add('hot')
    } else {
        body.classList.add('warm')
    }
}

// helper functions

function convertTemp(c, f, unit) {
    if (unit === 'C') return Math.round(c);
    if (unit === 'F') return Math.round(f);
    if (unit === 'K') return Math.round(c + 273.15);
}
function unitSymbol(unit) {
    if (unit === 'C') return '°C';
    if (unit === 'F') return '°F';
    if (unit === 'K') return 'K';
}

function renderHourly(data) {
    const forecastDay = data.forecast.forecastday[0];
    const hours = forecastDay.hour;
    const hourlyDiv = document.getElementById('hourly-forecast');
    if (!hourlyDiv) return;
    hourlyDiv.innerHTML = '';
    hours.forEach(hr => {
        const hTemp = convertTemp(hr.temp_c, hr.temp_f, currentUnit);
        hourlyDiv.innerHTML += `
            <div class="forecast-card">
                <p><b>${hr.time.split(' ')[1]}</b></p>
                <img src="https:${hr.condition.icon}" alt="icon">
                <p>${hTemp}${unitSymbol(currentUnit)}</p>
                <p style="font-size:12px;">${hr.condition.text}</p>
            </div>
        `;
    });
}