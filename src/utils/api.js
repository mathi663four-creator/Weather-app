import { OPENWEATHER_API, WEATHER_URL, FORECAST_URL, METEO_URL } from './constants';

/** Fetch with abort timeout */
export async function safeFetch(url, options = {}, timeout = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/** Current weather by city name */
export async function fetchWeatherByCity(city) {
  const res = await safeFetch(`${WEATHER_URL}&q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API}`);
  const data = await res.json();
  if (data.cod && data.cod !== 200) throw new Error(data.message || 'City not found');
  return data;
}

/** Current weather by coordinates */
export async function fetchWeatherByCoords(lat, lon) {
  const res = await safeFetch(`${WEATHER_URL}&lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API}`);
  const data = await res.json();
  if (data.cod && data.cod !== 200) throw new Error(data.message || 'Location error');
  return data;
}

/** 5-day / 3-hour forecast by city */
export async function fetchForecastByCity(city) {
  const res = await safeFetch(`${FORECAST_URL}&q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API}`);
  return res.json();
}

/** 5-day / 3-hour forecast by coords */
export async function fetchForecastByCoords(lat, lon) {
  const res = await safeFetch(`${FORECAST_URL}&lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API}`);
  return res.json();
}

/** Hourly temperature + humidity from Open-Meteo */
export async function fetchMeteoChart(lat, lon) {
  const res = await safeFetch(
    `${METEO_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m&timezone=auto`
  );
  const data = await res.json();
  return {
    labels: (data.hourly.time || []).slice(0, 24).map(t => new Date(t).getHours() + ':00'),
    temps:  (data.hourly.temperature_2m || []).slice(0, 24),
    hums:   (data.hourly.relative_humidity_2m || []).slice(0, 24),
  };
}

/** Air quality index */
export async function fetchAirQuality(lat, lon) {
  const res = await safeFetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API}`
  );
  const data = await res.json();
  return data.list?.[0]?.main?.aqi ?? 3;
}

/** Upcoming rain check for a city (returns { rainExpected, humAvg }) */
export async function fetchRainAdvice(city) {
  const res = await safeFetch(`${FORECAST_URL}&q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API}`);
  const data = await res.json();
  const next = data.list.slice(0, 8);
  const rainExpected = next.some(i => i.weather[0].description.toLowerCase().includes('rain'));
  const humAvg = next.reduce((a, b) => a + b.main.humidity, 0) / next.length;
  return { rainExpected, humAvg };
}

/** Lifestyle plan from next 24h forecast */
export async function fetchLifestylePlan(city) {
  const res = await safeFetch(`${FORECAST_URL}&q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API}`);
  const data = await res.json();
  const list = data.list.slice(0, 8);

  let bestExercise = null;
  let bestPhoto = null;
  const rainHours = [];

  list.forEach(i => {
    const hour = new Date(i.dt_txt).getHours();
    const temp = i.main.temp;
    const desc = i.weather[0].description.toLowerCase();
    if (!bestExercise && temp >= 18 && temp <= 26 && !desc.includes('rain')) bestExercise = hour;
    if (!bestPhoto && hour >= 17 && hour <= 18 && desc.includes('clear')) bestPhoto = hour;
    if (desc.includes('rain')) rainHours.push(hour);
  });

  return { bestExercise, bestPhoto, rainHours };
}