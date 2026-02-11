<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$cluster_id = (int)($data["cluster_id"] ?? 0);
$coach_id = (int)$_SESSION["user"]["id"];

if ($cluster_id === 0) {
    http_response_code(400);
    exit(json_encode(["error" => "Invalid cluster request."]));
}

$cluster_check = $conn->query(
    "SELECT id FROM clusters WHERE id = $cluster_id AND coach_id = $coach_id LIMIT 1"
);

if (!$cluster_check || $cluster_check->num_rows === 0) {
    http_response_code(403);
    exit(json_encode(["error" => "Not authorized to disband this cluster."]));
}

$deleted = $conn->query("DELETE FROM clusters WHERE id = $cluster_id");

if ($deleted !== true) {
    http_response_code(500);
    exit(json_encode(["error" => "Unable to disband cluster."]));
}

echo json_encode(["success" => true]);