import React, { useEffect } from 'react';
import '../styles/image-modal.css';

const ImageModal = ({ isOpen, onClose, image }) => {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="image-modal-header">
          <h3>{image.nombre_archivo || image.nombre}</h3>
        </div>
        <div className="image-modal-body">
          <img 
            src={image.url || image.preview} 
            alt={image.nombre_archivo || image.nombre}
            className="image-modal-image"
            onError={(e) => {
              console.error('Error cargando imagen:', e);
              // Mostrar mensaje de error en lugar de imagen de respaldo
              e.target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.innerHTML = `
                <div style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 200px;
                  color: #666;
                  text-align: center;
                  padding: 20px;
                ">
                  <div style="font-size: 48px; margin-bottom: 10px;">📷</div>
                  <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Imagen no disponible</div>
                  <div style="font-size: 14px;">La imagen no se pudo cargar desde el servidor</div>
                </div>
              `;
              e.target.parentNode.appendChild(errorDiv);
            }}
          />
        </div>
        <div className="image-modal-footer">
          <p>Haz clic fuera de la imagen o presiona ESC para cerrar</p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
