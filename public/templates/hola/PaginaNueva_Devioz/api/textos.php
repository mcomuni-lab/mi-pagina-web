<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $conn = conectar();
    $result = $conn->query("SELECT clave, valor FROM textos");
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[$row['clave']] = $row['valor'];
    }
    echo json_encode($data);
    $conn->close();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $conn = conectar();
    $stmt = $conn->prepare("INSERT INTO textos (clave, valor) VALUES (?, ?) 
                            ON DUPLICATE KEY UPDATE valor = VALUES(valor)");
    foreach ($input as $clave => $valor) {
        $stmt->bind_param('ss', $clave, $valor);
        $stmt->execute();
    }
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}