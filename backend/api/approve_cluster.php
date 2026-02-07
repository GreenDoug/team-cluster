<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("admin");

$data = json_decode(file_get_contents("php://input"), true);
$id = (int)$data['cluster_id'];
$status = $data['status']; // active | rejected

$conn->query(
    "UPDATE clusters SET status='$status' WHERE id=$id"
);

echo json_encode(["success" => true]);