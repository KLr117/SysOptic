-- ==============================================
-- CREAR BASE DE DATOS
-- ==============================================
CREATE DATABASE IF NOT EXISTS sistema_optica;
USE sistema_optica;

-- ==============================================
-- TABLAS DE CATÁLOGOS
-- ==============================================
CREATE TABLE tbl_roles (
    pk_id_role INT AUTO_INCREMENT PRIMARY KEY,
    nombre_role VARCHAR(50) NOT NULL
);

CREATE TABLE tbl_tipos_notificacion (
    pk_id_tipo_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL -- Ej: general, especifica
);

CREATE TABLE tbl_modulos_notificacion (
    pk_id_modulo_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_modulo VARCHAR(50) NOT NULL -- Ej: expedientes, ordenes
);

CREATE TABLE tbl_estados_notificacion (
    pk_id_estado_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL -- Ej: pendiente, atendida, cancelada
);

-- Permisos disponibles en el sistema
CREATE TABLE tbl_permisos (
    pk_id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_permiso VARCHAR(100) NOT NULL, -- Ej: ver_expedientes, crear_expedientes
    descripcion VARCHAR(255)
);

-- ==============================================
-- TABLAS PRINCIPALES - MAESTRAS
-- ==============================================
CREATE TABLE tbl_users (
    pk_id_user INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fk_id_role INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_id_role) REFERENCES tbl_roles(pk_id_role)
);

CREATE TABLE tbl_expedientes (
    pk_id_expediente INT AUTO_INCREMENT PRIMARY KEY,
    correlativo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    email VARCHAR(100),
    fecha_registro DATE NOT NULL
);

CREATE TABLE tbl_ordenes (
    pk_id_orden INT AUTO_INCREMENT PRIMARY KEY,
    correlativo VARCHAR(50) NOT NULL UNIQUE,
    paciente VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    correo VARCHAR(100),
    telefono VARCHAR(20),
    fecha_recepcion DATE,
    fecha_entrega DATE,
    total DECIMAL(10,2),
    adelanto DECIMAL(10,2),
    saldo DECIMAL(10,2)
);

CREATE TABLE tbl_notificaciones (
    pk_id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- fecha en que se creó la configuración
    fecha_objetivo DATE, -- fecha objetivo base para el cálculo de notificaciones
    intervalo_dias INT, -- intervalo configurable en días para disparar notificaciones
    fk_id_tipo_notificacion INT NOT NULL,
    fk_id_modulo_notificacion INT NOT NULL,
    fk_id_estado_notificacion INT NOT NULL DEFAULT 1, -- pendiente por defecto
    fk_id_expediente INT,
    fk_id_orden INT,
    FOREIGN KEY (fk_id_tipo_notificacion) REFERENCES tbl_tipos_notificacion(pk_id_tipo_notificacion),
    FOREIGN KEY (fk_id_modulo_notificacion) REFERENCES tbl_modulos_notificacion(pk_id_modulo_notificacion),
    FOREIGN KEY (fk_id_estado_notificacion) REFERENCES tbl_estados_notificacion(pk_id_estado_notificacion),
    FOREIGN KEY (fk_id_expediente) REFERENCES tbl_expedientes(pk_id_expediente),
    FOREIGN KEY (fk_id_orden) REFERENCES tbl_ordenes(pk_id_orden)
);

-- ==============================================
-- TABLAS TRANSACCIONALES
-- ==============================================
CREATE TABLE tbl_bitacora (
    pk_id_bitacora INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_user INT NOT NULL, -- usuario que realizó la acción
    accion VARCHAR(255) NOT NULL, -- descripción de la acción realizada
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fk_id_user_objetivo INT, -- opcional, usuario afectado por la acción
    fk_id_expediente INT, -- opcional, expediente afectado
    fk_id_orden INT, -- opcional, orden afectada
    fk_id_notificacion INT, -- opcional, notificación afectada
    FOREIGN KEY (fk_id_user) REFERENCES tbl_users(pk_id_user),
    FOREIGN KEY (fk_id_user_objetivo) REFERENCES tbl_users(pk_id_user),
    FOREIGN KEY (fk_id_expediente) REFERENCES tbl_expedientes(pk_id_expediente),
    FOREIGN KEY (fk_id_orden) REFERENCES tbl_ordenes(pk_id_orden),
    FOREIGN KEY (fk_id_notificacion) REFERENCES tbl_notificaciones(pk_id_notificacion)
);

-- ============================
-- TABLAS DE PERMISOS
-- ============================

-- Relación rol-permiso (qué permisos tiene cada rol por defecto)
CREATE TABLE tbl_roles_permisos (
    pk_id_role_permiso INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_role INT NOT NULL,
    fk_id_permiso INT NOT NULL,
    FOREIGN KEY (fk_id_role) REFERENCES tbl_roles(pk_id_role),
    FOREIGN KEY (fk_id_permiso) REFERENCES tbl_permisos(pk_id_permiso),
    UNIQUE(fk_id_role, fk_id_permiso)
);

-- Relación usuario-permiso (excepciones o permisos personalizados)
CREATE TABLE tbl_users_permisos (
    pk_id_user_permiso INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_user INT NOT NULL,
    fk_id_permiso INT NOT NULL,
    estado_permiso ENUM('otorgado', 'revocado') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_id_user) REFERENCES tbl_users(pk_id_user),
    FOREIGN KEY (fk_id_permiso) REFERENCES tbl_permisos(pk_id_permiso),
    UNIQUE(fk_id_user, fk_id_permiso)
);


-- ==============================================
-- ACTUALIZACIONES/MODIFICACIONES AL LDD
-- ==============================================



-- ==============================================
-- NUEVA TABLA CATALOGO DE CATEGORÍAS DE NOTIFICACIÓN
-- ==============================================
CREATE TABLE tbl_categorias_notificacion (
    pk_id_categoria_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL -- Ej: recordatorio, promocion
);

-- ==============================================
-- ALTERS PARA TABLA tbl_notificaciones
-- ==============================================

-- Categoría de notificación
ALTER TABLE tbl_notificaciones
ADD COLUMN fk_id_categoria_notificacion INT AFTER intervalo_dias,
ADD CONSTRAINT fk_notificacion_categoria
  FOREIGN KEY (fk_id_categoria_notificacion)
  REFERENCES tbl_categorias_notificacion(pk_id_categoria_notificacion);

-- Fecha fin (para promociones)
ALTER TABLE tbl_notificaciones
ADD COLUMN fecha_fin DATE NULL AFTER fecha_objetivo;

-- Campos para envío de correo
ALTER TABLE tbl_notificaciones
ADD COLUMN enviar_email TINYINT(1) NOT NULL DEFAULT 1 AFTER fecha_fin,
ADD COLUMN asunto_email VARCHAR(150) NULL AFTER enviar_email,
ADD COLUMN cuerpo_email TEXT NULL AFTER asunto_email;

-- 1) Nueva columna para modo legible de intervalo
ALTER TABLE tbl_notificaciones
ADD COLUMN tipo_intervalo ENUM('despues_registro','antes_entrega','despues_recepcion')
NOT NULL DEFAULT 'despues_registro'
AFTER intervalo_dias;

-- 2) Normalizar filas existentes según módulo:
--   1 = Expedientes, 2 = Ordenes  
UPDATE tbl_notificaciones
SET tipo_intervalo = 'despues_recepcion'
WHERE fk_id_modulo_notificacion = 2
  AND tipo_intervalo = 'despues_registro';

ALTER TABLE tbl_notificaciones
ALTER COLUMN fk_id_estado_notificacion SET DEFAULT 1;

ALTER TABLE tbl_notificaciones
MODIFY COLUMN tipo_intervalo ENUM('despues_registro','antes_entrega','despues_recepcion')
NULL DEFAULT NULL;

-- ==============================================
--  TABLA para control de notificaciones enviadas
-- ==============================================

CREATE TABLE IF NOT EXISTS tbl_notificaciones_enviadas (
  pk_id_envio INT AUTO_INCREMENT PRIMARY KEY,
  fk_id_notificacion INT NOT NULL,
  correo_destino VARCHAR(150) NOT NULL,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Evita envíos duplicados de la misma notificación al mismo correo
  UNIQUE KEY unique_envio (fk_id_notificacion, correo_destino),

  -- Acelera búsquedas por correo
  INDEX idx_correo (correo_destino),

  -- Mantiene integridad referencial
  CONSTRAINT fk_notificacion_envio
    FOREIGN KEY (fk_id_notificacion)
    REFERENCES tbl_notificaciones(pk_id_notificacion)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- ==============================================================
--  TABLA para imágenes asociadas a órdenes + Alter a tbl_ordenes
-- ==============================================================
ALTER TABLE tbl_ordenes 
ADD COLUMN imagenes BOOLEAN DEFAULT FALSE AFTER saldo;
CREATE TABLE tbl_imagenes_ordenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orden_id INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(500) NOT NULL,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_id) REFERENCES tbl_ordenes(pk_id_orden) ON DELETE CASCADE
);

-- ==============================================================
--  TABLA para imágenes asociadas a expedientes + Alter a tbl_expedientes
-- ==============================================================
ALTER TABLE tbl_expedientes 
ADD COLUMN fotos  TEXT AFTER fecha_registro; -- agrege fotos y no imagenes

CREATE TABLE tbl_imagenes_expedientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expediente_id INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(500) NOT NULL,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expediente_id) REFERENCES tbl_expedientes(pk_id_expediente) ON DELETE CASCADE
);

-- ==============================================================
--  CAMBIOS PARA BITACORA QUE IMPIDEN ELIMINACION DE USUARIOS EN SU CRUD
-- ==============================================================
ALTER TABLE tbl_bitacora 
MODIFY COLUMN fk_id_user INT NULL;

-- 1️⃣ Eliminar las restricciones antiguas
ALTER TABLE tbl_bitacora DROP FOREIGN KEY tbl_bitacora_ibfk_1;
ALTER TABLE tbl_bitacora DROP FOREIGN KEY tbl_bitacora_ibfk_2;

-- 2️⃣ Volver a crearlas con ON DELETE SET NULL
ALTER TABLE tbl_bitacora
ADD CONSTRAINT fk_bitacora_user
  FOREIGN KEY (fk_id_user)
  REFERENCES tbl_users(pk_id_user)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE tbl_bitacora
ADD CONSTRAINT fk_bitacora_user_objetivo
  FOREIGN KEY (fk_id_user_objetivo)
  REFERENCES tbl_users(pk_id_user)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- ====================================
-- agregadas en expedientes e imagenes
-- ====================================
ALTER TABLE tbl_expedientes
ENGINE = InnoDB,
CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

ALTER TABLE tbl_imagenes_expedientes
ADD INDEX expediente_id (expediente_id);
SELECT * FROM tbl_imagenes_expedientes;