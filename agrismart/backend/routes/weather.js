const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/weather?city=Ludhiana
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'city param required' });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenWeather API key not configured' });

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;

    res.json({
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      clouds: data.clouds.all,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      rain: data.rain ? (data.rain['1h'] ?? data.rain['3h'] ?? 0) : 0,
      visibility: data.visibility,
    });
  } catch (err) {
    console.error(err);
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
