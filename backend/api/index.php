<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = $_SERVER['REQUEST_URI'];

$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/FullStackStudyProject/backend/api', '', $path);

$segments = explode('/', trim($path, '/'));

try {
    switch ($segments[0]) {
        case 'venues':
            handleVenues($method, $segments);
            break;

        case 'auth':
            handleAuth($method, $segments);
            break;

        case 'favorites':
            handleFavorites($method, $segments);
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Endpoint not found: ' . $segments[0]
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

function handleVenues($method, $segments) {
    include 'venues.php';
    exit();
}

function handleAuth($method, $segments) {
    include 'auth.php';
    exit();
}

function handleFavorites($method, $segments) {
    include 'favorites.php';
    exit();
}
?>