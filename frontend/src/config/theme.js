import { createTheme } from '@mui/material';

// Colores exportados para uso en PDF y otros lugares
export const themeColors = {
  primary: { main: '#CC5629', light: '#e87446ff', dark: '#0F1F3D' },
  secondary: { main: '#C49A6C' },
  background: { default: '#F5F7FA', paper: '#FFFFFF' },
  success: { main: '#2E7D32' },
};

// Helper para convertir hex a RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

const theme = createTheme({
  palette: {
    ...themeColors,
    success: { ...themeColors.success, 50: '#E8F5E9', 100: '#C8E6C9', 200: '#A5D6A7' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', '&:hover': { boxShadow: '0 2px 8px rgba(27,54,93,0.15)' } },
      },
    },
  },
});

export default theme;
