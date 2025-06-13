<?php
// Создайте файл backend/api/auth.php

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

// Get request method and input
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Parse URL for endpoints
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/FullStackStudyProject/backend/api', '', $path);
$segments = explode('/', trim($path, '/'));

try {
    switch ($method) {
        case 'POST':
            if (isset($segments[1])) {
                switch ($segments[1]) {
                    case 'login':
                        loginUser($input);
                        break;
                    case 'register':
                        registerUser($input);
                        break;
                    case 'logout':
                        logoutUser($input);
                        break;
                    default:
                        throw new Exception('Invalid auth endpoint');
                }
            } else {
                throw new Exception('Auth endpoint required');
            }
            break;

        case 'GET':
            if (isset($segments[1])) {
                switch ($segments[1]) {
                    case 'profile':
                        getUserProfile();
                        break;
                    case 'verify':
                        verifyToken();
                        break;
                    default:
                        throw new Exception('Invalid auth endpoint');
                }
            } else {
                throw new Exception('Auth endpoint required');
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

// User Registration
function registerUser($input) {
    $database = new Database();
    $db = $database->getConnection();

    // Validate input
    if (!isset($input['name'], $input['email'], $input['password'])) {
        throw new Exception('Missing required fields: name, email, password');
    }

    $name = trim($input['name']);
    $email = trim(strtolower($input['email']));
    $password = $input['password'];
    $age_range = $input['age_range'] ?? null;
    $interests = isset($input['interests']) ? json_encode($input['interests']) : null;

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Validate password length
    if (strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters long');
    }

    // Check if user already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();

    if ($checkStmt->fetch()) {
        throw new Exception('User with this email already exists');
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $insertQuery = "INSERT INTO users (name, email, password_hash, age_range, interests)
                    VALUES (:name, :email, :password_hash, :age_range, :interests)";
    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->bindParam(':name', $name);
    $insertStmt->bindParam(':email', $email);
    $insertStmt->bindParam(':password_hash', $password_hash);
    $insertStmt->bindParam(':age_range', $age_range);
    $insertStmt->bindParam(':interests', $interests);

    if ($insertStmt->execute()) {
        $user_id = $db->lastInsertId();

        // Create session token
        $token = generateSecureToken();
        $expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));

        createUserSession($db, $user_id, $token, $expires_at);

        // Get user data
        $userData = getUserData($db, $user_id);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $userData,
                'token' => $token,
                'expires_at' => $expires_at
            ]
        ]);
    } else {
        throw new Exception('Failed to create user');
    }
}

// User Login
function loginUser($input) {
    $database = new Database();
    $db = $database->getConnection();

    // Validate input
    if (!isset($input['email'], $input['password'])) {
        throw new Exception('Missing required fields: email, password');
    }

    $email = trim(strtolower($input['email']));
    $password = $input['password'];

    // Get user from database
    $query = "SELECT id, name, email, password_hash, age_range, interests, is_active
              FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Invalid email or password');
    }

    if (!$user['is_active']) {
        throw new Exception('Account is deactivated');
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        throw new Exception('Invalid email or password');
    }

    // Create session token
    $token = generateSecureToken();
    $expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));

    createUserSession($db, $user['id'], $token, $expires_at);

    // Remove password hash from response
    unset($user['password_hash']);

    // Parse interests JSON
    if ($user['interests']) {
        $user['interests'] = json_decode($user['interests'], true);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'user' => $user,
            'token' => $token,
            'expires_at' => $expires_at
        ]
    ]);
}

// User Logout
function logoutUser($input) {
    $token = getAuthToken();

    if (!$token) {
        throw new Exception('No token provided');
    }

    $database = new Database();
    $db = $database->getConnection();

    // Delete session
    $query = "DELETE FROM user_sessions WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}

// Get User Profile
function getUserProfile() {
    $user = authenticateUser();

    if (!$user) {
        throw new Exception('Authentication required');
    }

    echo json_encode([
        'success' => true,
        'data' => $user
    ]);
}

// Verify Token
function verifyToken() {
    $user = authenticateUser();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired token'
        ]);
        return;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Token is valid',
        'data' => $user
    ]);
}

// Helper Functions
function generateSecureToken() {
    return bin2hex(random_bytes(32));
}

function createUserSession($db, $user_id, $token, $expires_at) {
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';

    $query = "INSERT INTO user_sessions (user_id, token, expires_at, user_agent, ip_address)
              VALUES (:user_id, :token, :expires_at, :user_agent, :ip_address)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':token', $token);
    $stmt->bindParam(':expires_at', $expires_at);
    $stmt->bindParam(':user_agent', $user_agent);
    $stmt->bindParam(':ip_address', $ip_address);
    $stmt->execute();
}

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
    $query = "SELECT u.id, u.name, u.email, u.age_range, u.interests, u.avatar, s.expires_at
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

function getUserData($db, $user_id) {
    $query = "SELECT id, name, email, age_range, interests, avatar FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && $user['interests']) {
        $user['interests'] = json_decode($user['interests'], true);
    }

    return $user;
}
?>
