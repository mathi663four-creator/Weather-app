export function getLastCity()      { return localStorage.getItem('wf_lastCity'); }
export function setLastCity(city)  { localStorage.setItem('wf_lastCity', city); }

export function getLatestWeather() {
  try { return JSON.parse(localStorage.getItem('wf_latestWeather') || '{}'); }
  catch { return {}; }
}
export function setLatestWeather(data) {
  try { localStorage.setItem('wf_latestWeather', JSON.stringify(data)); } catch (e) {}
}

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem('wf_favorites') || '[]'); }
  catch { return []; }
}
export function addFavorite(city) {
  const arr = getFavorites();
  if (!arr.includes(city)) {
    arr.push(city);
    localStorage.setItem('wf_favorites', JSON.stringify(arr));
  }
}

export function getReminder()         { return localStorage.getItem('wf_reminder') || ''; }
export function setReminder(type)     { if (type) localStorage.setItem('wf_reminder', type); else localStorage.removeItem('wf_reminder'); }
export function clearReminder()       { localStorage.removeItem('wf_reminder'); }

export function getTheme()            { return localStorage.getItem('wf_theme') || 'light'; }
export function saveTheme(theme)      { localStorage.setItem('wf_theme', theme); }

export function getLastNotif() {
  try { return JSON.parse(localStorage.getItem('wf_lastNotif') || '{}'); }
  catch { return {}; }
}
export function saveLastNotif(obj) {
  try { localStorage.setItem('wf_lastNotif', JSON.stringify(obj)); } catch (e) {}
}