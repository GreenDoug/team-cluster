<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("admin");

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$id = (int)($data['cluster_id'] ?? 0);
$status = $data['status'] ?? ""; // active | rejected
$rejection_reason = trim($data['rejection_reason'] ?? "");

if ($id <= 0 || !in_array($status, ["active", "rejected"], true)) {
    http_response_code(422);
    exit(json_encode(["error" => "Invalid cluster status update request."]));
}

if ($status === "rejected" && $rejection_reason === "") {
    http_response_code(422);
    exit(json_encode(["error" => "Rejection reason is required."]));
}

$safe_reason = $conn->real_escape_string($rejection_reason);

if ($status === "rejected") {
    $ok = $conn->query(
        "UPDATE clusters
         SET status='rejected', rejection_reason='$safe_reason'
         WHERE id=$id"
    );
} else {
    $ok = $conn->query(
        "UPDATE clusters
         SET status='active', rejection_reason=NULL
         WHERE id=$id"
    );
}

if ($ok !== true) {
    http_response_code(500);
    exit(json_encode(["error" => "Failed to update cluster status."]));
}

echo json_encode(["success" => true]);