<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Read input
$body = file_get_contents("php://input");
$data = json_decode($body, true);

if (!$data || !isset($data["city"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing city"]);
    exit;
}

$city = $data["city"];
$date = isset($data["date"]) ? strtotime($data["date"]) : time();
$now = time();
$utcNow = new DateTime("now", new DateTimeZone("UTC"));

// Connect to db
$db = new PDO('sqlite:weather.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Check if we have cached data for this city
$stmt = $db->prepare("SELECT data, last_checked FROM weather_cache WHERE city = :city");
$stmt->execute([':city' => $city]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

$cacheValid = false;
if ($row) {
    // if cached less than 30 minutes ago, use it
    if ($now - intval($row['last_checked']) < 1800) { // 1800 sec = 30 min
        $cacheValid = true;
        $weatherData = json_decode($row['data'], true);
    }
}

if (!$cacheValid) {
    // Get the api key from the environment variable
    $apiKey = $_ENV['API_KEY'] ?? null;

    if (!$apiKey) {
        http_response_code(500);
        echo json_encode(["error" => "API key not set in environment"]);
        exit;
    }

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

$closest = null;
$minDiff = PHP_INT_MAX;

// Find closest minute data to now
foreach ($weatherData['timelines']['minutely'] as $entry) {
    $entryTime = new DateTime($entry['time'], new DateTimeZone("UTC"));
    $diff = abs($entryTime->getTimestamp() - $utcNow->getTimestamp());

    if ($diff < $minDiff) {
        $minDiff = $diff;
        $closest = $entry;
    }
}

// Filter hourly predictions after now
$futurePredictions = array_filter(
    $weatherData['timelines']['hourly'],
    function ($entry) use ($now) {
        return strtotime($entry['time']) > $now;
    }
);

$futurePredictions = array_slice(array_values($futurePredictions), 0, 6);

// Return weather
echo json_encode([
    "city" => $city,
    "weather" => $closest,
    "predictions" => $futurePredictions
]);
