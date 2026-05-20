import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { getLastCity, getLastNotif, saveLastNotif } from '../utils/storage';
import { OPENWEATHER_API, FORECAST_URL } from '../utils/constants';

const EMAILJS_CONFIG = {
  SERVICE_ID:  'service_ln6ucm5',
  TEMPLATE_ID: 'template_5vfrbj7',
  PUBLIC_KEY:  'gbD5HRgms1xCyvv1o',
};

const CHECK_INTERVAL_MS      = 30 * 60 * 1000; // 30 minutes
const COOLDOWN_MS            = 3  * 60 * 60 * 1000; // 3 hours
const SW_PATH                = '/service-worker.js';

function canSendAlert(type) {
  const last = getLastNotif();
  if (!last[type]) return true;
  return Date.now() - last[type] > COOLDOWN_MS;
}
function markAlertSent(type) {
  const last = getLastNotif();
  last[type] = Date.now();
  saveLastNotif(last);
}

export default function SmartReminder({ toast, weatherData }) {
  const [email,         setEmail]         = useState(() => localStorage.getItem('wf_alert_email')    || '');
  const [heatLimit,     setHeatLimit]     = useState(() => parseInt(localStorage.getItem('wf_heat_limit'))     || 38);
  const [humidityLimit, setHumidityLimit] = useState(() => parseInt(localStorage.getItem('wf_humidity_limit')) || 80);
  const [monitoring,    setMonitoring]    = useState(false);
  const [swSupported,   setSwSupported]   = useState(false);
  const [swActive,      setSwActive]      = useState(false);
  const [testing,       setTesting]       = useState(false);
  const [lastCheck,     setLastCheck]     = useState('');
  const [nextCheck,     setNextCheck]     = useState('');
  const [log,           setLog]           = useState([]);

  const intervalRef = useRef(null);
  const swRef       = useRef(null);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLog(prev => [`[${time}] ${msg}`, ...prev].slice(0, 5));
  };

  // ── Check Service Worker support on mount ──
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setSwSupported(true);
      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, msg } = event.data;
        if (type === 'SW_LOG') {
          addLog(msg);
          const time = new Date().toLocaleTimeString();
          setLastCheck(time);
          const next = new Date(Date.now() + CHECK_INTERVAL_MS);
          setNextCheck(next.toLocaleTimeString());
        }
      });
      
      // Check if SW is already active
      navigator.serviceWorker.getRegistration(SW_PATH).then(reg => {
        if (reg) setSwActive(true);
      });
    }
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line

  // ── Fetch live weather (used in fallback mode) ──
  const fetchWeather = async () => {
    const city = getLastCity();
    const res  = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API}`
    );
    return res.json();
  };

  // ── Send email (used in fallback mode) ──
  const doSend = async (toEmail, alertLabel, w) => {
    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        to_email:    toEmail,
        condition:   alertLabel,
        city:        w?.name                             || getLastCity(),
        temperature: w ? `${Math.round(w.main.temp)}°C` : '--',
        humidity:    w ? `${w.main.humidity}%`           : '--',
        wind:        w ? `${w.wind.speed} m/s`           : '--',
        description: w?.weather?.[0]?.description        || '--',
        time:        new Date().toLocaleString(),
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    if (result.status !== 200) throw new Error('EmailJS status ' + result.status);
  };

  // ── Fallback check (when SW not supported) ──
  const checkAndAlertFallback = async (silent = false) => {
    const savedEmail         = localStorage.getItem('wf_alert_email');
    const savedHeatLimit     = parseInt(localStorage.getItem('wf_heat_limit'))     || 38;
    const savedHumidityLimit = parseInt(localStorage.getItem('wf_humidity_limit')) || 80;
    if (!savedEmail) { if (!silent) addLog('⚠️ No email set'); return; }

    const checkTime = new Date().toLocaleTimeString();
    setLastCheck(checkTime);
    setNextCheck(new Date(Date.now() + CHECK_INTERVAL_MS).toLocaleTimeString());
    addLog(`🔍 Checking weather for ${getLastCity()}...`);

    try {
      const w        = await fetchWeather();
      const temp     = Math.round(w.main.temp);
      const humidity = w.main.humidity;
      addLog(`📊 Temp: ${temp}°C | Humidity: ${humidity}%`);

      if (temp > savedHeatLimit) {
        if (canSendAlert('heat')) {
          addLog(`🔥 Temp ${temp}°C > ${savedHeatLimit}°C — sending...`);
          await doSend(savedEmail, `🔥 Heat Alert — Temperature is ${temp}°C`, w);
          markAlertSent('heat');
          addLog(`✅ Heat alert sent to ${savedEmail}`);
          toast.showSuccess('Heat Alert! 🔥', `${temp}°C — email sent`);
        } else { addLog(`⏳ Heat alert on cooldown`); }
      } else { addLog(`✅ Temp ${temp}°C within safe range`); }

      if (humidity > savedHumidityLimit) {
        if (canSendAlert('humidity')) {
          addLog(`💧 Humidity ${humidity}% > ${savedHumidityLimit}% — sending...`);
          await doSend(savedEmail, `💧 Humidity Alert — Humidity is ${humidity}%`, w);
          markAlertSent('humidity');
          addLog(`✅ Humidity alert sent to ${savedEmail}`);
          toast.showSuccess('Humidity Alert! 💧', `${humidity}% — email sent`);
        } else { addLog(`⏳ Humidity alert on cooldown`); }
      } else { addLog(`✅ Humidity ${humidity}% within safe range`); }

    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  // ── Start monitoring ──
  const startMonitoring = async () => {
    if (!email.trim()) { toast.showInfo('Email required', 'Enter your email address.'); return; }

    // Save settings
    localStorage.setItem('wf_alert_email',    email.trim());
    localStorage.setItem('wf_heat_limit',     heatLimit);
    localStorage.setItem('wf_humidity_limit', humidityLimit);
    setMonitoring(true);

    // ── Try Service Worker first (24/7 mode) ──
    if (swSupported) {
      try {
        // Request notification permission
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }

        // Register service worker
        const reg = await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
        await reg.update();
        swRef.current = reg;
        setSwActive(true);

        // Wait for SW to be ready
        await navigator.serviceWorker.ready;

        // Send config to Service Worker
        navigator.serviceWorker.controller?.postMessage({
          type: 'START_MONITORING',
          payload: {
            email:         email.trim(),
            heatLimit,
            humidityLimit,
            city:          getLastCity(),
            apiKey:        OPENWEATHER_API,
            serviceId:     EMAILJS_CONFIG.SERVICE_ID,
            templateId:    EMAILJS_CONFIG.TEMPLATE_ID,
            publicKey:     EMAILJS_CONFIG.PUBLIC_KEY,
          },
        });

        addLog(`🔥 Heat alert if temp > ${heatLimit}°C`);
        addLog(`💧 Humidity alert if humidity > ${humidityLimit}%`);
        addLog(`✅ Works even when tab is closed!`);
        toast.showSuccess('24/7 Monitoring Active!', 'Works even when tab is closed ✅');
        return;

      } catch (err) {
        addLog(`⚠️ Service Worker failed — using tab mode: ${err.message}`);
      }
    }

    // ── Fallback: tab-only mode ──
    addLog(`🟡 Tab-only monitoring started (keep tab open)`);
    addLog(`🔥 Heat alert if temp > ${heatLimit}°C`);
    addLog(`💧 Humidity alert if humidity > ${humidityLimit}%`);
    addLog(`📧 All alerts → ${email.trim()}`);
    checkAndAlertFallback();
    intervalRef.current = setInterval(() => checkAndAlertFallback(true), CHECK_INTERVAL_MS);
  };

  // ── Stop monitoring ──
  const stopMonitoring = async () => {
    // Stop Service Worker monitoring
    if (swActive && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'STOP_MONITORING' });
      setSwActive(false);
    }
    // Stop fallback interval
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setMonitoring(false);
    setNextCheck('');
    addLog('🔴 Monitoring stopped');
  };

  // ── Test email ──
  const handleTest = async () => {
    if (!email.trim()) { toast.showInfo('Email required', 'Enter your email to test.'); return; }
    setTesting(true);
    try {
      await doSend(email.trim(), '🧪 Test Alert — WeatherFinder', null);
      toast.showSuccess('Test Sent! ✅', `Check your inbox at ${email}`);
      addLog(`🧪 Test email sent to ${email}`);
    } catch (err) {
      toast.showError('Test Failed ❌', err.text || err.message);
      addLog(`❌ Test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 12, marginBottom: 8,
    border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.12)',
    color: '#fff', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none',
    boxSizing: 'border-box',
  };

  const numInp = { ...inp, width: '72px', marginBottom: 0, textAlign: 'center', padding: '8px 10px' };

  const btn = (color = 'purple', disabled = false) => ({
    width: '100%', padding: '11px', borderRadius: 14, marginBottom: 8,
    border: `1px solid rgba(${color === 'red' ? '239,68,68' : '139,92,246'},0.5)`,
    background: disabled ? 'rgba(255,255,255,0.07)'
      : color === 'red'
        ? 'linear-gradient(135deg,rgba(239,68,68,0.6),rgba(220,38,38,0.5))'
        : 'linear-gradient(135deg,rgba(139,92,246,0.6),rgba(99,102,241,0.5))',
    color: '#fff', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.88rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: disabled ? 'none' : `0 4px 14px rgba(${color === 'red' ? '239,68,68' : '139,92,246'},0.3)`,
  });

  const threshRow = (icon, label, color, value, setter, unit) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      padding: '10px 14px', borderRadius: 12, marginBottom: 8,
      background: `rgba(${color},0.08)`, border: `1px solid rgba(${color},0.25)`,
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1, color: `rgb(${color})` }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Alert if &gt;</span>
        <input type="number" value={value} onChange={e => setter(Number(e.target.value))}
          disabled={monitoring} style={numInp} />
        <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="glass">
      <div className="section-label">🔔 Smart Alert Monitor</div>

      {/* Email input */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: 6 }}>
          📧 Alert email — receives both temperature & humidity alerts
        </div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" disabled={monitoring}
          style={{ ...inp, opacity: monitoring ? 0.6 : 1 }} />
      </div>

      {/* Thresholds */}
      <div style={{ fontSize: '0.72rem', opacity: 0.5, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
        Alert Thresholds
      </div>
      {threshRow('🔥', 'High Temperature', '239,68,68',  heatLimit,     setHeatLimit,     '°C')}
      {threshRow('💧', 'High Humidity',    '96,165,250', humidityLimit, setHumidityLimit, '%')}

      {/* Interval info */}
      <div style={{
        marginBottom: 8, padding: '7px 12px', borderRadius: 10,
        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
        fontSize: '0.78rem', color: '#a5b4fc',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4,
      }}>
        <span>⏱ Checks every 30 minutes</span>
        {monitoring && nextCheck && <span>⏭ Next: {nextCheck}</span>}
      </div>

      {/* Start / Stop */}
      {!monitoring
        ? <button onClick={startMonitoring} style={btn('purple')}>🟢 Start Monitoring</button>
        : <button onClick={stopMonitoring}  style={btn('red')}>🔴 Stop Monitoring</button>
      }

      {/* Test */}
      <button onClick={handleTest} disabled={testing || monitoring} style={btn('purple', testing || monitoring)}>
        {testing ? '📤 Sending test...' : '🧪 Send Test Email'}
      </button>

      {/* Status */}
      {monitoring && (
        <div style={{
          marginBottom: 8, padding: '10px 14px', borderRadius: 12,
          background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.35)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 700 }}>
              {swActive ? '24/7 Monitoring Active' : 'Monitoring Active (tab mode)'}
              {lastCheck && <span style={{ opacity: 0.7, fontWeight: 400 }}> · Last: {lastCheck}</span>}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: 2 }}>
            📧 {email}<br />
            🔥 Heat alert if temp &gt; {heatLimit}°C<br />
            💧 Humidity alert if humidity &gt; {humidityLimit}%
          </div>
        </div>
      )}

      {/* Activity Log */}
      {log.length > 0 && (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '6px 12px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, opacity: 0.5, textTransform: 'uppercase', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
            📋 Activity Log
          </div>
          {log.map((entry, i) => (
            <div key={i} style={{
              padding: '5px 12px', fontSize: '0.72rem', fontFamily: 'monospace',
              opacity: i === 0 ? 1 : 0.55,
              borderBottom: i < log.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              color: entry.includes('❌') ? '#f87171'
                   : entry.includes('✅') ? '#4ade80'
                   : entry.includes('🔥') ? '#fb923c'
                   : entry.includes('💧') ? '#60a5fa'
                   : entry.includes('⏳') ? '#facc15'
                   : '#fff',
            }}>{entry}</div>
          ))}
        </div>
      )}
    </div>
  );
}