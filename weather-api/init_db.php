<?php
$db = new PDO('sqlite:weather.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$db->exec("
CREATE TABLE IF NOT EXISTS weather_cache (
    city TEXT PRIMARY KEY,
    data TEXT,
    last_checked INTEGER
)
");

echo "Database initialized.\n";
