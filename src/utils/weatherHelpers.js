/** Returns background gradient based on weather condition */
export function getWeatherGradient(condition = '') {
  const c = condition.toLowerCase();
  if (c.includes('rain'))  return 'linear-gradient(135deg,#283e51,#485563,#4e4376)';
  if (c.includes('cloud')) return 'linear-gradient(135deg,#757f9a,#d7dde8)';
  if (c.includes('clear')) return 'linear-gradient(135deg,#f6d365,#fda085,#a6c1ee)';
  if (c.includes('snow'))  return 'linear-gradient(135deg,#e0eafc,#b6fbff)';
  if (c.includes('storm')) return 'linear-gradient(135deg,#1c1c2e,#2d2d44,#3a3a5c)';
  return 'linear-gradient(135deg,#f6d365 0%,#fda085 40%,#a6c1ee 100%)';
}

/** AI weather insight message */
export function getAiInsight(data) {
  const t    = data.main.temp;
  const hum  = data.main.humidity;
  const pres = data.main.pressure;
  const desc = (data.weather[0].description || '').toLowerCase();
  if (pres < 1005 && hum > 75) return 'Low pressure with high humidity — rain likely soon ☔';
  if (desc.includes('storm'))  return 'Stormy — avoid outdoor activities ⚡';
  if (t > 33)                  return 'Hot day — stay hydrated 🌞';
  if (t < 8)                   return 'Very cold — wear warm layers 🧥';
  if (desc.includes('cloud'))  return 'Cloudy skies — milder temperatures ahead ☁️';
  return 'Weather looks stable for now.';
}

/** Mood advisor message */
export function getMoodAdvice(description = '', temp) {
  const desc = description.toLowerCase();
  if (desc.includes('rain')) return 'Rainy vibes — perfect for coffee & cozy reading ☕📚';
  if (desc.includes('snow')) return 'Snowy — stay warm and enjoy indoor hobbies ❄️';
  if (temp > 30)             return 'Hot — avoid midday sun and hydrate 💧';
  return 'Nice day — productive and pleasant!';
}

/** Breathing comfort score (1-10) */
export function calcBreathingScore(temp, humidity, windSpeed, aqi) {
  let score = 10;
  if (humidity > 80)          score -= 2;
  if (temp > 35 || temp < 10) score -= 2;
  if (windSpeed < 2)          score -= 1;
  if (aqi >= 4)               score -= 3;
  else if (aqi === 3)         score -= 1;
  return Math.max(1, score);
}

/** Estimate UV from weather condition string */
export function estimateUV(conditionMain = '') {
  const c = conditionMain.toLowerCase();
  if (c.includes('clear')) return 7;
  if (c.includes('cloud')) return 4;
  if (c.includes('rain'))  return 2;
  return 5;
}

/** Bar color based on value range */
export function barColor(value, goodRange, colorGood, colorWarn, colorBad) {
  if (value < goodRange[0] || value > goodRange[1]) return colorBad;
  return colorGood;
}

/** Outfit suggestion based on temperature + condition */
export function getOutfitSuggestion(temp, condition) {
  let outfit =
    temp > 32 ? '🩳 Light clothes, cap & sunglasses.' :
    temp > 25 ? '👕 T-shirt & comfortable jeans.'     :
    temp > 18 ? '🧥 Light jacket recommended.'        :
                '🧤 Warm clothes & gloves.';

  const activity =
    condition === 'rainy'  ? '📘 Read a book or enjoy a warm drink indoors.'  :
    condition === 'clear'  ? '🏃 Perfect day for outdoor activities!'          :
    condition === 'windy'  ? '🪁 Great for a kite or a walk!'                  :
    condition === 'snowy'  ? '☃️ Build a snowman or stay cozy inside!'         :
                             '🧘 Relax and stay comfortable.';

  return `${outfit} ${activity}`;
}

/** Vitamin-D exposure recommendation */
export function getVitaminDAdvice(uv) {
  const exposure = uv <= 2 ? 60 : uv <= 5 ? 20 : uv <= 7 ? 10 : 5;
  const safety   = uv >= 8
    ? '⚠️ High UV — avoid peak sunlight (10 AM – 4 PM).'
    : 'Safe exposure window.';
  return `Recommended sunlight: ${exposure} minutes. ${safety}`;
}

/** Format hour number to 12h string */
export function makeTime(h) {
  return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
}