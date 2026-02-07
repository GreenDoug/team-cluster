<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data["name"] ?? "");
$description = trim($data["description"] ?? "");

if ($name === "") {
    http_response_code(422);
    exit(json_encode(["error" => "Cluster name is required."]));
}

$coach_id = (int)$_SESSION["user"]["id"];
$safe_name = $conn->real_escape_string($name);
$safe_description = $conn->real_escape_string($description);

$conn->query(
    "INSERT INTO clusters (name, description, coach_id, status, created_at)
     VALUES ('$safe_name', '$safe_description', $coach_id, 'pending', NOW())"
);

if ($conn->error) {
    http_response_code(500);
    exit(json_encode(["error" => "Failed to create cluster."]));
}

$id = $conn->insert_id;

echo json_encode([
    "id" => $id,
    "name" => $name,
    "description" => $description,
    "status" => "pending",
    "members" => 0,
    "created_at" => date("Y-m-d")
])