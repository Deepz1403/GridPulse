import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const fetchTemperature = async (location) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const temperature = response.data.main.temp;

    return temperature;
  } catch (error) {
    console.error('Error fetching temperature:', error.message);
    return null;
  }
};
