<?php
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $usuario = $input['usuario'] ?? '';
    $password = $input['password'] ?? '';

    $conn = conectar();
    $stmt = $conn->prepare('SELECT * FROM usuarios WHERE usuario = ?');
    $stmt->bind_param('s', $usuario);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $conn->close();

    if ($row && password_verify($password, $row['password_hash'])) {
        $_SESSION['admin'] = true;
        $_SESSION['usuario'] = $row['usuario'];
        echo json_encode(['ok' => true, 'usuario' => $row['usuario']]);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Usuario o contraseña incorrectos']);
    }
}

// Verificar si hay sesión activa
if ($method === 'GET') {
    session_start();
    if ($_SESSION['admin'] ?? false) {
        echo json_encode(['ok' => true, 'usuario' => $_SESSION['usuario']]);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false]);
    }
}