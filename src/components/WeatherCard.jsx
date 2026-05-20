// Convert Unix timestamp + timezone offset to local time string
function toLocalTime(unixTimestamp, timezoneOffset) {
  const utcMs = unixTimestamp * 1000;
  const localMs = utcMs + timezoneOffset * 1000;
  const d = new Date(localMs);
  return d.toUTCString().slice(17, 22); // extracts HH:MM
}

export default function WeatherCard({ weather, displayTemp, displayDesc, aiInsight, forecast }) {
  const high = forecast?.length ? Math.max(...forecast.map(d => d.main?.temp_max ?? d.main?.temp ?? 0)) : null;
  const low  = forecast?.length ? Math.min(...forecast.map(d => d.main?.temp_min ?? d.main?.temp ?? 0)) : null;

  // Sunrise & Sunset from OpenWeatherMap
  const sunrise = weather?.sys?.sunrise
    ? toLocalTime(weather.sys.sunrise, weather.timezone)
    : null;
  const sunset = weather?.sys?.sunset
    ? toLocalTime(weather.sys.sunset, weather.timezone)
    : null;

  // Calculate day progress percentage for the sun arc
  const now = Math.floor(Date.now() / 1000);
  const totalDay  = weather ? weather.sys.sunset - weather.sys.sunrise : 0;
  const elapsed   = weather ? Math.min(Math.max(now - weather.sys.sunrise, 0), totalDay) : 0;
  const sunPct    = totalDay > 0 ? (elapsed / totalDay) * 100 : 0;
  const isDaytime = weather ? (now >= weather.sys.sunrise && now <= weather.sys.sunset) : true;

  const stats = weather ? [
    { icon: '🌡️', label: 'Feels Like', val: `${Math.round(weather.main.feels_like)}°`,        color: '#f90808' },
    { icon: '💧', label: 'Humidity',   val: `${weather.main.humidity} %`,                      color: '#60a5fa' },
    { icon: '🌬️', label: 'Wind',       val: `${weather.wind.speed} m/s`,                      color: '#34d399' },
    { icon: '👁️', label: 'Visibility', val: `${((weather.visibility||0)/1000).toFixed(1)} km`, color: '#facc15' },
  ] : [];

  return (
    <div className="glow-card" style={{ padding: 'clamp(20px,4vw,36px)' }}>

      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div>
          <div className="neon-tag" style={{ marginBottom:10 }}>
            <span>📍</span> Live Weather
          </div>
          <div style={{ fontSize:'clamp(1.4rem,4vw,2rem)', fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>
            {weather?.name || 'Search a city'}
          </div>
          {weather && <div style={{ fontSize:'0.82rem', opacity:0.5, marginTop:4 }}>{weather.sys?.country || ''}</div>}
        </div>
        {weather && (
          <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="" width={80} height={80}
            style={{ filter:'drop-shadow(0 0 12px rgb(246, 254, 3))', marginTop:-8 }} />
        )}
      </div>

      {/* Temperature */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:4, margin:'8px 0 4px' }}>
        <span style={{
          fontSize:'clamp(5rem,16vw,8rem)', fontWeight:900,
          lineHeight:0.9,
          background:'linear-gradient(135deg,#fff 40%,#c4b5fd)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>
          {displayTemp !== undefined ? displayTemp : '--'}
        </span>
        <span style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:300, opacity:0.6, marginTop:12 }}>°C</span>
      </div>

      {/* Description + H/L */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div style={{ fontSize:'clamp(1rem,2.5vw,1.2rem)', fontWeight:500, opacity:0.85, textTransform:'capitalize' }}>
          {displayDesc || '--'}
        </div>
        {high !== null && low !== null && (
          <div style={{
            display:'flex', gap:10, fontSize:'0.9rem', fontWeight:600,
            background:'rgba(139,92,246,0.2)', borderRadius:20,
            padding:'5px 14px', border:'1px solid rgba(139,92,246,0.35)',
          }}>
            <span style={{ color:'#f90808' }}>↑{Math.round(high)}°</span>
            <span style={{ opacity:0.3 }}>|</span>
            <span style={{ color:'#60a5fa' }}>↓{Math.round(low)}°</span>
          </div>
        )}
      </div>

      {/* ── Sunrise & Sunset ── */}
      {weather && sunrise && sunset && (
        <div style={{ marginTop:25 }}>

          {/* Sun arc track */}
          <div style={{ position:'relative', height:64, marginBottom:8 }}>

            {/* Arc SVG */}
            <svg viewBox="0 0 200 60" style={{ width:'100%', height:'100%', overflow:'visible' }}>
              {/* Background arc */}
              <path
                d="M 10 55 Q 100 -10 190 55"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Progress arc */}
              <path
                d="M 10 55 Q 100 -10 190 55"
                fill="none"
                stroke="url(#sunGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset={220 - (sunPct / 100) * 220}
                style={{ transition:'stroke-dashoffset 1s ease' }}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#f97316" />
                  <stop offset="50%"  stopColor="#facc15" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              {/* Sun dot on arc */}
              {isDaytime && (
                <circle
                  cx={10 + (sunPct / 100) * 180}
                  cy={55 - Math.sin((sunPct / 100) * Math.PI) * 65}
                  r="5"
                  fill="#facc15"
                  style={{ filter:'drop-shadow(0 0 6px #facc15)' }}
                />
              )}
            </svg>

            {/* Sunrise label */}
            <div style={{
              position:'absolute', bottom:0, left:0,
              textAlign:'center', fontSize:'0.72rem',
            }}>
              <div style={{ fontSize:'2rem' }}>🌅</div>
              <div style={{ fontWeight:700,fontSize:'0.99rem' ,color:'#fb923c' }}>{sunrise}</div>
              <div style={{ opacity:0.5, fontSize:'0.99rem' }}>Sunrise</div>
            </div>

            {/* Sunset label */}
            <div style={{
              position:'absolute', bottom:0, right:0,
              textAlign:'center', fontSize:'0.72rem',
            }}>
              <div style={{ fontSize:'2rem' }}>🌇</div>
              <div style={{ fontWeight:700,fontSize:'0.99rem' ,color:'#a78bfa' }}>{sunset}</div>
              <div style={{ opacity:0.5, fontSize:'0.99rem' }}>Sunset</div>
            </div>

            {/* Daytime duration in center */}
            <div style={{
              position:'absolute', bottom:0, left:'50%',
              transform:'translateX(-50%)',
              textAlign:'center', fontSize:'0.68rem', opacity:0.6,
              whiteSpace:'nowrap',
            }}>
              {totalDay > 0 ? `☀️ ${Math.floor(totalDay/3600)}h ${Math.floor((totalDay%3600)/60)}m daylight` : ''}
            </div>

          </div>

          {/* Daytime / Nighttime indicator */}
          <div style={{
            textAlign:'center', fontSize:'0.75rem', fontWeight:600,
            padding:'5px 12px', borderRadius:20, display:'inline-flex',
            alignItems:'center', gap:6, marginBottom:4,
            background: isDaytime ? 'rgba(250,204,21,0.15)' : 'rgba(139,92,246,0.2)',
            border: `1px solid ${isDaytime ? 'rgba(250,204,21,0.3)' : 'rgba(139,92,246,0.4)'}`,
            color: isDaytime ? '#facc15' : '#c4b5fd',
          }}>
            {isDaytime ? '☀️ Daytime' : '🌙 Nighttime'}
          </div>

        </div>
      )}

      {/* AI insight */}
      {aiInsight && (
        <div style={{
          marginTop:16, padding:'10px 16px', borderRadius:16,
          background:'rgba(139,92,246,0.2)', border:'1px solid rgba(139,92,246,0.4)',
          fontSize:'0.85rem', fontWeight:500, lineHeight:1.5,
          display:'flex', alignItems:'center', gap:8,
        }}>
          <span style={{ fontSize:'1rem' }}>✨</span> {aiInsight}
        </div>
      )}

      {/* Stat chips */}
      {weather && (
        <div className="stat-strip">
          {stats.map(s => (
            <div key={s.label} className="stat-chip" style={{
              padding:'clamp(10px,2vw,14px) 10px', borderRadius:18, textAlign:'center',
              background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)',
              transition:'all 0.2s',
            }}>
              <div style={{ fontSize:'1.1rem', marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:'clamp(0.7rem,1.5vw,0.78rem)', opacity:0.5, marginBottom:3 }}>{s.label}</div>
              <div style={{ fontWeight:700, fontSize:'clamp(0.82rem,2vw,0.9rem)', color:s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}