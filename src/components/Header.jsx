import React, { useState } from 'react';
import { useClock } from '../hooks/useClock';

export default function Header({ onSearch, onLocation, onMenu, onThemeToggle, darkMode, tzOffset }) {
  const [city, setCity] = useState('');
  const clock = useClock(tzOffset);

  const doSearch = () => { const c = city.trim(); if (c) { onSearch(c); setCity(''); } };

  const iconBtn = (label, fn, title='') => (
    <button onClick={fn} title={title} style={{
      background: 'rgba(139,92,246,0.20)',
      border: '1px solid rgba(139,92,246,0.35)',
      borderRadius: 12, padding: '8px 11px',
      cursor: 'pointer', fontSize: '1rem',
      color: '#fff', transition: 'all 0.2s',
      flexShrink: 0, lineHeight: 1,
    }}>{label}</button>
  );

  return (
    <div className="glass" style={{ padding: '10px 14px' }}>

      {/* ── Row 1: Logo + Clock + Controls ── */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>

        {/* Logo */}
        <div style={{
          width:34, height:34, borderRadius:10, flexShrink:0,
          background:'linear-gradient(135deg,#8b5cf6,#6366f1)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1rem', boxShadow:'0 0 14px rgba(139,92,246,0.5)',
        }}>🌤️</div>

        {/* App name — hidden on very small screens */}
        <span style={{
          fontWeight:800, fontSize:'0.95rem', letterSpacing:'-0.3px',
          whiteSpace:'nowrap', display:'var(--logo-display, block)',
        }}>Weather Finder</span>

        {/* Spacer */}
        <div style={{ flex:1 }} />

        {/* Clock */}
        <div style={{
          fontFamily:"'Space Mono',monospace",
          textAlign:'right', lineHeight:1.3, flexShrink:0,
        }}>
          <div style={{ fontWeight:700, fontSize:'clamp(0.75rem,2.5vw,0.88rem)', whiteSpace:'nowrap', color:'#fff' }}>
            {clock.time}
          </div>
          <div style={{ fontSize:'clamp(0.6rem,1.8vw,0.65rem)', opacity:0.5, whiteSpace:'nowrap' }}>
            {clock.date}
          </div>
        </div>

        {/* Icon buttons */}
        {iconBtn(darkMode ? '☀️' : '🌙', onThemeToggle, 'Toggle Theme')}
        {iconBtn('☰', onMenu, 'Menu')}
      </div>

      {/* ── Row 2: Search (always full width) ── */}
      <div style={{ display:'flex', gap:8 }}>
        <div style={{
          flex:1, display:'flex', alignItems:'center',
          background:'rgba(139,92,246,0.20)', borderRadius:12,
          border:'1px solid rgba(139,92,246,0.35)', padding:'0 12px', gap:8,
        }}>
          <span style={{ opacity:0.5, fontSize:'0.88rem', flexShrink:0 }}>🔍</span>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyUp={e => e.key === 'Enter' && doSearch()}
            placeholder="Search city..."
            style={{
              flex:1, border:'none', background:'transparent', color:'#fff',
              outline:'none', fontFamily:'inherit',
              fontSize:'clamp(0.85rem,2.5vw,0.93rem)',
              padding:'10px 0', minWidth:0,
            }}
          />
          {iconBtn('📍', onLocation, 'current Location')}
          <button onClick={doSearch} style={{
          background:'linear-gradient(135deg,#8b5cf6,#6366f1)',
          border:'none', borderRadius:12,
          padding:'10px clamp(12px,3vw,20px)',
          fontWeight:700, fontFamily:'inherit',
          fontSize:'clamp(0.82rem,2.5vw,0.88rem)',
          color:'#fff', cursor:'pointer', whiteSpace:'nowrap',
          boxShadow:'0 4px 14px rgba(139,92,246,0.4)',
          flexShrink:0,
        }}>Search</button>
        </div>
        
      </div>

    </div>
  );
}