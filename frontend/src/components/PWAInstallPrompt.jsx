import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, IconButton } from '@mui/material';
import { Close, IosShare, AddBox } from '@mui/icons-material';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if not standalone, is iOS, and not recently dismissed
    if (!standalone && iOS && daysSinceDismissed > 7) {
      // Delay showing prompt for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone || !isIOS) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        left: 16,
        right: 16,
        zIndex: 9999,
        borderRadius: 3,
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
        '@keyframes slideUp': {
          from: { transform: 'translateY(100%)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      }}
    >
      <Box sx={{ p: 2.5, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
            Instala esta aplicación
          </Typography>
          <IconButton size="small" onClick={handleDismiss} sx={{ mt: -0.5, mr: -0.5 }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Añade Entrega Digital a tu pantalla de inicio para una mejor experiencia.
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 0.5,
          }}>
            <Box sx={{ 
              p: 1, 
              bgcolor: 'primary.main', 
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IosShare sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
              1
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ flex: 1 }}>
            Toca el botón <strong>Compartir</strong> en la barra de Safari
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          mt: 1,
          bgcolor: 'grey.50', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 0.5,
          }}>
            <Box sx={{ 
              p: 1, 
              bgcolor: 'primary.main', 
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AddBox sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
              2
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ flex: 1 }}>
            Selecciona <strong>"Añadir a pantalla de inicio"</strong>
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleDismiss}
          sx={{ 
            mt: 2, 
            py: 1.2, 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Entendido
        </Button>
      </Box>
    </Paper>
  );
}
