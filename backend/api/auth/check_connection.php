<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Tangani preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }
    http_response_code(200);
    exit();
}

// Set content type to JSON
header('Content-Type: application/json');

// Return simple success response
echo json_encode([
    'success' => true,
    'message' => 'Server is reachable',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>