import express from "express";

const router = express.Router();

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorm",
  };

  return weatherCodes[code] || "Weather updated";
}

router.get("/amman", async (req, res) => {
  try {
    const latitude = 31.9539;
    const longitude = 35.9106;

    const apiUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&timezone=auto`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(500).json({
        message: "Failed to fetch weather data",
      });
    }

    const data = await response.json();

    res.json({
      city: "Amman",
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      description: getWeatherDescription(data.current.weather_code),
    });
  } catch (error) {
    res.status(500).json({
      message: "Weather service error",
      error: error.message,
    });
  }
});

export default router;