import { useState } from 'react';
import { Box, Button, Paper, Typography, CircularProgress } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { getContractText } from '../utils/contractTemplate';

export default function ContractPreview({ formData, onNext, onBack }) {
  const [loading, setLoading] = useState(false);
  const sections = getContractText(formData);

  const handleContinue = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 600);
  };

  return (
    <Box>
      <Paper
        elevation={2}
        sx={{
          maxWidth: 720,
          mx: 'auto',
          p: { xs: 3, md: 5 },
          borderRadius: 2,
          bgcolor: '#fff',
          minHeight: 900,
          position: 'relative',
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            bgcolor: 'primary.main',
            borderRadius: '8px 8px 0 0',
          },
        }}
      >
        {/* Watermark-style background */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-35deg)',
            fontSize: '5rem',
            fontWeight: 900,
            color: 'rgba(27, 54, 93, 0.03)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          HACIENDA DEL MONTE
        </Box>

        {sections.map((section, index) => {
          if (section.title === 'ACTA DE ENTREGA-RECEPCIÓN DE VIVIENDA') {
            return (
              <Box key={index} sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    letterSpacing: 1,
                    mb: 0.5,
                  }}
                >
                  {section.title}
                </Typography>
                <Box
                  sx={{
                    width: 120,
                    height: 3,
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    borderRadius: 2,
                    mb: 1,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Constructora Hacienda del Monte, S.A. de C.V.
                </Typography>
              </Box>
            );
          }

          if (!section.title && section.content?.startsWith('Folio:')) {
            return (
              <Box
                key={index}
                sx={{
                  textAlign: 'right',
                  mb: 3,
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'text.secondary' }}
                >
                  {section.content}
                </Typography>
              </Box>
            );
          }

          return (
            <Box key={index} sx={{ mb: 3 }}>
              {section.title && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 1,
                    pb: 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  {section.title}
                </Typography>
              )}
              {section.content && (
                <Typography
                  variant="body2"
                  sx={{
                    lineHeight: 1.8,
                    color: 'text.primary',
                    textAlign: 'justify',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {section.content}
                </Typography>
              )}
            </Box>
          );
        })}

      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, maxWidth: 720, mx: 'auto' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
        >
          Regresar
        </Button>
        <Button
          variant="contained"
          endIcon={loading ? null : <ArrowForward />}
          onClick={handleContinue}
          disabled={loading}
          sx={{ textTransform: 'none', borderRadius: 2, px: 4, fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Continuar'}
        </Button>
      </Box>
    </Box>
  );
}
