import React, { useEffect, useState } from 'react';
import '../styles/image-modal.css';

const ImageModal = ({ isOpen, onClose, image, images = [], currentIndex = 0 }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentImgIndex, setCurrentImgIndex] = useState(currentIndex);

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

  // Actualizar índice cuando cambia la imagen
  useEffect(() => {
    if (image && images.length > 0) {
      const index = images.findIndex(img => 
        (img.id === image.id) || 
        (img.url === image.url) || 
        (img.preview === image.preview)
      );
      if (index !== -1) {
        setCurrentImgIndex(index);
      }
    }
  }, [image, images]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || images.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, currentImgIndex]);

  const goToNext = () => {
    if (images.length > 0) {
      const nextIndex = (currentImgIndex + 1) % images.length;
      setCurrentImgIndex(nextIndex);
      resetZoom();
    }
  };

  const goToPrevious = () => {
    if (images.length > 0) {
      const prevIndex = currentImgIndex === 0 ? images.length - 1 : currentImgIndex - 1;
      setCurrentImgIndex(prevIndex);
      resetZoom();
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen || !image) return null;

  const currentImage = images.length > 0 ? images[currentImgIndex] : image;
  const canNavigate = images.length > 1;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          ✕
        </button>
        
        <div className="image-modal-header">
          <h3>{currentImage.nombre_archivo || currentImage.nombre}</h3>
          {canNavigate && (
            <div className="image-counter">
              {currentImgIndex + 1} de {images.length}
            </div>
          )}
        </div>

        <div className="image-modal-body">
          {/* Navegación izquierda */}
          {canNavigate && (
            <button 
              className="image-nav-btn image-nav-left"
              onClick={goToPrevious}
              title="Imagen anterior (←)"
            >
              ‹
            </button>
          )}

          {/* Contenedor de imagen con zoom */}
          <div 
            className="image-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          >
            <img 
              src={currentImage.url || currentImage.preview} 
              alt={currentImage.nombre_archivo || currentImage.nombre}
              className="image-modal-image"
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease'
              }}
              onError={(e) => {
                console.error('Error cargando imagen:', e);
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

          {/* Navegación derecha */}
          {canNavigate && (
            <button 
              className="image-nav-btn image-nav-right"
              onClick={goToNext}
              title="Imagen siguiente (→)"
            >
              ›
            </button>
          )}
        </div>

        {/* Controles de zoom */}
        <div className="image-controls">
          <button 
            className="zoom-btn zoom-out"
            onClick={handleZoomOut}
            title="Alejar (-)"
          >
            −
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button 
            className="zoom-btn zoom-in"
            onClick={handleZoomIn}
            title="Acercar (+)"
          >
            +
          </button>
          <button 
            className="zoom-btn zoom-reset"
            onClick={resetZoom}
            title="Tamaño original"
          >
            ⌂
          </button>
        </div>

        <div className="image-modal-footer">
          <p>
            {canNavigate ? 'Usa las flechas ← → para navegar' : ''} 
            {canNavigate && zoom > 1 ? ' • ' : ''}
            {zoom > 1 ? 'Arrastra para mover la imagen' : ''}
            {!canNavigate && zoom <= 1 ? 'Haz clic fuera de la imagen o presiona ESC para cerrar' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
