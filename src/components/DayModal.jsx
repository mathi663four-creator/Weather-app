function toLocalTime(unix, tz) {
  if (!unix || !tz) return '--';
  const d = new Date((unix + tz) * 1000);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export default function DayModal({ data, onClose }) {
  if (!data) return null;

  const sunrise = toLocalTime(data.sunrise, data.timezone);
  const sunset  = toLocalTime(data.sunset,  data.timezone);

  const stats = [
    { icon: '🌡️', label: 'Feels Like', val: data.feelsLike != null ? `${data.feelsLike}°C`              : '--', color: '#f90808' },
    { icon: '💧', label: 'Humidity',   val: data.humidity  != null ? `${data.humidity}%`                : '--', color: '#60a5fa' },
    { icon: '🌬️', label: 'Wind',       val: data.wind      != null ? `${data.wind} m/s`                 : '--', color: '#34d399' },
    { icon: '🌧️', label: 'Rain',       val: data.pop       != null ? `${Math.round(data.pop * 100)}%`   : '--', color: '#818cf8' },
  ];

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.65)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
      backdropFilter:'blur(8px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'rgba(20,10,50,0.92)', backdropFilter:'blur(30px)',
        border:'1px solid rgba(139,92,246,0.35)',
        borderRadius:28, padding:'28px 24px', textAlign:'center',
        maxWidth:340, width:'92%', color:'#fff',
        boxShadow:'0 0 60px rgba(139,92,246,0.3), 0 20px 60px rgba(0,0,0,0.5)',
      }}>

        {/* Icon */}
        <div style={{
          width:72, height:72, borderRadius:20, margin:'0 auto 10px',
          background:'rgba(139,92,246,0.2)', border:'1px solid rgba(139,92,246,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 24px rgba(139,92,246,0.4)',
        }}>
          <img src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} alt="" width={56} />
        </div>

        {/* Day & description */}
        <h2 style={{ fontWeight:800, fontSize:'1.05rem', margin:'0 0 4px' }}>{data.day}</h2>
        <p style={{ opacity:0.55, textTransform:'capitalize', fontSize:'0.85rem', margin:'0 0 12px' }}>{data.desc}</p>

        {/* Temperature */}
        <div style={{
          fontSize:'3.5rem', fontWeight:900, letterSpacing:'2px', margin:'0 0 6px',
          background:'linear-gradient(135deg,#fff,#c4b5fd)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>
          {data.temp}°<span style={{ fontSize:'1.5rem', fontWeight:300, opacity:0.6 }}>C</span>
        </div>

        {/* High / Low */}
        <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:20, fontSize:'0.88rem', fontWeight:700 }}>
          <span style={{ color:'#f90808' }}>↑ {data.tempMax}°</span>
          <span style={{ opacity:0.3 }}>|</span>
          <span style={{ color:'#60a5fa' }}>↓ {data.tempMin}°</span>
        </div>

        {/* Stat grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              padding:'10px 8px', borderRadius:14, textAlign:'center',
              background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.25)',
            }}>
              <div style={{ fontSize:'1rem', marginBottom:3 }}>{s.icon}</div>
              <div style={{ fontSize:'0.65rem', opacity:0.5, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontWeight:700, fontSize:'0.85rem', color:s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Sunrise & Sunset */}
        <div style={{
          display:'flex', justifyContent:'space-around', alignItems:'center',
          padding:'12px 16px', borderRadius:16, marginBottom:18,
          background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)',
        }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'1.4rem' }}>🌅</div>
            <div style={{ fontSize:'0.7rem', opacity:0.5, marginBottom:2 }}>Sunrise</div>
            <div style={{ fontWeight:800, fontSize:'0.92rem', color:'#fb923c' }}>{sunrise}</div>
          </div>

          <div style={{ width:1, height:40, background:'rgba(255,255,255,0.1)' }} />

          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'1.4rem' }}>🌇</div>
            <div style={{ fontSize:'0.7rem', opacity:0.5, marginBottom:2 }}>Sunset</div>
            <div style={{ fontWeight:800, fontSize:'0.92rem', color:'#a78bfa' }}>{sunset}</div>
          </div>
        </div>

        {/* Close button */}
        <button onClick={onClose} style={{
          width:'100%',
          background:'linear-gradient(135deg,rgba(139,92,246,0.4),rgba(99,102,241,0.3))',
          border:'1px solid rgba(139,92,246,0.5)',
          color:'#fff', borderRadius:14, padding:'11px',
          fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.93rem',
          boxShadow:'0 4px 14px rgba(139,92,246,0.3)',
        }}>Close</button>

      </div>
    </div>
  );
}