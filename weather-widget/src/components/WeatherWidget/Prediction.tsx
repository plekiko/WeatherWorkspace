import type { WeatherData } from "./WeatherWidget";

export function Prediction({
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
