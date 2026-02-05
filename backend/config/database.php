<?php
$conn = new mysqli("localhost", "root", "", "cluster");
if ($conn->connect_error) {
    http_response_code(500);
    exit(json_encode(["error" => "DB connection failed"]));
}