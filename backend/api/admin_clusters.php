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
            c.rejection_reason,
            COALESCE(u.fullname, 'Unknown') AS coach,
            COUNT(cm.employee_id) members
     FROM clusters c
     LEFT JOIN users u ON c.coach_id = u.id
     LEFT JOIN cluster_members cm ON c.id = cm.cluster_id
     GROUP BY c.id, c.name, c.description, c.created_at, c.status, c.rejection_reason, coach
     ORDER BY c.created_at DESC"
);

if ($res === false) {
    http_response_code(500);
    exit(json_encode(["error" => "Failed to load clusters."]));
}

$out = [];
while ($r = $res->fetch_assoc()) {
    $out[] = $r;
}

echo json_encode($out);