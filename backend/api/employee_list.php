<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$res = $conn->query(
    "SELECT users.id, users.fullname
     FROM users
     LEFT JOIN cluster_members
       ON users.id = cluster_members.employee_id
     WHERE users.role='employee'
       AND cluster_members.employee_id IS NULL
     ORDER BY users.fullname ASC"
);

$employees = [];
while ($row = $res->fetch_assoc()) {
    $employees[] = $row;
}

echo json_encode($employees);