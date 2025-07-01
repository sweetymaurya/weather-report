const API_KEY = "4897d70f9a2a4a39d3b824da01555f5a";

document.addEventListener("DOMContentLoaded", () => {
  getLocationWeather();
  document.getElementById("toggle-theme").addEventListener("click", toggleTheme);
});

function toggleTheme() {
  document.body.classList.toggle("light");
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      fetchWeatherByCoords(lat, lon);
    }, () => {
      searchCity("Asansol");
    });
  } else {
    searchCity("Asansol");
  }
}

function fetchWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      updateCurrentWeather(data);
      fetchForecast(data.name);
    });
}

function searchCity(city = null) {
  const inputCity = city || document.getElementById("cityInput").value;
  if (!inputCity) return alert("Please enter a city name!");

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) return alert("City not found!");
      updateCurrentWeather(data);
      fetchForecast(data.name);
    })
    .catch(() => alert("Error fetching data."));
}

function updateCurrentWeather(data) {
  document.getElementById("location").innerText = data.name + ", " + data.sys.country;
  document.getElementById("temperature").innerText = Math.round(data.main.temp);
  document.getElementById("description").innerText = data.weather[0].description;
  document.getElementById("humidity").innerText = data.main.humidity;
  document.getElementById("wind").innerText = data.wind.speed;
  document.getElementById("feels_like").innerText = Math.round(data.main.feels_like);

 // document.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${data.weather[0].main},weather')`;
const currentHour = new Date().getHours();
const isDay = currentHour >= 6 && currentHour < 18; // Between 6 AM and 6 PM
const backgroundImage = isDay ? "morning.jpeg" : "night.jpeg";
//const hour = new Date().getHours();
//let backgroundImage = "";



document.body.style.backgroundImage = `url('${backgroundImage}')`;

}

function fetchForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      updateDailyForecast(data);
      updateHourlyForecast(data.list.slice(0, 6)); // next 18 hours
    });
}

function updateDailyForecast(data) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  const days = {};
  data.list.forEach(entry => {
    const date = entry.dt_txt.split(" ")[0];
    if (!days[date]) days[date] = [];
    days[date].push(entry);
  });

  const dates = Object.keys(days).slice(0, 5);
  dates.forEach(date => {
    const entries = days[date];
    const avgTemp = Math.round(entries.reduce((sum, e) => sum + e.main.temp, 0) / entries.length);
    const icon = entries[0].weather[0].icon;
    const description = entries[0].weather[0].description;

    forecastContainer.innerHTML += `
      <div class="forecast-card">
        <h4>${new Date(date).toDateString()}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
        <p>${avgTemp}°C</p>
        <small>${description}</small>
      </div>`;
  });
}

function updateHourlyForecast(hourData) {
  const hourlyContainer = document.getElementById("hourly");
  hourlyContainer.innerHTML = "<h3>Next Hours</h3>";

  hourData.forEach(hour => {
    const time = new Date(hour.dt_txt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const icon = hour.weather[0].icon;
    hourlyContainer.innerHTML += `
      <div class="hour-card">
        <p>${time}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
        <p>${Math.round(hour.main.temp)}°C</p>
      </div>`;
  });
}
