<?php
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];
$tipo = $_GET['tipo'] ?? 'items'; // ?tipo=categorias o ?tipo=items

// OBTENER
if ($method === 'GET') {
    $conn = conectar();
    if ($tipo === 'categorias') {
        $result = $conn->query('SELECT * FROM portafolio_categorias ORDER BY orden ASC');
    } else {
        $result = $conn->query('SELECT * FROM portafolio_items ORDER BY orden ASC');
    }
    $data = [];
    while ($row = $result->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    $conn->close();
}

// GUARDAR
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $conn = conectar();

    if ($tipo === 'categorias') {
        $conn->query('DELETE FROM portafolio_categorias');
        $stmt = $conn->prepare('INSERT INTO portafolio_categorias (clave, etiqueta, orden) VALUES (?, ?, ?)');
        foreach ($input as $i => $item) {
            $stmt->bind_param('ssi', $item['clave'], $item['etiqueta'], $i);
            $stmt->execute();
        }
    } else {
        $conn->query('DELETE FROM portafolio_items');
        $stmt = $conn->prepare('INSERT INTO portafolio_items (categoria_clave, titulo, imagen_url, orden) VALUES (?, ?, ?, ?)');
        foreach ($input as $i => $item) {
            $stmt->bind_param('sssi', $item['categoria_clave'], $item['titulo'], $item['imagen_url'], $i);
            $stmt->execute();
        }
    }

    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}

// ELIMINAR por ID
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    $conn = conectar();
    $tabla = ($tipo === 'categorias') ? 'portafolio_categorias' : 'portafolio_items';
    $stmt = $conn->prepare("DELETE FROM $tabla WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['ok' => true]);
    $stmt->close();
    $conn->close();
}