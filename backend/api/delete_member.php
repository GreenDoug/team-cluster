<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$data = json_decode(file_get_contents("php://input"), true);
$cluster_id = (int)($data['cluster_id'] ?? 0);
$employee_id = (int)($data['employee_id'] ?? 0);
$coach_id = (int)$_SESSION['user']['id'];

if ($cluster_id === 0 || $employee_id === 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid member request."]);
    exit;
}

$cluster_check = $conn->query(
    "SELECT id FROM clusters WHERE id=$cluster_id AND coach_id=$coach_id"
);

if ($cluster_check->num_rows === 0) {
    http_response_code(403);
    echo json_encode(["error" => "Not authorized to update this cluster."]);
    exit;
}

$conn->query(
    "DELETE FROM schedules WHERE cluster_id=$cluster_id AND employee_id=$employee_id"
);

$conn->query(
    "DELETE FROM cluster_members WHERE cluster_id=$cluster_id AND employee_id=$employee_id"
);

echo json_encode(["success" => true]);