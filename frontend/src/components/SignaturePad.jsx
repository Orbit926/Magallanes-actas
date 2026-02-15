import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  DeleteOutline,
  PictureAsPdfOutlined,
  CheckCircle,
} from '@mui/icons-material';
import SignaturePadLib from 'signature_pad';
import { generatePDF } from '../utils/pdfGenerator';

export default function SignaturePad({ formData, checkedItems, onBack, onReset }) {
  const canvasRef = useRef(null);
  const sigPadRef = useRef(null);
  const containerRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedFile, setGeneratedFile] = useState('');

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const data = sigPadRef.current?.toData();

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = container.offsetWidth;
    const height = 200;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.getContext('2d').scale(ratio, ratio);

    if (sigPadRef.current) {
      sigPadRef.current.clear();
      if (data && data.length > 0) {
        sigPadRef.current.fromData(data);
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(20, 30, 80)',
      minWidth: 1,
      maxWidth: 2.5,
    });

    pad.addEventListener('endStroke', () => {
      setHasSignature(!pad.isEmpty());
    });

    sigPadRef.current = pad;
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      pad.off();
    };
  }, [resizeCanvas]);

  const handleClear = () => {
    sigPadRef.current?.clear();
    setHasSignature(false);
  };

  const handleGenerate = () => {
    if (!hasSignature) return;
    setLoading(true);
    setTimeout(() => {
      try {
        const signatureImg = sigPadRef.current.toDataURL('image/png');
        const fileName = generatePDF({ formData, checkedItems, signatureImg });
        setGeneratedFile(fileName);
        setDialogOpen(true);
      } catch (err) {
        console.error('Error generating PDF:', err);
        alert('Error al generar el PDF. Revisa la consola.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          bgcolor: '#fff',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          Firma Digital
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Dibuja tu firma con el mouse o el dedo (en dispositivos táctiles). La firma aparecerá en
          todas las páginas del documento PDF.
        </Typography>

        <Box
          ref={containerRef}
          sx={{
            border: '2px dashed',
            borderColor: hasSignature ? 'success.main' : 'grey.300',
            borderRadius: 2,
            bgcolor: hasSignature ? 'success.50' : 'grey.50',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            mb: 2,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: 200,
              cursor: 'crosshair',
              touchAction: 'none',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutline />}
            onClick={handleClear}
            disabled={!hasSignature}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Limpiar firma
          </Button>
        </Box>

        {!hasSignature && (
          <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
            Debes firmar para poder generar y descargar el documento PDF.
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={loading ? null : <PictureAsPdfOutlined />}
          onClick={handleGenerate}
          disabled={!hasSignature || loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Finalizar y Descargar PDF'
          )}
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
        >
          Regresar
        </Button>
      </Box>

      {/* Success dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Documento generado exitosamente
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
            El acta de entrega-recepción ha sido generada y descargada correctamente.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            <strong>Archivo:</strong> {generatedFile}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Folio:</strong> {formData.folio}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            El documento incluye el acta de entrega, el checklist de inspección y la póliza de
            garantía con tu firma digital en cada página.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              if (onReset) onReset();
            }}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
