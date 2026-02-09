<?php
include "../config/auth.php";

$user = $_SESSION['user'] ?? null;

if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

echo json_encode([
    "id" => $user["id"],
    "fullname" => $user["fullname"],
    "email" => $user["email"],
    "role" => $user["role"]
]);