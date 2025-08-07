import { API_KEY } from './config.js';

const villeDefaut = 'Bruxelles';

const villeElement = document.getElementById('ville');
const tempElement = document.getElementById('temperature_label');
const descriptionElement = document.getElementById('description');
const iconElement = document.getElementById('icon');
const weatherInfo = document.getElementById('weatherInfo');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

// Variable pour stocker la position géolocalisée
let geoPosition = null;

function isValidCityName(city) {
  return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(city);
}

// Fonction pour déclencher météo selon géoloc ou défaut
function fetchWeatherByGeoOrDefault() {
  if (geoPosition) {
    fetchWeatherByCoords(geoPosition.latitude, geoPosition.longitude);
  } else {
    fetchWeatherByCity(villeDefaut);
  }
}

// Gestion clic rechercher
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();

  if (!city) {
    fetchWeatherByGeoOrDefault();
  } else {
    if (!isValidCityName(city)) {
      showError("Nom de ville invalide. Veuillez corriger la saisie.");
      return;
    }
    fetchWeatherByCity(city);
  }
});

// Gestion touche Entrée
cityInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    searchBtn.click();
  }
});

// Sur changement de l'input, affiche/masque bouton effacer,
// et si champ vide, recharge météo géoloc ou défaut automatiquement
cityInput.addEventListener('input', () => {
  clearBtn.style.display = cityInput.value ? 'block' : 'none';

  if (!cityInput.value) {
    fetchWeatherByGeoOrDefault();
  }
});

// Bouton effacer vide le champ et masque bouton
clearBtn.addEventListener('click', () => {
  cityInput.value = '';
  clearBtn.style.display = 'none';
  clearError();
  fetchWeatherByGeoOrDefault();
  cityInput.focus();
});

// Les fonctions fetch / affichage météo, erreurs, loading restent inchangées

async function fetchWeatherByCoords(lat, lon) {
  showLoading();
  clearError();
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
    );
    if (!response.ok) throw new Error('Erreur lors de la récupération des données météo.');
    const data = await response.json();
    showWeather(data);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

async function fetchWeatherByCity(city) {
  if (!city) return;
  if (!isValidCityName(city)) {
    showError("Nom de ville invalide. Veuillez corriger la saisie.");
    return;
  }
  showLoading();
  clearError();
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=fr`
    );
    if (!response.ok) throw new Error('Ville introuvable, veuillez vérifier le nom.');
    const data = await response.json();
    showWeather(data);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Fonctions d'affichage de la météo, erreurs et loading (showWeather, showError...)

function showWeather(data) {
  villeElement.textContent = data.name;
  tempElement.textContent = Math.round(data.main.temp);
  descriptionElement.textContent = capitalizeFirstLetter(data.weather[0].description);
  iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  iconElement.alt = data.weather[0].description;
  weatherInfo.classList.remove('hidden');
}

function showLoading() {
  loadingElement.style.display = 'block';
  weatherInfo.classList.add('hidden');
  errorElement.classList.add('hidden');
}

function hideLoading() {
  loadingElement.style.display = 'none';
}

function showError(message) {
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  weatherInfo.classList.add('hidden');
}

function clearError() {
  errorElement.textContent = '';
  errorElement.classList.add('hidden');
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialisation : récupération géoloc et stockage position ou défaut
function init() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        geoPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        fetchWeatherByCoords(geoPosition.latitude, geoPosition.longitude);
      },
      () => {
        geoPosition = null;
        fetchWeatherByCity(villeDefaut);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  } else {
    geoPosition = null;
    fetchWeatherByCity(villeDefaut);
  }
}

init();
