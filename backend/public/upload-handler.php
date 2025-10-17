<?php
header('Content-Type: application/json');

// === CONFIGURACIÓN ===
$upload_base = __DIR__ . '/uploads/';
$allowed_ext = ['jpg','jpeg','png','gif','webp'];
$token_env = 'sysoptic_secret'; // debe coincidir con UPLOAD_TOKEN del .env
$max_width = 1920; // tamaño máximo de redimensionado
$jpeg_quality = 85; // calidad de compresión

// === VALIDAR TOKEN ===
if (!isset($_POST['token']) || $_POST['token'] !== $token_env) {
  http_response_code(403);
  echo json_encode(['success' => false, 'message' => 'Acceso no autorizado.']);
  exit;
}

// === VALIDAR ARCHIVO ===
if (!isset($_FILES['file'])) {
  echo json_encode(['success' => false, 'message' => 'No se recibió archivo.']);
  exit;
}

$file = $_FILES['file'];
$folder = $_POST['folder'] ?? 'expedientes';
$target_dir = $upload_base . $folder . '/';

// Crear carpeta si no existe
if (!is_dir($target_dir)) mkdir($target_dir, 0755, true);

// Validar extensión
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowed_ext)) {
  echo json_encode(['success' => false, 'message' => 'Tipo de archivo no permitido.']);
  exit;
}

// Crear nombre único
$filename = uniqid('img_', true) . '.webp';
$target_path = $target_dir . $filename;

// === PROCESAR IMAGEN ===
try {
  $image_info = getimagesize($file['tmp_name']);
  if (!$image_info) throw new Exception('No es una imagen válida.');

  [$width, $height] = $image_info;
  $ratio = $width / $height;

  // Redimensionar si excede el tamaño máximo
  if ($width > $max_width || $height > $max_width) {
    if ($width > $height) {
      $new_width = $max_width;
      $new_height = intval($max_width / $ratio);
    } else {
      $new_height = $max_width;
      $new_width = intval($max_width * $ratio);
    }
  } else {
    $new_width = $width;
    $new_height = $height;
  }

  // Crear imagen desde archivo original
  switch ($ext) {
    case 'jpg':
    case 'jpeg':
      $src = imagecreatefromjpeg($file['tmp_name']);
      break;
    case 'png':
      $src = imagecreatefrompng($file['tmp_name']);
      imagepalettetotruecolor($src);
      imagealphablending($src, true);
      imagesavealpha($src, true);
      break;
    case 'gif':
      $src = imagecreatefromgif($file['tmp_name']);
      break;
    case 'webp':
      $src = imagecreatefromwebp($file['tmp_name']);
      break;
    default:
      throw new Exception('Formato no soportado.');
  }

  // Redimensionar
  $dst = imagecreatetruecolor($new_width, $new_height);
  imagecopyresampled($dst, $src, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

  // Convertir a WebP con compresión
  if (!imagewebp($dst, $target_path, $jpeg_quality)) {
    throw new Exception('Error al generar archivo WebP.');
  }

  imagedestroy($src);
  imagedestroy($dst);

  // Construir URL pública
  $public_url = "https://" . $_SERVER['HTTP_HOST'] . "/uploads/$folder/$filename";

  echo json_encode([
    'success' => true,
    'url' => $public_url,
    'optimized' => true,
    'width' => $new_width,
    'height' => $new_height
  ]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error al procesar imagen: ' . $e->getMessage()]);
}
?>
