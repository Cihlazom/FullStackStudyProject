<?php
// Simple PHP server for frontend development
$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($request_uri, PHP_URL_PATH);

// Serve static files
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/', $path)) {
    return false; // Let PHP serve static files
}

// For all other requests, serve index.html
include 'frontend/index.html';
?>
