import "./WeatherWidget.css";
import { useState, useEffect } from "react";

import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronUp,
} from "@tabler/icons-react";

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
        weather: { time: string; values: WeatherData };
        predictions: { time: string; values: WeatherData }[];
    } | null>(null);

    const [city, setCity] = useState<string>("Meppel");

    console.log("Current city:", city);

    // Get current position and geocode to city
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
            body: JSON.stringify({ date: new Date(), city }),
        })
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => console.error(err));
    }, [city]);

    if (!data) {
        return <div className="weather-widget">Loading weather...</div>;
    }

    console.log(data);

    const weather = data.weather.values;
    const time = new Date(data.weather.time);
    const isDay = time.getHours() >= 6 && time.getHours() < 18;

    return (
        <WeatherWidgetComponent
            weatherData={weather}
            city={city}
            day={isDay}
            predictions={data.predictions}
        />
    );
}

function WeatherWidgetComponent({
    weatherData,
    city,
    day,
    predictions,
}: {
    weatherData: WeatherData;
    city: string;
    day: boolean;
    predictions: { time: string; values: WeatherData }[];
}) {
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [showPredictions, setShowPredictions] = useState<boolean>(false);

    return (
        <div className="widget-container">
            <div
                className="weather-widget"
                style={{
                    background: day
                        ? "linear-gradient(135deg, #32659a, #0a4583)"
                        : "linear-gradient(135deg, #23243a, #0a1833)",
                }}
            >
                <div className="widget-header">
                    <h2>{city}</h2>
                </div>
                <div className="widget-main">
                    <img
                        src={`tomorrow-icons/${weatherData.weatherCode}${
                            day ? "0" : "1"
                        }.svg`}
                        alt={weatherData.weatherCode.toString()}
                        className="weather-icon"
                    />
                    <div className="weather-info">
                        <span className="temperature">
                            {weatherData.temperature}°C
                        </span>
                        <span className="condition">
                            Humidity: {weatherData.humidity}%
                        </span>
                        <span className="condition">
                            Wind: {weatherData.windSpeed} km/h |{" "}
                            <span
                                className="wind-direction"
                                style={{
                                    display: "inline-block",
                                    transform: `rotate(${weatherData.windDirection}deg)`,
                                }}
                            >
                                ⬆
                            </span>
                        </span>
                    </div>
                </div>
                <div className="widget-lower-part">
                    <button
                        className="details-toggle"
                        title="Show more details"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        {showDetails ? (
                            <IconChevronUp color="white" />
                        ) : (
                            <IconChevronDown color="white" />
                        )}
                    </button>
                    {showDetails && (
                        <div className="weather-details">
                            <p>
                                Feels like: {weatherData.temperatureApparent}°C
                            </p>
                            <p>UV Index: {weatherData.uvIndex}</p>
                            <p>Visibility: {weatherData.visibility} km</p>
                            <p>
                                Precipitation probability:{" "}
                                {weatherData.precipitationProbability}%
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {showPredictions && showDetails && (
                <div
                    className="prediction-container"
                    style={{
                        background: day
                            ? "linear-gradient(135deg, #32659a, #0a4583)"
                            : "linear-gradient(135deg, #23243a, #0a1833)",
                    }}
                >
                    <Predictions
                        predictions={predictions}
                        day={day}
                        howMany={3}
                    />
                </div>
            )}
            {showDetails && (
                <button
                    className="predictions-toggle"
                    title="Show weather predictions"
                    onClick={() => setShowPredictions(!showPredictions)}
                >
                    {showPredictions ? (
                        <IconChevronLeft size={16} color="white" />
                    ) : (
                        <IconChevronRight size={16} color="white" />
                    )}
                </button>
            )}
        </div>
    );
}

function Predictions({
    predictions,
    day,
    howMany,
}: {
    predictions: { time: string; values: WeatherData }[];
    day: boolean;
    howMany: number;
}) {
    return (
        <div className="predictions">
            {predictions.slice(0, howMany).map((p, idx) => (
                <Prediction key={idx} entry={p} day={day} />
            ))}
        </div>
    );
}

function Prediction({
    entry,
    day,
}: {
    entry: { time: string; values: WeatherData };
    day: boolean;
}) {
    const time = new Date(entry.time);
    const hour = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");

    return (
        <div className="prediction">
            <img
                className="prediction-icon"
                src={`tomorrow-icons/${entry.values.weatherCode}${
                    day ? "0" : "1"
                }.svg`}
                alt={entry.values.weatherCode.toString()}
            />
            <span className="prediction-time">
                {hour}:{minutes}
            </span>
            <span className="prediction-temperature">
                {entry.values.temperature}°C
            </span>
        </div>
    );
}
