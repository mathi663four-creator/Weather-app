import React, { useState, useEffect } from 'react';
import Header            from '../components/Header';
import WeatherCard       from '../components/WeatherCard';
import HourlyForecast    from '../components/HourlyForecast';
import DashboardBars     from '../components/DashboardBars';
import WeatherChart      from '../components/WeatherChart';
import Favorites         from '../components/Favorites';
import SmartReminder     from '../components/SmartReminder';
import DayModal          from '../components/DayModal';
import { useWeather }    from '../hooks/useWeather';
import { getTheme, saveTheme, getLastCity } from '../utils/storage';

export default function DashboardPage({ onMenu, toast }) {
  const [darkMode,  setDarkMode]  = useState(() => getTheme() === 'dark');
  const [modalData, setModalData] = useState(null);

  const {
    weather, hourly, daily, chartData,
    aiInsight, moodMsg, tzOffset,
    dashboard, breathingScore, loading,
    loadByCity, loadByCoords,
  } = useWeather(toast);

  const BG = darkMode
    ? 'linear-gradient(135deg,#0a0a1a 0%,#0d0b2e 50%,#1a0a2e 100%)'
    : 'linear-gradient(135deg,#1a0a3e 0%,#2d1b69 25%,#3d2b8a 50%,#1e1b4b 75%,#0f0a2e 100%)';

  useEffect(() => {
    document.body.style.background = BG;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.color = '#fff';
  }, []);

  useEffect(() => { saveTheme(darkMode ? 'dark' : 'light'); }, [darkMode]);
                                                                                                                                                                                                                                                                                                                                                                                              
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => loadByCoords(pos.coords.latitude, pos.coords.longitude),
        ()  => loadByCity(getLastCity())
      );
    } else loadByCity(getLastCity());
  }, []); // eslint-disable-line

  const handleLocation = () => {
    if (!navigator.geolocation) { toast.showError('Geolocation', 'Not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => loadByCoords(pos.coords.latitude, pos.coords.longitude),
      ()  => toast.showInfo('Location', 'Allow location access or search manually.')
    );
  };

  const handleDayClick = item => setModalData({
    day:      new Date(item.dt_txt).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }),
    icon:     item.weather[0].icon,
    temp:     Math.round(item.main.temp),
    tempMin:  Math.round(item.main.temp_min ?? item.main.temp),
    tempMax:  Math.round(item.main.temp_max ?? item.main.temp),
    desc:     item.weather[0].description,
    humidity: item.main.humidity,
    wind:     item.wind?.speed ?? 0,
    feelsLike: Math.round(item.main.feels_like ?? item.main.temp),
    pop:      item.pop ?? 0,
    sunrise:  weather?.sys?.sunrise,
    sunset:   weather?.sys?.sunset,
    timezone: weather?.timezone,
  });

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", minHeight:'100vh', background:BG, backgroundAttachment:'fixed', color:'#fff', position:'relative' }}>

      {/* Ambient orbs */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:600, height:600, top:'-15%', right:'-10%', borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute', width:400, height:400, bottom:'-5%', left:'-5%',  borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)' }} />
      </div>

      {/* Animated weather canvas — add AnimatedBackground.jsx to components to enable */}

      {/* Content */}
      <div style={{ position:'relative', zIndex:1 }}>
        <div className="dash-wrap">

          <Header
            onSearch={loadByCity} onLocation={handleLocation}
            onMenu={onMenu} onThemeToggle={() => setDarkMode(d => !d)}
            darkMode={darkMode} tzOffset={tzOffset}
          />

          {loading && (
            <div style={{ textAlign:'center', padding:14, fontWeight:600, opacity:0.5, fontSize:'0.88rem', letterSpacing:1 }}>
              ⏳ FETCHING WEATHER…
            </div>
          )}

          <div className="dash-layout">

            {/* Left */}
            <div className="dash-left">
              <WeatherCard
                weather={weather}
                displayTemp={weather ? Math.round(weather.main.temp) : undefined}
                displayDesc={weather?.weather?.[0]?.description}
                aiInsight={aiInsight} forecast={daily}
              />
              {moodMsg && (
                <div className="glass">
                  <div className="section-label">💬 Suggestion</div>
                  <div style={{ fontSize:'clamp(0.88rem,2.2vw,0.97rem)', fontWeight:500, lineHeight:1.6, opacity:0.85 }}>{moodMsg}</div>
                </div>
              )}
              <HourlyForecast hourly={hourly} daily={daily} onDayClick={handleDayClick} />

            </div>

            {/* Right */}
            <div className="dash-right">
              <DashboardBars dashboard={dashboard} breathingScore={breathingScore} />
              <WeatherChart  chartData={chartData} />
              <Favorites     currentCity={weather?.name} onSelect={loadByCity} toast={toast} />
              <SmartReminder toast={toast} weatherData={weather ? {
                city: weather.name, temperature:`${Math.round(weather.main.temp)}°C`,
                description: weather.weather[0].description,
                humidity:`${weather.main.humidity}%`, wind:`${weather.wind.speed} m/s`,
              } : null} />
            </div>

          </div>
        </div>
      </div>

      <DayModal data={modalData} onClose={() => setModalData(null)} />
    </div>
  );
}