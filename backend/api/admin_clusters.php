<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("admin");

$res = $conn->query(
    "SELECT c.id, c.name, c.description, u.fullname coach
     FROM clusters c
     JOIN users u ON c.coach_id = u.id
     WHERE c.status='pending'"
);

$out = [];
while ($r = $res->fetch_assoc()) {
    $out[] = $r;
}

echo json_encode($out);