<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    exit(json_encode(["error" => "Unauthorized"]));
}

function requireRole($role) {
    if ($_SESSION['user']['role'] !== $role) {
        http_response_code(403);
        exit(json_encode(["error" => "Forbidden"]));
    }
}