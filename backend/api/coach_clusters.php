<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$res = $conn->query(
"SELECT c.id,
            c.name,
            c.description,
            c.status,
            c.created_at,
            c.rejection_reason,
            COUNT(cm.employee_id) AS members
     FROM clusters c
     LEFT JOIN cluster_members cm ON cm.cluster_id = c.id
     WHERE c.coach_id = {$_SESSION['user']['id']}
     GROUP BY c.id
     ORDER BY c.created_at DESC"
);

$clusters = [];
while ($row = $res->fetch_assoc()) {
    $clusters[] = $row;
}

echo json_encode($clusters);