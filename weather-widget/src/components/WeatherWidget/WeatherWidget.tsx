import "./WeatherWidget.css";
import { useState, useEffect } from "react";

interface WeatherData {
    altimeterSetting: number;
    cloudBase: number;
    cloudCeiling: number;
    cloudCover: number;
    dewPoint: number;
    freezingRainIntensity: number;
    humidity: number;
    precipitationProbability: number;
    pressureSeaLevel: number;
    pressureSurfaceLevel: number;
    rainIntensity: number;
    sleetIntensity: number;
    snowIntensity: number;
    temperature: number;
    temperatureApparent: number;
    uvHealthConcern: number;
    uvIndex: number;
    visibility: number;
    weatherCode: number;
    windDirection: number;
    windGust: number;
    windSpeed: number;
}

export function WeatherWidget() {
    const [data, setData] = useState<{
        city: string;
        weather: { values: WeatherData };
    } | null>(null);
    const [city, setCity] = useState<string>("Meppel");

    // Get current position and reverse geocode to city
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const json = await res.json();
                        const currentCity =
                            json.address?.city ||
                            json.address?.town ||
                            json.address?.village ||
                            "Meppel";
                        setCity(currentCity);
                    } catch (err) {
                        console.error(
                            "Reverse geocoding failed, using default",
                            err
                        );
                        setCity("Meppel");
                    }
                },
                () => {
                    console.log("Cannot get location: Default to Meppel");
                    setCity("Meppel");
                }
            );
        }
    }, []);

    // Fetch weather whenever city changes
    useEffect(() => {
        fetch("http://localhost:8000", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city }),
        })
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => console.error(err));
    }, [city]);

    if (!data) {
        return <div className="weather-widget">Loading weather...</div>;
    }

    const weather = data.weather.values;

    console.log(weather);

    return (
        <div className="weather-widget">
            <div className="weather-header">
                <h2>{city}</h2>
            </div>
            <div className="weather-main">
                <img
                    src={`tomorrow-icons/${weather.weatherCode}0.svg`}
                    alt={weather.weatherCode.toString()}
                    className="weather-icon"
                />
                <div className="weather-info">
                    <span className="temperature">{weather.temperature}°C</span>
                    <span className="condition">
                        Humidity: {weather.humidity}
                    </span>
                    <span className="condition">
                        Wind: {weather.windSpeed} |{" "}
                        <span
                            className="wind-direction"
                            style={{
                                display: "inline-block", // allow rotation
                                transform: `rotate(${weather.windDirection}deg)`,
                                transformOrigin: "50% 50%", // rotate around center
                            }}
                        >
                            ⬆
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
}
