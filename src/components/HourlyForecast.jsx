import React, { useState, useEffect, useRef } from 'react';

export default function HourlyForecast({ hourly, daily, onDayClick }) {
  const [sliderIdx, setSliderIdx] = useState(0);
  const [playing, setPlaying]     = useState(false);
  const playRef = useRef(null);

  useEffect(() => {
    if (playing && hourly.length) {
      playRef.current = setInterval(() => setSliderIdx(p => (p + 1) % hourly.length), 1200);
    } else clearInterval(playRef.current);
    return () => clearInterval(playRef.current);
  }, [playing, hourly.length]);

  useEffect(() => { setSliderIdx(0); setPlaying(false); }, [hourly]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Hourly strip ── */}
      <div className="glass">
        <div className="section-label">⏱ Hourly Forecast</div>

        <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          {hourly.length === 0 && (
            <div style={{ opacity: 0.35, fontSize: '0.85rem', padding: '10px 0' }}>Search a city to load forecast</div>
          )}
          {hourly.map((item, idx) => {
            const active = idx === sliderIdx;
            return (
              <div key={idx} onClick={() => setSliderIdx(idx)} style={{
                minWidth: 'clamp(54px,12vw,68px)', padding: '12px 6px',
                borderRadius: 18, textAlign: 'center', cursor: 'pointer', flexShrink: 0,
                background: active ? 'linear-gradient(135deg,rgba(139,92,246,0.5),rgba(99,102,241,0.4))' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${active ? 'rgba(139,92,246,0.8)' : 'rgba(139,92,246,0.2)'}`,
                boxShadow: active ? '0 0 20px rgba(139,92,246,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 'clamp(0.62rem,1.6vw,0.72rem)', fontWeight: 600, opacity: active ? 1 : 0.5, marginBottom: 4 }}>
                  {idx === 0 ? 'Now' : new Date(item.dt_txt).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                </div>
                <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                  alt="" width={34} height={34} style={{ display: 'block', margin: '0 auto 4px', filter: active ? 'drop-shadow(0 0 6px rgba(139,92,246,0.8))' : 'none' }} />
                <div style={{ fontWeight: 800, fontSize: 'clamp(0.85rem,2vw,0.95rem)', color: active ? '#c4b5fd' : '#fff' }}>
                  {Math.round(item.main.temp)}°
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Daily forecast ── */}
      <div className="glass">
        <div className="section-label">📅 {daily.length > 0 ? `${daily.length}-Day` : ''} Forecast</div>

        {daily.length === 0 && <div style={{ opacity: 0.35, fontSize: '0.85rem' }}>No data yet</div>}

        {daily.map((item, idx) => {
          const hi  = Math.round(item.main?.temp_max ?? item.main?.temp ?? 0);
          const lo  = Math.round(item.main?.temp_min ?? (item.main?.temp ?? 0) - 4);
          const pct = Math.round(((item.main?.temp ?? 0) - lo) / Math.max(hi - lo, 1) * 100);

          return (
            <div key={idx} className="daily-row" onClick={() => onDayClick?.(item)} style={{
              padding: 'clamp(8px,2vw,11px) 0', cursor: 'pointer',
              borderBottom: idx < daily.length - 1 ? '1px solid rgba(139,92,246,0.2)' : 'none',
              transition: 'opacity 0.15s',
            }}>
              <div style={{ width: 'clamp(38px,10vw,50px)', fontWeight: 700, fontSize: 'clamp(0.82rem,2vw,0.92rem)', flexShrink: 0, opacity: idx === 0 ? 1 : 0.75 }}>
                {idx === 0 ? 'Today' : new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>

              <div style={{ width: 'clamp(36px,9vw,46px)', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} alt="" width={28} height={28} />
                {item.pop > 0 && <div style={{ fontSize: '0.62rem', color: '#60a5fa', fontWeight: 700 }}>{Math.round(item.pop * 100)}%</div>}
              </div>

              <div style={{ width: 'clamp(26px,6vw,32px)', textAlign: 'right', fontSize: 'clamp(0.78rem,2vw,0.88rem)', color: '#60a5fa', fontWeight: 600, flexShrink: 0 }}>{lo}°</div>

              <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(139,92,246,0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: `${Math.max(0, pct - 25)}%`,
                  width: '55%', height: '100%', borderRadius: 4,
                  background: 'linear-gradient(90deg,#8b5cf6,#f59e0b)',
                }} />
              </div>

              <div style={{ width: 'clamp(26px,6vw,32px)', fontSize: 'clamp(0.78rem,2vw,0.88rem)', fontWeight: 800, color: '#f59e0b', flexShrink: 0}}>{hi}°</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}