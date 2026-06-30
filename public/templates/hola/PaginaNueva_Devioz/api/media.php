<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

// Carpeta donde se guardan los archivos
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

if ($method === 'GET') {
    $conn = conectar();
    $result = $conn->query("SELECT * FROM media");
    $data = [];
    while ($row = $result->fetch_assoc()) $data[] = $row;
    echo json_encode($data);
    $conn->close();
}

if ($method === 'POST') {
    $clave = $_POST['clave'] ?? '';
    $tipo  = $_POST['tipo']  ?? 'imagen';
    $file  = $_FILES['archivo'] ?? null;

    if (!$clave || !$file) {
        echo json_encode(['error' => 'Faltan datos']); exit;
    }

    $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
    $nombre   = $clave . '_' . time() . '.' . $ext;
    $destino  = $uploadDir . $nombre;

    if (move_uploaded_file($file['tmp_name'], $destino)) {
        $conn = conectar();
        $ruta = 'uploads/' . $nombre;
        $stmt = $conn->prepare("INSERT INTO media (clave, tipo, archivo) VALUES (?, ?, ?)
                                ON DUPLICATE KEY UPDATE tipo=VALUES(tipo), archivo=VALUES(archivo)");
        $stmt->bind_param('sss', $clave, $tipo, $ruta);
        $stmt->execute();
        echo json_encode(['ok' => true, 'archivo' => $ruta]);
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(['error' => 'No se pudo subir el archivo']);
    }
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $clave = $input['clave'] ?? '';
    $conn  = conectar();
    $stmt  = $conn->prepare("SELECT archivo FROM media WHERE clave = ?");
    $stmt->bind_param('s', $clave);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if ($row && file_exists(__DIR__ . '/../' . $row['archivo'])) {
        unlink(__DIR__ . '/../' . $row['archivo']);
    }
    $conn->query("DELETE FROM media WHERE clave = '$clave'");
    echo json_encode(['ok' => true]);
    $conn->close();
}