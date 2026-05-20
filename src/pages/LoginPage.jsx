import React, { useState } from 'react';

export default function LoginPage({ onEnter }) {
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    setFading(true);
    setTimeout(onEnter, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top left,#101725,#0b0f1c)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Poppins',sans-serif", color: '#ffffff', padding: 20,
      opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .login-btn:hover  { background:#005fcc !important; transform:scale(1.05); }
      `}</style>

      <div style={{
        display: 'flex', gap: 80, alignItems: 'center',
        flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1100,
      }}>
        {/* Animated left section */}
        <div style={{
          width: 300, height: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'float 6s ease-in-out infinite',
          position: 'relative',
        }}>
          <div style={{ fontSize: 200, filter: 'drop-shadow(0 20px 60px rgba(0,120,255,0.4))' }}>
            🌤️
          </div>
          {['❄️', '🌧️', '⚡', '🌈'].map((emoji, i) => (
            <div key={i} style={{
              position: 'absolute', fontSize: 32,
              top:  `${[10, 70, 20, 60][i]}%`,
              left: `${[10, 70, 60, 20][i]}%`,
              animation: `float ${4 + i}s ease-in-out ${i * 0.7}s infinite`,
              opacity: 0.55,
            }}>
              {emoji}
            </div>
          ))}
        </div>

        {/* Right content */}
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <div style={{ fontSize: 82, animation: 'fadeUp 1.2s ease', marginBottom: 8 }}>☔️</div>
          <h1 style={{
            fontSize: 44, margin: 0, animation: 'fadeUp 1.4s ease',
            background: 'linear-gradient(135deg,#ffffff,#93c5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Weather Finder
          </h1>
          <p style={{ marginTop: 8, color: '#94a3b8', fontSize: 18, animation: 'fadeUp 1.6s ease' }}>
            Get accurate forecasts instantly
          </p>
          <button
            className="login-btn"
            onClick={handleStart}
            style={{
              marginTop: 36, background: '#0078ff', border: 'none', color: '#fff',
              padding: '14px 44px', fontSize: 16, borderRadius: 30, cursor: 'pointer',
              fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.3s ease',
              animation: 'fadeUp 1.8s ease', boxShadow: '0 8px 32px rgba(0,120,255,0.4)',
            }}
          >
            Get Started
          </button>
        </div>
      </div>

      <footer style={{
        position: 'fixed', bottom: 14, width: '100%', textAlign: 'center',
        fontSize: 14, color: '#64748b', letterSpacing: '0.4px',
      }}>
        Developed by <span style={{ color: '#0078ff', fontWeight: 600 }}>Mathiyalagan</span>
      </footer>
    </div>
  );
}