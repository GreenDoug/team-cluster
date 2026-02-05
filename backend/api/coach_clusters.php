<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$res = $conn->query(
    "SELECT id, name, status
     FROM clusters
     WHERE coach_id = {$_SESSION['user']['id']}
     ORDER BY created_at DESC"
);

$clusters = [];
while ($row = $res->fetch_assoc()) {
    $clusters[] = $row;
}

echo json_encode($clusters);