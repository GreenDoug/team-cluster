<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$cluster_id = (int)$_GET['cluster_id'];

$res = $conn->query(
    "SELECT u.id, u.fullname, s.schedule
     FROM cluster_members cm
     JOIN users u ON cm.employee_id=u.id
     LEFT JOIN schedules s
        ON s.cluster_id=cm.cluster_id
        AND s.employee_id=cm.employee_id
     WHERE cm.cluster_id=$cluster_id"
);

$members = [];
while ($m = $res->fetch_assoc()) {
    $members[] = $m;
}

echo json_encode($members);