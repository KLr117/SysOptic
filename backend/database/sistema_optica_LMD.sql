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
('Usuario', 'Administrador', 'SuperUser_SysOp', '$2b$10$oeEKdk4ajP/m9wG23wdDuOg8n/qDMa66inQw9yM4vn/CcteQ1/.1O', 1);          -- Rol Administrador

-- ==============================================
-- INSERTS DE PERMISOS
-- ==============================================
INSERT INTO tbl_permisos (nombre_permiso, descripcion) VALUES
('control_expedientes', 'Acceso completo al módulo de expedientes'),
('control_ordenes', 'Acceso completo al módulo de órdenes de trabajo'),
('control_notificaciones', 'Acceso completo al módulo de notificaciones'),
('control_admin', 'Acceso completo al panel administrativo y gestión de usuarios');

-- ==============================================
-- INSERTS DE: ROLES_PERMISOS
-- ==============================================

-- Rol 1: Administrador → todos los permisos
INSERT INTO tbl_roles_permisos (fk_id_role, fk_id_permiso)
SELECT 1, pk_id_permiso FROM tbl_permisos;

-- Rol 2: Optometrista → solo expedientes
INSERT INTO tbl_roles_permisos (fk_id_role, fk_id_permiso)
SELECT 2, pk_id_permiso FROM tbl_permisos
WHERE nombre_permiso IN ('control_expedientes');

-- Rol 3: Atención Órdenes → solo órdenes
INSERT INTO tbl_roles_permisos (fk_id_role, fk_id_permiso)
SELECT 3, pk_id_permiso FROM tbl_permisos
WHERE nombre_permiso IN ('control_ordenes');

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