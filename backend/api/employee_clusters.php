<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("employee");

$res = $conn->query(
    "SELECT
        c.name cluster_name,
        u.fullname coach_name,
        s.schedule
     FROM cluster_members cm
     JOIN clusters c ON cm.cluster_id=c.id
     JOIN users u ON c.coach_id=u.id
     LEFT JOIN schedules s
        ON s.cluster_id=c.id
        AND s.employee_id=cm.employee_id
     WHERE cm.employee_id={$_SESSION['user']['id']}
     AND c.status='active'"
);

$out = [];
while ($r = $res->fetch_assoc()) {
    $out[] = $r;
}
echo json_encode($out);