export const OPENWEATHER_API = process.env.REACT_APP_OPENWEATHER_API_KEY;
export const WEATHER_URL     = 'https://api.openweathermap.org/data/2.5/weather?units=metric';
export const FORECAST_URL    = 'https://api.openweathermap.org/data/2.5/forecast?units=metric';
export const METEO_URL       = 'https://api.open-meteo.com/v1/forecast';

export const PLANT_DATA = {
  tomato:      { minT: 20, maxT: 30, minH: 50, maxH: 70 },
  rose:        { minT: 15, maxT: 28, minH: 40, maxH: 70 },
  moneyPlant:  { minT: 18, maxT: 30, minH: 50, maxH: 80 },
  cactus:      { minT: 20, maxT: 38, minH: 10, maxH: 40 },
  jasmine:     { minT: 16, maxT: 28, minH: 50, maxH: 75 },
};
