<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$cluster_id = (int)($data['cluster_id'] ?? 0);
$employee_id = (int)($data['employee_id'] ?? 0);

if ($cluster_id === 0 || $employee_id === 0) {
    http_response_code(400);
    exit(json_encode(["error" => "Missing cluster or employee."]));
}

$conn->query(
    "INSERT IGNORE INTO cluster_members (cluster_id, employee_id)
     VALUES ($cluster_id, $employee_id)"
);

$res = $conn->query(
    "SELECT id, fullname
     FROM users
     WHERE id=$employee_id AND role='employee'"
);

if (!$res || $res->num_rows === 0) {
    http_response_code(404);
    exit(json_encode(["error" => "Employee not found."]));
}

echo json_encode($res->fetch_assoc());