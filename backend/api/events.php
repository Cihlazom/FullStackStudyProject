<?php
// Events API endpoint for Barcelona Local Platform

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

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            getEvents();
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
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

// Get all events
function getEvents() {
    $database = new Database();
    $db = $database->getConnection();

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
            $event['date'] = $event['event_date'];
            $event['time'] = $event['event_time'];
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
?>
