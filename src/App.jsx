/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function App() {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState("");
  const [weather, setWeather] = useState({});

  useEffect(() => {
    const fetchWeather = async () => {
      if (location.length < 2) return setWeather({});

      try {
        setIsLoading(true);

        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        );
        const geoData = await geoRes.json();

        if (!geoData.results) throw new Error("Location not found");

        const { latitude, longitude, timezone, name, country_code } =
          geoData.results[0];

        setDisplayLocation(`${name}, ${country_code}`);

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min,wind_speed_10m_max`
        );
        const weatherData = await weatherRes.json();
        setWeather(weatherData.daily);
        console.log(weatherData.daily);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  return (
    <div className=' h-screen text-gray-100 mx-auto max-w-7xl px-2 sm:px-3 md:px-4 md:py-10 '>
      <h1 className='text-4xl font-medium text-center md:text-6xl tracking-widest pt-8 pb-5 md:pb-10 md:pt-16 '>
        Weather App
      </h1>
      <Input location={location} onChangeLocation={setLocation} />

      {isLoading && <p className='loader text-2xl font-semibold'>Loading...</p>}

      {weather.weathercode && (
        <Weather weather={weather} location={displayLocation} />
      )}
    </div>
  );
}

function Input({ location, onChangeLocation }) {
  return (
    <div className='text-center'>
      <input
        type='text'
        placeholder='Search from location...'
        value={location}
        onChange={(e) => onChangeLocation(e.target.value)}
        className='text-lg placeholder:text-gray-300 text-gray-200 py-2 px-3 my-5 md:text-xl md:py-4 bg-[#AC92EC]  md:my-8 md:px-8 border-none w-full rounded-lg lg:w-1/2 shadow-lg'
      />
    </div>
  );
}

function Weather({ weather, location }) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: codes,
    wind_speed_10m_max: windspeed,
  } = weather;

  return (
    <div>
      <h2 className='text-center  my-3 md:mb-6 md:mt-0 '>
        Weather : {location}
      </h2>
      <ul className='list-none flex flex-col md:grid md:grid-cols-4 lg:flex lg:flex-row gap-2 sm:gap-3  lg:gap-5'>
        {dates.map((date, i) => (
          <Day
            date={date}
            max={max[i]}
            min={min[i]}
            code={codes[i]}
            key={date}
            isToday={i === 0}
            speed={windspeed[i]}
          />
        ))}
      </ul>
    </div>
  );
}

function Day({ date, max, min, code, isToday, speed }) {
  return (
    <li className='bg-[#AC92EC] w-96 md:w-32 flex md:flex-col px-1 items-center shadow-xl justify-between  gap-1 cursor-pointer py-3 md:py-4 rounded-lg'>
      <div className='flex justify-center md:flex-col items-center gap-1 md:mb-1'>
        <span className='text-5xl'>{getWeatherIcon(code)}</span>
        <p className='text-xl'>{isToday ? "Today" : formatDay(date)}</p>
      </div>

      <p className='text-2xl '>
        {Math.floor(min)}&deg;-<strong>{Math.ceil(max)}&deg;</strong>
      </p>
      <p className='text-xs hidden md:block'>Wind: {speed} km/h</p>
    </li>
  );
}

export default App;
