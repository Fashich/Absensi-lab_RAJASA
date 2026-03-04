<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Return simple success response
echo json_encode([
    'success' => true,
    'message' => 'Server is reachable',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>