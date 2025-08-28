<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read input
$body = file_get_contents("php://input");
$data = json_decode($body, true);

if (!$data || !isset($data["city"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing city"]);
    exit;
}

$city = $data["city"];
$now = time();

// Connect to SQLite DB
$db = new PDO('sqlite:weather.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Check if we have cached data for this city
$stmt = $db->prepare("SELECT data, last_checked FROM weather_cache WHERE city = :city");
$stmt->execute([':city' => $city]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

$cacheValid = false;
if ($row) {
    // If cached less than 30 minutes ago, use it
    if ($now - intval($row['last_checked']) < 1800) { // 1800 sec = 30 min
        $cacheValid = true;
        $weatherData = json_decode($row['data'], true);
    }
}

if (!$cacheValid) {
    $apiKey = "luzy4D0cZwIXQIe7t6B1w5melDrNmkvU";

    $url = "https://api.tomorrow.io/v4/weather/forecast?location=" . urlencode($city) . "&apikey={$apiKey}";
    
    $response = file_get_contents($url);
    if ($response === false) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch weather from API"]);
        exit;
    }

    $weatherData = json_decode($response, true);

    // Save to cache
    $stmt = $db->prepare("REPLACE INTO weather_cache (city, data, last_checked) VALUES (:city, :data, :last_checked)");
    $stmt->execute([
        ':city' => $city,
        ':data' => json_encode($weatherData),
        ':last_checked' => $now
    ]);
}


// Return weather
echo json_encode([
    "city" => $city,
    "weather" => $weatherData['timelines']['minutely'][0]
]);
