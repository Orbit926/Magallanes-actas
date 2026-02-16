import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  PersonOutline,
  HomeOutlined,
  EmailOutlined,
  PhoneOutlined,
  AutoFixHighOutlined,
} from '@mui/icons-material';
import { mockData } from '../utils/contractTemplate';

const personalFields = [
  { name: 'nombre', label: 'Nombre(s)', icon: <PersonOutline />, grid: 4, required: true },
  { name: 'apellidoPaterno', label: 'Apellido Paterno', icon: <PersonOutline />, grid: 4, required: true },
  { name: 'apellidoMaterno', label: 'Apellido Materno', icon: <PersonOutline />, grid: 4, required: false },
  { name: 'email', label: 'Correo electrónico', icon: <EmailOutlined />, grid: 6, required: true, type: 'email' },
  { name: 'telefono', label: 'Teléfono', icon: <PhoneOutlined />, grid: 6, required: true },
];

const propertyFields = [
  { name: 'numeroCasa', label: 'Número de Casa / Lote', icon: <HomeOutlined />, grid: 12, required: true },
];

const allFields = [...personalFields, ...propertyFields];

function FieldInput({ field, formData, errors, onChange }) {
  return (
    <TextField
      fullWidth
      name={field.name}
      label={field.label}
      type={field.type || 'text'}
      value={formData[field.name] || ''}
      onChange={onChange}
      error={!!errors[field.name]}
      helperText={errors[field.name] || ''}
      required={field.required}
      slotProps={{
        input: {
          startAdornment: (
            <Box sx={{ mr: 1, display: 'flex', color: 'action.active' }}>
              {field.icon}
            </Box>
          ),
        },
        inputLabel: field.type === 'date' ? { shrink: true } : {},
      }}
      size="small"
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
    />
  );
}

export default function WizardStepper({ formData, setFormData, onNext }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    for (const field of allFields) {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = 'Este campo es obligatorio';
      }
      if (field.type === 'email' && formData[field.name]) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(formData[field.name])) {
          newErrors[field.name] = 'Ingresa un correo válido';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoadExample = () => {
    setFormData({ ...mockData });
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 600);
  };

  return (
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Datos del Propietario y Vivienda
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AutoFixHighOutlined />}
          onClick={handleLoadExample}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Cargar ejemplo
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ingresa los datos para generar el acta de entrega-recepción.
      </Typography>

      <Divider sx={{ mb: 3 }}>
        <Chip label="Información personal" size="small" />
      </Divider>

      <Grid container spacing={2.5}>
        {personalFields.map((field) => (
          <Grid size={{ xs: 12, sm: field.grid }} key={field.name}>
            <FieldInput field={field} formData={formData} errors={errors} onChange={handleChange} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }}>
        <Chip label="Datos de la vivienda" size="small" />
      </Divider>

      <Grid container spacing={2.5}>
        {propertyFields.map((field) => (
          <Grid size={{ xs: 12, sm: field.grid }} key={field.name}>
            <FieldInput field={field} formData={formData} errors={errors} onChange={handleChange} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            px: 5,
            py: 1.2,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Continuar'}
        </Button>
      </Box>
    </Paper>
  );
}
