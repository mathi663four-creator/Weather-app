import { useState, useCallback } from 'react';
import {
  fetchWeatherByCity,
  fetchWeatherByCoords,
  fetchForecastByCity,
  fetchForecastByCoords,
  fetchMeteoChart,
  fetchAirQuality,
} from '../utils/api';
import {
  getAiInsight,
  getMoodAdvice,
  calcBreathingScore,
  estimateUV,
} from '../utils/weatherHelpers';
import {
  setLastCity,
  setLatestWeather,
  getReminder,
  clearReminder,
} from '../utils/storage';

export function useWeather(toast) {
  const [weather, setWeather]           = useState(null);
  const [forecast, setForecast]         = useState(null);
  const [hourly, setHourly]             = useState([]);
  const [daily, setDaily]               = useState([]);
  const [chartData, setChartData]       = useState(null);
  const [aiInsight, setAiInsight]       = useState('Smart weather insight will appear here.');
  const [moodMsg, setMoodMsg]           = useState('Activity & mood suggestions here.');
  const [updatedLabel, setUpdatedLabel] = useState('Last update: --');
  const [tzOffset, setTzOffset]         = useState(5.5 * 3600);
  const [dashboard, setDashboard]       = useState(null);
  const [breathingScore, setBreathingScore] = useState(null);
  const [loading, setLoading]           = useState(false);

  /** Core processing after weather + forecast fetched */
  const processWeather = useCallback(async (data, fc) => {
    setWeather(data);
    setTzOffset(data.timezone ?? 5.5 * 3600);
    setLastCity(data.name);
    setLatestWeather({
      temp:      data.main.temp,
      condition: data.weather[0].main,
      humidity:  data.main.humidity,
    });
    setUpdatedLabel(
      'Last update: ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    setAiInsight(getAiInsight(data));
    setMoodMsg(getMoodAdvice(data.weather[0].description, data.main.temp));

    // Forecast state
    setForecast(fc);
    setHourly(fc.list.slice(0, 12));
    setDaily(fc.list.filter(i => i.dt_txt.includes('12:00:00')).slice(0, 5));

    // Dashboard bars
    const uv = estimateUV(data.weather[0].main);
    setDashboard({
      temp:     data.main.temp,
      humidity: data.main.humidity,
      wind:     data.wind.speed,
      uv,
      clouds:   data.clouds?.all ?? 0,
      vis:      (data.visibility ?? 0) / 1000,
    });

    // Meteo chart (non-blocking)
    fetchMeteoChart(data.coord.lat, data.coord.lon)
      .then(setChartData)
      .catch(() => {});

    // Air quality + breathing comfort (non-blocking)
    fetchAirQuality(data.coord.lat, data.coord.lon)
      .then(aqi => setBreathingScore(calcBreathingScore(
        data.main.temp, data.main.humidity, data.wind.speed, aqi
      )))
      .catch(() => setBreathingScore(null));

    // Smart notifications
    checkNotifications(data.name, fc, toast);
  }, [toast]);

  /** Load by city name */
  const loadByCity = useCallback(async (city) => {
    if (!city) return;
    setLoading(true);
    try {
      const data = await fetchWeatherByCity(city);
      const fc   = await fetchForecastByCity(city);
      await processWeather(data, fc);
      toast.showSuccess('Loaded', `Weather for ${data.name}`);
    } catch (err) {
      toast.showError('Fetch Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [processWeather, toast]);

  /** Load by GPS coords */
  const loadByCoords = useCallback(async (lat, lon) => {
    setLoading(true);
    try {
      const data = await fetchWeatherByCoords(lat, lon);
      const fc   = await fetchForecastByCoords(lat, lon);
      await processWeather(data, fc);
      toast.showSuccess('Location', `Weather for ${data.name}`);
    } catch (err) {
      toast.showError('Fetch Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [processWeather, toast]);

  return {
    weather, forecast, hourly, daily, chartData,
    aiInsight, moodMsg, updatedLabel, tzOffset,
    dashboard, breathingScore, loading,
    loadByCity, loadByCoords,
  };
}

/** ── Smart notifications (alerts + reminders) ───────────────────────────── */
function checkNotifications(city, fc, toast) {
  if (!fc?.list) return;
  const next = fc.list.slice(0, 3);
  const hasRain  = next.some(i => i.weather[0].description.toLowerCase().includes('rain'));
  const hasStorm = next.some(i => i.weather[0].description.toLowerCase().includes('storm'));
  const hasSnow  = next.some(i => i.weather[0].description.toLowerCase().includes('snow'));
  const tempDrop = fc.list[0].main.temp - fc.list[2].main.temp > 5;

  if (hasStorm)      toast.showWarning('⚡ Storm Alert', 'Thunderstorm expected soon! Stay indoors.');
  else if (hasRain)  toast.showWarning('🌧️ Rain Alert', "Rain expected soon — don't forget your umbrella!");
  else if (hasSnow)  toast.showWarning('❄️ Snow Alert', 'Snowfall likely — drive carefully!');
  else if (tempDrop) toast.showWarning('🌡️ Temp Drop', 'Rapid temperature drop ahead — dress warmly!');

  // Smart reminder matching
  const reminder = getReminder();
  if (reminder) {
    const currentTemp = fc.list?.[0]?.main?.temp ?? null;
    const matched =
      (reminder === 'rain'  && hasRain)  ||
      (reminder === 'storm' && hasStorm) ||
      (reminder === 'snow'  && hasSnow)  ||
      (reminder === 'hot'   && currentTemp > 33) ||
      (reminder === 'cold'  && currentTemp < 10);

    if (matched) {
      const labels = { rain: 'Rain Alert', storm: 'Storm Alert', snow: 'Snow Alert', hot: 'High Temperature', cold: 'Low Temperature' };
      toast.showInfo('Smart Reminder', `Your "${labels[reminder]}" reminder triggered for ${city}.`);
      clearReminder();
    }
  }
}

