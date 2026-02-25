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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack,
  DeleteOutline,
  PictureAsPdfOutlined,
  CheckCircle,
  GavelOutlined,
  EmailOutlined,
  RefreshOutlined,
} from '@mui/icons-material';
import SignaturePadLib from 'signature_pad';
import { generatePDF } from '../utils/pdfGenerator';
import { useMobileModalProps } from './MobileModal';
import { sendContractEmail, arrayBufferToBase64 } from '../utils/contractApi';

export default function SignaturePad({ formData, checkedItems, comments, onBack, onReset }) {
  const canvasRef = useRef(null);
  const sigPadRef = useRef(null);
  const containerRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedFile, setGeneratedFile] = useState('');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);

  // Email sending state
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | sent | error
  const [emailError, setEmailError] = useState('');
  const lastPdfRef = useRef(null); // Cache PDF data for retry
  const sendingRef = useRef(false); // Prevent duplicate sends

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

  const handleRequestGenerate = () => {
    if (!hasSignature) return;
    setLegalAccepted(false);
    setLegalModalOpen(true);
  };

  const handleCloseLegalModal = useCallback(() => {
    setLegalModalOpen(false);
    setLegalAccepted(false);
  }, []);

  const doSendEmail = useCallback(async (fileName, pdfBase64) => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setEmailStatus('sending');
    setEmailError('');

    const clientEmail = formData.email || formData.correo || '';
    if (!clientEmail) {
      setEmailStatus('error');
      setEmailError('No se encontró el email del cliente en el formulario.');
      sendingRef.current = false;
      return;
    }

    const result = await sendContractEmail({
      clientEmail,
      fileName,
      pdfBase64,
    });

    if (result.ok) {
      setEmailStatus('sent');
    } else {
      setEmailStatus('error');
      setEmailError(result.error || 'Error desconocido al enviar correo.');
    }
    sendingRef.current = false;
  }, [formData]);

  const handleRetryEmail = useCallback(() => {
    if (!lastPdfRef.current) return;
    const { fileName, pdfBase64 } = lastPdfRef.current;
    doSendEmail(fileName, pdfBase64);
  }, [doSendEmail]);

  const handleConfirmLegal = useCallback(async () => {
    if (!legalAccepted) return;
    setLegalModalOpen(false);
    setLoading(true);
    setEmailStatus('idle');
    setEmailError('');
    try {
      const signatureImg = sigPadRef.current.toDataURL('image/png');
      const { fileName, pdfArrayBuffer } = await generatePDF({ formData, checkedItems, comments, signatureImg });
      setGeneratedFile(fileName);
      setDialogOpen(true);

      // Convert to base64 and send email (non-blocking, doesn't affect download)
      const pdfBase64 = arrayBufferToBase64(pdfArrayBuffer);
      lastPdfRef.current = { fileName, pdfBase64 };
      doSendEmail(fileName, pdfBase64);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  }, [legalAccepted, formData, checkedItems, comments, doSendEmail]);

  // Hook para manejo de teclado en móvil
  const legalModalProps = useMobileModalProps(legalModalOpen, legalAccepted ? handleConfirmLegal : null);

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
        
        {/* Nombre del propietario debajo del recuadro de firma */}
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            color: 'primary.dark',
            mt: 1,
            mb: 2,
          }}
        >
          {`${formData.nombre || ''} ${formData.apellidoPaterno || ''} ${formData.apellidoMaterno || ''}`.trim() || 'Nombre del Propietario'}
        </Typography>

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
          onClick={handleRequestGenerate}
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

      {/* Legal confirmation modal */}
      <Dialog
        open={legalModalOpen}
        onClose={handleCloseLegalModal}
        maxWidth="sm"
        fullWidth
        onKeyDown={legalModalProps.onKeyDown}
        PaperProps={{
          sx: {
            borderRadius: 3,
            ...legalModalProps.PaperProps.sx,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <GavelOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Confirmación Legal
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
            Antes de finalizar, por favor confirma que estás de acuerdo con los términos legales.
          </Alert>
          <FormControlLabel
            control={
              <Checkbox
                checked={legalAccepted}
                onChange={(e) => setLegalAccepted(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                El cliente está consciente y de acuerdo en que este documento firmado de forma digital es legal y legítimo.
              </Typography>
            }
            sx={{
              alignItems: 'flex-start',
              '& .MuiCheckbox-root': { mt: -0.5 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexShrink: 0, borderTop: '1px solid', borderColor: 'grey.100' }}>
          <Button
            onClick={handleCloseLegalModal}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmLegal}
            variant="contained"
            disabled={!legalAccepted}
            sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
          >
            Confirmar y Generar PDF
          </Button>
        </DialogActions>
      </Dialog>

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
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
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

          {/* Email sending status */}
          {emailStatus === 'sending' && (
            <Alert
              severity="info"
              icon={<CircularProgress size={18} />}
              sx={{ borderRadius: 2, mt: 2 }}
            >
              Enviando contrato por correo electrónico…
            </Alert>
          )}
          {emailStatus === 'sent' && (
            <Alert
              severity="success"
              icon={<EmailOutlined />}
              sx={{ borderRadius: 2, mt: 2 }}
            >
              Contrato enviado por correo a <strong>{formData.email || formData.correo}</strong>
            </Alert>
          )}
          {emailStatus === 'error' && (
            <Alert
              severity="warning"
              sx={{ borderRadius: 2, mt: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<RefreshOutlined />}
                  onClick={handleRetryEmail}
                  sx={{ textTransform: 'none' }}
                >
                  Reintentar
                </Button>
              }
            >
              {emailError || 'No se pudo enviar el correo.'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setEmailStatus('idle');
              lastPdfRef.current = null;
              if (onReset) onReset();
            }}
            variant="contained"
            disabled={emailStatus === 'sending'}
            sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
