import "./WeatherWidget.css";
import { useState, useEffect } from "react";

type Location = {
    latitude: number | null;
    longitude: number | null;
};

export function WeatherWidget() {
    const [data, setData] = useState(null);
    const [location, setLocation] = useState<Location>({
        latitude: null,
        longitude: null,
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            console.log("Geolocation not supported");
        }

        function success(position: GeolocationPosition) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            setLocation({ latitude, longitude });
        }

        function error() {
            setLocation({
                latitude: 52.693824768066406,
                longitude: 6.1977667808532715,
            });

            console.log("Cannot get current location: Default to MEPPEL");
        }

        fetch(
            "https://api.tomorrow.io/v4/weather/forecast?location=meppel&apikey=luzy4D0cZwIXQIe7t6B1w5melDrNmkvU"
        )
            .then((response) => response.json())
            .then((json) => {
                console.log("Fetched data:", json); // log here instead
                setData(json);
            })
            .catch((error) => console.error(error));
    }, []);

    console.log(data);

    return (
        <>
            <div className="example-container">
                <div className="main-container">
                    <div className="icon-container">
                        <img
                            title="Current Weather"
                            src="tomorrow-icons/10000.svg"
                            className="icon"
                        />
                    </div>
                    <div className="data-container"></div>
                </div>
            </div>
        </>
    );
}
