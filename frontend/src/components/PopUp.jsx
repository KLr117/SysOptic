import React from 'react';
import '../styles/popup.css';

const PopUp = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success', // success, error, warning, info
  showButtons = true,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  // Auto cerrar si está habilitado
  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  // Cerrar con tecla Escape
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <div className={`popup-header popup-${type}`}>
          <div className="popup-icon">
            {getIcon()}
          </div>
          <h3 className="popup-title">{title}</h3>
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="popup-body">
          <p className="popup-message">{message}</p>
        </div>
        
        {showButtons && (
          <div className="popup-footer">
            <button 
              className="popup-btn popup-btn-primary" 
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
            {onCancel && (
              <button 
                className="popup-btn popup-btn-cancel-red" 
                onClick={handleCancel}
              >
                {cancelText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopUp;
