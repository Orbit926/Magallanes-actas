import { useState, useMemo, useRef, useCallback } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Paper,
  useMediaQuery,
} from '@mui/material';
import {
  DescriptionOutlined,
  AssignmentOutlined,
  ChecklistOutlined,
  DrawOutlined,
} from '@mui/icons-material';
import WizardStepper from './components/WizardStepper';
import ContractPreview from './components/ContractPreview';
import DeliveryChecklist from './components/DeliveryChecklist';
import SignaturePad from './components/SignaturePad';
import SummaryPanel from './components/SummaryPanel';
import { generateFolio } from './utils/contractTemplate';

const steps = [
  { label: 'Datos', icon: <DescriptionOutlined /> },
  { label: 'Contrato', icon: <AssignmentOutlined /> },
  { label: 'Checklist', icon: <ChecklistOutlined /> },
  { label: 'Firma y PDF', icon: <DrawOutlined /> },
];

export default function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    numeroCasa: '',
    condominio: '',
    direccion: '',
    ciudadEstado: '',
    fechaEntrega: '',
    folio: '',
  });
  const [checkedItems, setCheckedItems] = useState({});
  const stepperRef = useRef(null);

  const theme = useMemo(
    () =>
      createTheme({
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
      }),
    []
  );

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const scrollToTop = useCallback(() => {
    setTimeout(() => {
      stepperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const handleNext = () => {
    if (activeStep === 0 && !formData.folio) {
      const folio = generateFolio(formData.numeroCasa, formData.fechaEntrega);
      setFormData((prev) => ({ ...prev, folio }));
    }
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    scrollToTop();
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    scrollToTop();
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: '',
      numeroCasa: '',
      condominio: '',
      direccion: '',
      ciudadEstado: '',
      fechaEntrega: '',
      folio: '',
    });
    setCheckedItems({});
    scrollToTop();
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <WizardStepper formData={formData} setFormData={setFormData} onNext={handleNext} />;
      case 1:
        return <ContractPreview formData={formData} onNext={handleNext} onBack={handleBack} />;
      case 2:
        return (
          <DeliveryChecklist
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <SignaturePad
            formData={formData}
            checkedItems={checkedItems}
            onBack={handleBack}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'primary.main',
            borderBottom: '3px solid',
            borderColor: 'secondary.main',
          }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AssignmentOutlined sx={{ color: 'secondary.main', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: 0.5 }}>
                  Entrega Digital
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>
                  Demo — Constructora Hacienda del Monte
                </Typography>
              </Box>
            </Box>
            {formData.folio && (
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  color: 'secondary.main',
                }}
              >
                {formData.folio}
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        {/* Stepper */}
        <Paper
          ref={stepperRef}
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            py: 2,
            px: 2,
            bgcolor: '#fff',
          }}
        >
          <Container maxWidth="lg">
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label} completed={index < activeStep}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': { color: 'primary.main' },
                        '&.Mui-completed': { color: 'success.main' },
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: index === activeStep ? 700 : 400,
                        color: index === activeStep ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Container>
        </Paper>

        {/* Main content */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {/* Main area */}
            <Box sx={{ flex: 1, minWidth: 0 }}>{renderStep()}</Box>

            {/* Summary panel - desktop only */}
            {isDesktop && (
              <Box sx={{ width: 280, flexShrink: 0 }}>
                <SummaryPanel
                  formData={formData}
                  checkedItems={checkedItems}
                  activeStep={activeStep}
                />
              </Box>
            )}
          </Box>
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            textAlign: 'center',
            py: 3,
            px: 2,
            mt: 'auto',
            bgcolor: 'transparent',
          }}
        >
          <Typography variant="caption" color="text.disabled">
            Demo — Entrega Digital © {new Date().getFullYear()} · Constructora Hacienda del Monte, S.A. de C.V.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
