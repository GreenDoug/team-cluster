<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$data = json_decode(file_get_contents("php://input"), true);

$cluster_id = (int)$data['cluster_id'];
$employee_id = (int)$data['employee_id'];
$schedule = json_encode($data['schedule']);

$check = $conn->query(
    "SELECT id FROM schedules
     WHERE cluster_id=$cluster_id AND employee_id=$employee_id"
);

if ($check->num_rows > 0) {
    $conn->query(
        "UPDATE schedules
         SET schedule='$schedule'
         WHERE cluster_id=$cluster_id AND employee_id=$employee_id"
    );
} else {
    $conn->query(
        "INSERT INTO schedules (cluster_id, employee_id, schedule)
         VALUES ($cluster_id, $employee_id, '$schedule')"
    );
}

echo json_encode(["success" => true]);