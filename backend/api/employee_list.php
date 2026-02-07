<?php
include "../config/database.php";
include "../config/auth.php";
requireRole("coach");

$res = $conn->query(
    "SELECT id, fullname
     FROM users
     WHERE role='employee'
     ORDER BY fullname ASC"
);

$employees = [];
while ($row = $res->fetch_assoc()) {
    $employees[] = $row;
}

echo json_encode($employees);