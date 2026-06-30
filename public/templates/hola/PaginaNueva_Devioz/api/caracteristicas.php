<?php
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

// OBTENER todas las características
if ($method === 'GET') {
    $conn = conectar();
    $result = $conn->query('SELECT * FROM caracteristicas ORDER BY orden ASC');
    $data = [];
    while ($row = $result->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    $conn->close();
}

// GUARDAR características (reemplaza todas)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $conn = conectar();
    $conn->query('DELETE FROM caracteristicas');
    $stmt = $conn->prepare('INSERT INTO caracteristicas (etiqueta, titulo, imagen_url, orden) VALUES (?, ?, ?, ?)');
    foreach ($input as $i => $item) {
        $stmt->bind_param('sssi', $item['etiqueta'], $item['titulo'], $item['imagen_url'], $i);
        $stmt->execute();
    }
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}

// ELIMINAR una característica por ID
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    $conn = conectar();
    $stmt = $conn->prepare('DELETE FROM caracteristicas WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}