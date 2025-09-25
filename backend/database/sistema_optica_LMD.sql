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
-- Ordenes
-- ==============================================

INSERT INTO tbl_ordenes (correlativo, paciente, direccion, correo, telefono, fecha_recepcion, fecha_entrega, total, adelanto, saldo)
VALUES 
('ORD-001', 'Juan Pérez', 'Calle 123', 'juan@example.com', '555-1234', '2025-09-01', '2025-09-07', 150.00, 50.00, 100.00),
('ORD-002', 'María López', 'Av. Central 456', 'maria@example.com', '555-5678', '2025-09-02', '2025-09-08', 200.00, 100.00, 100.00),
('ORD-003', 'Carlos Gómez', 'Zona 5, Guatemala', 'carlosg@example.com', '555-9876', '2025-09-03', '2025-09-10', 300.00, 150.00, 150.00),
('ORD-004', 'Ana Martínez', 'Calle Falsa 789', 'ana@example.com', '555-6543', '2025-09-04', '2025-09-11', 250.00, 100.00, 150.00),
('ORD-005', 'Luis Hernández', 'Boulevard 12', 'luis@example.com', '555-4321', '2025-09-05', '2025-09-12', 180.00, 80.00, 100.00);


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


