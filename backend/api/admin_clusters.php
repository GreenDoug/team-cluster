<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("admin");

$res = $conn->query(
     "SELECT c.id,
            c.name,
            c.description,
            c.created_at,
            c.status,
            u.fullname coach,
            COUNT(cm.employee_id) members
     FROM clusters c
     JOIN users u ON c.coach_id = u.id
     LEFT JOIN cluster_members cm ON c.id = cm.cluster_id
     GROUP BY c.id, c.name, c.description, c.created_at, c.status, u.fullname
     ORDER BY c.created_at DESC"
);

$out = [];
while ($r = $res->fetch_assoc()) {
    $out[] = $r;
}

echo json_encode($out);