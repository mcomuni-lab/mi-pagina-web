<?php
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

// OBTENER todas las ventajas
if ($method === 'GET') {
    $conn = conectar();
    $result = $conn->query('SELECT * FROM ventajas ORDER BY orden ASC');
    $data = [];
    while ($row = $result->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    $conn->close();
}

// GUARDAR ventajas (reemplaza todas)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $conn = conectar();
    $conn->query('DELETE FROM ventajas');
    $stmt = $conn->prepare('INSERT INTO ventajas (icono, titulo, descripcion, orden) VALUES (?, ?, ?, ?)');
    foreach ($input as $i => $item) {
        $stmt->bind_param('sssi', $item['icono'], $item['titulo'], $item['descripcion'], $i);
        $stmt->execute();
    }
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}

// ELIMINAR una ventaja por ID
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    $conn = conectar();
    $stmt = $conn->prepare('DELETE FROM ventajas WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}