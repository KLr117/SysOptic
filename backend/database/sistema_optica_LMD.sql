-- ============================
-- DATOS INICIALES
-- ============================

-- ==============================================
-- INSERTS DE PRUEBA: ROLES
-- ==============================================
INSERT INTO tbl_roles (nombre_role) VALUES 
('Administrador'),
('Optometrista'),
('Atencion_ordenes');

-- ==============================================
-- INSERTS DE PRUEBA: USUARIOS
-- ==============================================
INSERT INTO tbl_users (first_name, last_name, username, password, fk_id_role)
VALUES 
('Kevin', 'L', 'admin', '$2b$10$xHDvN6J5jlf12BvV2wNCJulgjxOCuZV9dwnY92k659d6y932j6Aou', 1),          -- Rol Administrador
('Wendy', 'S', 'optometrista', '$2b$10$yyTcBQm9oj8l/hx2viaHie/qxwMpYVbi5qZZN29i5z0E/obQcDPQm', 2), 		-- Rol Optometrista
('Kateryn', 'DL', 'ordenes', '$2b$10$9QoKox00HuFQDGIvJwQNZuADotcPqgjB8XUp0lcZgr7wTlJU5nPmy', 3);       -- Rol Atención Ordenes

-- ==============================================
-- INSERTS DE PRUEBA: PERMISOS
-- ==============================================
INSERT INTO tbl_permisos (nombre_permiso, descripcion) VALUES
('ver_expedientes', 'Permite ver expedientes'),
('crear_expedientes', 'Permite crear expedientes'),
('ver_ordenes', 'Permite ver órdenes'),
('crear_ordenes', 'Permite crear órdenes'),
('ver_notificaciones', 'Permite ver notificaciones'),
('crear_notificaciones', 'Permite crear notificaciones'),
('administrar_usuarios', 'Permite administrar usuarios y roles');

-- ==============================================
-- INSERTS DE PRUEBA: ROLES_PERMISOS
-- ==============================================

-- Rol Administrador (todos los permisos)
INSERT INTO tbl_roles_permisos (fk_id_role, fk_id_permiso)
SELECT 1, pk_id_permiso FROM tbl_permisos;

-- Rol Optometrista (expedientes + notificaciones)
INSERT INTO tbl_roles_permisos (fk_id_role, fk_id_permiso)
SELECT 2, pk_id_permiso FROM tbl_permisos
WHERE nombre_permiso IN ('ver_expedientes','crear_expedientes','ver_notificaciones','crear_notificaciones');

-- Rol Atención Ordenes (órdenes + notificaciones)
INSERT INTO tbl_roles_permisos (fk_id_role, fk_id_permiso)
SELECT 3, pk_id_permiso FROM tbl_permisos
WHERE nombre_permiso IN ('ver_ordenes','crear_ordenes','ver_notificaciones','crear_notificaciones');

-- ==============================================
-- INSERTS: CATEGORIAS DE NOTIFICACION
-- ==============================================

-- Insertar categorías iniciales
INSERT INTO tbl_categorias_notificacion (nombre_categoria)
VALUES ('Recordatorio'), ('Promoción');

-- ==============================================
-- INSERTS: TIPOS DE NOTIFICACION
-- ==============================================

-- Insertar tipos de notificacion
INSERT INTO tbl_tipos_notificacion (nombre_tipo) VALUES ('General'), ('Específica');

-- ==============================================
-- INSERTS: MODULOS NOTIFICACION
-- ==============================================

INSERT INTO tbl_modulos_notificacion (nombre_modulo) VALUES ('Expedientes'), ('Ordenes');

-- ==============================================
-- INSERTS: ESTADOS NOTIFICACION
-- ==============================================

INSERT INTO tbl_estados_notificacion (nombre_estado) VALUES ('pendiente'), ('atendida'), ('cancelada');

-- ========================================
-- 🔄 Migración de estados de notificación
-- ========================================

-- 1️⃣ Actualiza nombres existentes
UPDATE tbl_estados_notificacion 
SET nombre_estado = 'activa' 
WHERE nombre_estado = 'pendiente';

UPDATE tbl_estados_notificacion 
SET nombre_estado = 'inactiva' 
WHERE nombre_estado = 'atendida';