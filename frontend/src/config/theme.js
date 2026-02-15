import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1B365D', light: '#2D5A9E', dark: '#0F1F3D' },
    secondary: { main: '#C49A6C' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    success: { main: '#2E7D32', 50: '#E8F5E9', 100: '#C8E6C9', 200: '#A5D6A7' },
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
