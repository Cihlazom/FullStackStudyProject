<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database and auth functions
include_once 'database.php';

// Include auth functions from auth.php
function getAuthToken() {
    $headers = getallheaders();

    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (strpos($auth_header, 'Bearer ') === 0) {
            return substr($auth_header, 7);
        }
    }

    return null;
}

function authenticateUser() {
    $token = getAuthToken();

    if (!$token) {
        return null;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Get session and user data
    $query = "SELECT u.id, u.name, u.email, u.age_range, u.interests, s.expires_at
              FROM users u 
              JOIN user_sessions s ON u.id = s.user_id 
              WHERE s.token = :token AND s.expires_at > NOW() AND u.is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Parse interests JSON
        if ($user['interests']) {
            $user['interests'] = json_decode($user['interests'], true);
        }
        unset($user['expires_at']);
    }

    return $user;
}

// Parse URL for endpoints
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/FullStackStudyProject/backend/api', '', $path);
$segments = explode('/', trim($path, '/'));

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

error_log("=== FAVORITES API ===");
error_log("Method: " . $method);
error_log("Segments: " . print_r($segments, true));
error_log("Input: " . print_r($input, true));

try {
    switch ($method) {
        case 'GET':
            getUserFavorites();
            break;

        case 'POST':
            addToFavorites($input);
            break;

        case 'DELETE':
            if (isset($segments[1]) && is_numeric($segments[1])) {
                removeFromFavorites($segments[1]);
            } else {
                throw new Exception('Venue ID required for delete');
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
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Get user's favorites
function getUserFavorites() {
    $user = authenticateUser();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required'
        ]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    try {
        $query = "SELECT f.venue_id, f.created_at, v.name, v.type, v.district, v.image, v.rating
                  FROM user_favorites f
                  JOIN venues v ON f.venue_id = v.id
                  WHERE f.user_id = :user_id AND v.is_active = 1
                  ORDER BY f.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();

        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format favorites data
        foreach ($favorites as &$favorite) {
            $favorite['rating'] = floatval($favorite['rating']);
            $favorite['date_added'] = date('Y-m-d H:i:s', strtotime($favorite['created_at']));
        }

        echo json_encode([
            'success' => true,
            'data' => $favorites,
            'total' => count($favorites)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching favorites: ' . $e->getMessage()
        ]);
    }
}

// Add venue to favorites
function addToFavorites($input) {
    $user = authenticateUser();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required'
        ]);
        return;
    }

    if (!isset($input['venue_id'])) {
        throw new Exception('Venue ID is required');
    }

    $venue_id = $input['venue_id'];

    $database = new Database();
    $db = $database->getConnection();

    try {
        // Check if venue exists
        $venueQuery = "SELECT id FROM venues WHERE id = :venue_id AND is_active = 1";
        $venueStmt = $db->prepare($venueQuery);
        $venueStmt->bindParam(':venue_id', $venue_id);
        $venueStmt->execute();

        if (!$venueStmt->fetch()) {
            throw new Exception('Venue not found or inactive');
        }

        // Check if already in favorites
        $checkQuery = "SELECT id FROM user_favorites WHERE user_id = :user_id AND venue_id = :venue_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $user['id']);
        $checkStmt->bindParam(':venue_id', $venue_id);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            throw new Exception('Venue already in favorites');
        }

        // Add to favorites
        $insertQuery = "INSERT INTO user_favorites (user_id, venue_id) VALUES (:user_id, :venue_id)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->bindParam(':user_id', $user['id']);
        $insertStmt->bindParam(':venue_id', $venue_id);

        if ($insertStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Added to favorites successfully',
                'data' => [
                    'venue_id' => $venue_id,
                    'user_id' => $user['id']
                ]
            ]);
        } else {
            throw new Exception('Failed to add to favorites');
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error adding to favorites: ' . $e->getMessage()
        ]);
    }
}

// Remove venue from favorites
function removeFromFavorites($venue_id) {
    $user = authenticateUser();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required'
        ]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    try {
        $deleteQuery = "DELETE FROM user_favorites WHERE user_id = :user_id AND venue_id = :venue_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(':user_id', $user['id']);
        $deleteStmt->bindParam(':venue_id', $venue_id);

        if ($deleteStmt->execute()) {
            $affected = $deleteStmt->rowCount();

            if ($affected > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Removed from favorites successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Venue was not in favorites'
                ]);
            }
        } else {
            throw new Exception('Failed to remove from favorites');
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error removing from favorites: ' . $e->getMessage()
        ]);
    }
}

// Check if venue is in user's favorites
function isVenueFavorite($user_id, $venue_id) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id FROM user_favorites WHERE user_id = :user_id AND venue_id = :venue_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':venue_id', $venue_id);
    $stmt->execute();

    return $stmt->fetch() !== false;
}
?>