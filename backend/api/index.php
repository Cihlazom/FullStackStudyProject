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
    $database = new Database();
    $db = $database->getConnection();

    switch ($method) {
        case 'GET':
            if (isset($segments[1]) && is_numeric($segments[1])) {
                // Get single venue
                getVenue($db, $segments[1]);
            } else {
                // Get all venues with filters
                getVenues($db);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
}

// Get all venues with optional filters
function getVenues($db) {
    try {
        $query = "SELECT * FROM venues WHERE is_active = 1";
        $params = [];

        // Add filters
        if (isset($_GET['type'])) {
            $query .= " AND type = :type";
            $params[':type'] = $_GET['type'];
        }

        if (isset($_GET['district'])) {
            $query .= " AND district = :district";
            $params[':district'] = $_GET['district'];
        }

        if (isset($_GET['priceRange'])) {
            $query .= " AND price_range = :price_range";
            $params[':price_range'] = $_GET['priceRange'];
        }

        // Add ordering
        $query .= " ORDER BY rating DESC, name ASC";

        // Add limit
        $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 12;
        $offset = isset($_GET['page']) ? (max(1, intval($_GET['page'])) - 1) * $limit : 0;

        $query .= " LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);

        // Bind parameters
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

        $stmt->execute();
        $venues = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Process venues data
        foreach ($venues as &$venue) {
            // Decode JSON fields
            $venue['features'] = json_decode($venue['features'], true) ?: [];
            $venue['hours'] = json_decode($venue['hours'], true) ?: [];

            // Add distance placeholder (you can implement real distance calculation later)
            $venue['distance'] = round(rand(5, 30) / 10, 1);

            // Format rating
            $venue['rating'] = floatval($venue['rating']);
        }

        // Get total count for pagination
        $countQuery = "SELECT COUNT(*) as total FROM venues WHERE is_active = 1";
        $countParams = [];

        if (isset($_GET['type'])) {
            $countQuery .= " AND type = :type";
            $countParams[':type'] = $_GET['type'];
        }
        if (isset($_GET['district'])) {
            $countQuery .= " AND district = :district";
            $countParams[':district'] = $_GET['district'];
        }
        if (isset($_GET['priceRange'])) {
            $countQuery .= " AND price_range = :price_range";
            $countParams[':price_range'] = $_GET['priceRange'];
        }

        $countStmt = $db->prepare($countQuery);
        foreach ($countParams as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $venues,
            'total' => intval($total),
            'page' => isset($_GET['page']) ? intval($_GET['page']) : 1,
            'limit' => $limit
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching venues: ' . $e->getMessage()
        ]);
    }
}

// Get single venue by ID
function getVenue($db, $venueId) {
    try {
        $query = "SELECT * FROM venues WHERE id = :id AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $venueId, PDO::PARAM_INT);
        $stmt->execute();

        $venue = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$venue) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Venue not found'
            ]);
            return;
        }

        // Process venue data
        $venue['features'] = json_decode($venue['features'], true) ?: [];
        $venue['hours'] = json_decode($venue['hours'], true) ?: [];
        $venue['rating'] = floatval($venue['rating']);

        // Get reviews for this venue
        $reviewQuery = "SELECT r.*, u.name as user_name FROM reviews r
                       LEFT JOIN users u ON r.user_id = u.id
                       WHERE r.venue_id = :venue_id
                       ORDER BY r.created_at DESC LIMIT 10";
        $reviewStmt = $db->prepare($reviewQuery);
        $reviewStmt->bindParam(':venue_id', $venueId, PDO::PARAM_INT);
        $reviewStmt->execute();
        $reviews = $reviewStmt->fetchAll(PDO::FETCH_ASSOC);

        // Format reviews
        foreach ($reviews as &$review) {
            $review['rating'] = intval($review['rating']);
            $review['date'] = date('Y-m-d', strtotime($review['created_at']));
        }

        $venue['reviews'] = $reviews;

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $venue
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching venue: ' . $e->getMessage()
        ]);
    }
}

// Handle events endpoints
function handleEvents($method, $segments) {
    $database = new Database();
    $db = $database->getConnection();

    switch ($method) {
        case 'GET':
            getEvents($db);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
}

// Get all events
function getEvents($db) {
    try {
        $query = "SELECT e.*, v.name as venue_name, v.district as venue_district
                  FROM events e
                  LEFT JOIN venues v ON e.venue_id = v.id
                  WHERE e.is_active = 1 AND e.event_date >= CURDATE()
                  ORDER BY e.event_date ASC, e.event_time ASC";

        $stmt = $db->prepare($query);
        $stmt->execute();
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format events data
        foreach ($events as &$event) {
            $event['price'] = floatval($event['price']);
            $event['venue'] = $event['venue_name'];
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $events,
            'total' => count($events)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching events: ' . $e->getMessage()
        ]);
    }
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
