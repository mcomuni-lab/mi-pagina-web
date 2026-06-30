<?php
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

// OBTENER todos los productos
if ($method === 'GET') {
    $conn = conectar();
    $result = $conn->query('SELECT * FROM productos ORDER BY orden ASC');
    $data = [];
    while ($row = $result->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    $conn->close();
}

// GUARDAR productos (reemplaza todos)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $conn = conectar();
    $conn->query('DELETE FROM productos');
    $stmt = $conn->prepare('INSERT INTO productos (categoria, titulo, texto_destacado, fondo_css, orden) VALUES (?, ?, ?, ?, ?)');
    foreach ($input as $i => $item) {
        $stmt->bind_param('ssssi', $item['categoria'], $item['titulo'], $item['texto_destacado'], $item['fondo_css'], $i);
        $stmt->execute();
    }
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}

// ELIMINAR un producto por ID
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    $conn = conectar();
    $stmt = $conn->prepare('DELETE FROM productos WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}