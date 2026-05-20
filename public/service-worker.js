/* WeatherFinder Service Worker — 24/7 Alert Monitor */

const CACHE_NAME = 'weatherfinder-v1';
const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// ── Listen for messages from the React app ──
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  if (type === 'START_MONITORING') {
    // Save config sent from React app
    self.monitorConfig = {
      email:         payload.email,
      heatLimit:     payload.heatLimit,
      humidityLimit: payload.humidityLimit,
      city:          payload.city,
      apiKey:        payload.apiKey,
      serviceId:     payload.serviceId,
      templateId:    payload.templateId,
      publicKey:     payload.publicKey,
    };
    self.isMonitoring = true;

    // Start the interval
    if (self.monitorInterval) clearInterval(self.monitorInterval);
    checkAndAlert(); // immediate first check
    self.monitorInterval = setInterval(checkAndAlert, CHECK_INTERVAL_MS);


  }

  if (type === 'STOP_MONITORING') {
    self.isMonitoring = false;
    if (self.monitorInterval) {
      clearInterval(self.monitorInterval);
      self.monitorInterval = null;
    }
    self.monitorConfig = null;
    console.log('[SW] Monitoring stopped');
    event.source?.postMessage({ type: 'SW_LOG', msg: '🔴 24/7 monitoring stopped' });
  }
});



// ── Core check function inside Service Worker ──
async function checkAndAlert() {
  if (!self.isMonitoring || !self.monitorConfig) return;

  const { email, heatLimit, humidityLimit, city, apiKey,
          serviceId, templateId, publicKey } = self.monitorConfig;

  try {
    // Fetch current weather
    const res  = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${encodeURIComponent(city)}&appid=${apiKey}`
    );
    const w    = await res.json();
    const temp     = Math.round(w.main.temp);
    const humidity = w.main.humidity;
    const now      = Date.now();

    // Broadcast current conditions back to app
    broadcastToClients({ type: 'SW_LOG', msg: `📊 Temp: ${temp}°C | Humidity: ${humidity}%` });

    // ── Check temperature ──
    if (temp > heatLimit) {
      const lastHeat = self.lastHeatAlert || 0;
      if (now - lastHeat > 3 * 60 * 60 * 1000) { // 3hr cooldown
        await sendEmail(email, `🔥 Heat Alert — Temperature is ${temp}°C`, w, serviceId, templateId, publicKey);
        self.lastHeatAlert = now;
        broadcastToClients({ type: 'SW_LOG', msg: `✅ Heat alert sent to ${email}` });
        showNotification('🔥 Heat Alert', `Temperature is ${temp}°C in ${city}`);
      } else {
        broadcastToClients({ type: 'SW_LOG', msg: `⏳ Heat alert on cooldown` });
      }
    } else {
      broadcastToClients({ type: 'SW_LOG', msg: `✅ Temp ${temp}°C within safe range` });
    }

    // ── Check humidity ──
    if (humidity > humidityLimit) {
      const lastHum = self.lastHumidityAlert || 0;
      if (now - lastHum > 3 * 60 * 60 * 1000) { // 3hr cooldown
        await sendEmail(email, `💧 Humidity Alert — Humidity is ${humidity}%`, w, serviceId, templateId, publicKey);
        self.lastHumidityAlert = now;
        broadcastToClients({ type: 'SW_LOG', msg: `✅ Humidity alert sent to ${email}` });
        showNotification('💧 Humidity Alert', `Humidity is ${humidity}% in ${city}`);
      } else {
        broadcastToClients({ type: 'SW_LOG', msg: `⏳ Humidity alert on cooldown` });
      }
    } else {
      broadcastToClients({ type: 'SW_LOG', msg: `✅ Humidity ${humidity}% within safe range` });
    }

  } catch (err) {
    broadcastToClients({ type: 'SW_LOG', msg: `❌ Error: ${err.message}` });
  }
}

// ── Send email via EmailJS REST API ──
async function sendEmail(toEmail, alertLabel, w, serviceId, templateId, publicKey) {
  const params = {
    service_id:  serviceId,
    template_id: templateId,
    user_id:     publicKey,
    template_params: {
      to_email:    toEmail,
      condition:   alertLabel,
      city:        w?.name        || 'Unknown',
      temperature: w ? `${Math.round(w.main.temp)}°C` : '--',
      humidity:    w ? `${w.main.humidity}%`           : '--',
      wind:        w ? `${w.wind.speed} m/s`           : '--',
      description: w?.weather?.[0]?.description        || '--',
      time:        new Date().toLocaleString(),
    },
  };

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EmailJS: ${res.status} — ${text}`);
  }
}

// ── Show browser push notification ──
function showNotification(title, body) {
  if (self.Notification?.permission === 'granted') {
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: title,
    });
  }
}

// ── Broadcast message to all open app tabs ──
function broadcastToClients(msg) {
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => client.postMessage(msg));
  });
}

// ── Keep service worker alive ──
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});