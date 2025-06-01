<?php
// Main API Router for Barcelona Local Platform

// Set headers for CORS and JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
include_once 'database.php';

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$request = $_SERVER['REQUEST_URI'];

// Remove base path and query parameters
$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/FullStackStudyProject/backend/api', '', $path);

// Split path into segments
$segments = explode('/', trim($path, '/'));

// Debug: remove this after testing
// echo "Debug - Path: " . $path . " | Segments: " . json_encode($segments) . "\n";

// If no specific endpoint, default to venues for testing
if (empty($segments[0]) || $segments[0] === '') {
    $segments[0] = 'venues';
}

// Route requests
try {
    switch ($segments[0]) {
        case 'venues':
            handleVenues($method, $segments);
            break;

        case 'events':
            handleEvents($method, $segments);
            break;

        case 'auth':
            handleAuth($method, $segments);
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Endpoint not found'
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

// Handle venues endpoints
function handleVenues($method, $segments) {
    include_once 'venues.php';
    exit();
}

// Handle events endpoints - ИСПРАВЛЕНО!
function handleEvents($method, $segments) {
    include 'events.php';
    exit();
}

// Handle auth endpoints (placeholder for now)
function handleAuth($method, $segments) {
    http_response_code(501);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication endpoints not implemented yet'
    ]);
}
?>
