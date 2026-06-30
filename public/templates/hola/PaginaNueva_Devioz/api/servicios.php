<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $conn = conectar();
    $result = $conn->query("SELECT * FROM servicios ORDER BY orden ASC");
    $data = [];
    while ($row = $result->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    $conn->close();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $conn = conectar();
    $conn->query("DELETE FROM servicios");
    $stmt = $conn->prepare("INSERT INTO servicios (icono, numero, nombre, orden) VALUES (?, ?, ?, ?)");
    foreach ($input as $i => $item) {
        $stmt->bind_param('sssi', $item['icon'], $item['num'], $item['name'], $i);
        $stmt->execute();
    }
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}