<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();
session_destroy();

echo json_encode(['ok' => true, 'mensaje' => 'Sesión cerrada correctamente']);