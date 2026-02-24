import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';

/**
 * MobileModal - Componente de modal optimizado para móviles
 * 
 * Características:
 * - Ajusta el contenido cuando aparece el teclado virtual
 * - Usa visualViewport API para detectar cambios de viewport
 * - Footer sticky que siempre permanece visible
 * - Soporte para Enter para enviar (en inputs, no en textareas)
 */
export default function MobileModal({
  open,
  onClose,
  title,
  children,
  actions,
  onSubmit,
  maxWidth = 'sm',
  fullWidth = true,
  ...props
}) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Detectar cambios en el viewport (teclado virtual)
  useEffect(() => {
    if (!open) return;

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const diff = windowHeight - viewportHeight;
        
        // Si hay una diferencia significativa, el teclado está abierto
        if (diff > 100) {
          setKeyboardHeight(diff);
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    // Usar visualViewport si está disponible
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
    }

    // Fallback: detectar focus en inputs
    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Dar tiempo al teclado para aparecer
        setTimeout(() => {
          if (window.visualViewport) {
            handleViewportResize();
          } else {
            // Fallback para navegadores sin visualViewport
            setKeyboardHeight(300); // Estimación
          }
        }, 300);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        setKeyboardHeight(0);
      }, 100);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [open]);

  // Manejar Enter para enviar (solo en inputs, no en textareas)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && onSubmit) {
      const target = e.target;
      
      // No enviar si es textarea (permite multilinea)
      if (target.tagName === 'TEXTAREA') {
        return;
      }
      
      // No enviar si es un input con type que no debería enviar
      if (target.tagName === 'INPUT') {
        const type = target.type?.toLowerCase();
        if (type === 'button' || type === 'submit' || type === 'reset') {
          return;
        }
      }
      
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      onKeyDown={handleKeyDown}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: keyboardHeight > 0 
            ? `calc(100vh - ${keyboardHeight}px - 32px)` 
            : 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'max-height 0.2s ease',
          // Asegurar que el modal no se salga de la pantalla
          margin: keyboardHeight > 0 ? '16px' : '32px',
          marginBottom: keyboardHeight > 0 ? `${keyboardHeight + 16}px` : '32px',
        },
      }}
      {...props}
    >
      {title && (
        <DialogTitle sx={{ pb: 1, flexShrink: 0 }}>
          {title}
        </DialogTitle>
      )}
      
      <DialogContent
        sx={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          pb: 1,
        }}
      >
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            pt: 1,
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'grey.100',
            bgcolor: 'background.paper',
            // Sticky footer
            position: 'sticky',
            bottom: 0,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

/**
 * Hook para usar en modales existentes
 * Retorna props para aplicar a un Dialog de MUI
 */
export function useMobileModalProps(open, onSubmit) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!open) {
      setKeyboardHeight(0);
      return;
    }

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const diff = windowHeight - viewportHeight;
        
        if (diff > 100) {
          setKeyboardHeight(diff);
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
    }

    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          if (window.visualViewport) {
            handleViewportResize();
          } else {
            setKeyboardHeight(300);
          }
        }, 300);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => setKeyboardHeight(0), 100);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [open]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && onSubmit) {
      if (e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit]);

  return {
    keyboardHeight,
    onKeyDown: handleKeyDown,
    PaperProps: {
      sx: {
        borderRadius: 3,
        maxHeight: keyboardHeight > 0 
          ? `calc(100vh - ${keyboardHeight}px - 32px)` 
          : 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'max-height 0.2s ease',
        margin: keyboardHeight > 0 ? '16px' : '32px',
        marginBottom: keyboardHeight > 0 ? `${keyboardHeight + 16}px` : '32px',
      },
    },
  };
}
