import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircleOutline,
  FormatPaintOutlined,
  ElectricalServicesOutlined,
  KitchenOutlined,
} from '@mui/icons-material';
import { checklistSections } from '../utils/contractTemplate';

const sectionIcons = {
  Acabados: <FormatPaintOutlined />,
  Instalaciones: <ElectricalServicesOutlined />,
  Equipamiento: <KitchenOutlined />,
};

export default function DeliveryChecklist({ checkedItems, setCheckedItems, onNext, onBack }) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const allItems = checklistSections.flatMap((s) => s.items);
  const checkedCount = allItems.filter((i) => checkedItems[i.id]).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handleToggle = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllSection = (section) => {
    const allChecked = section.items.every((i) => checkedItems[i.id]);
    const updates = {};
    section.items.forEach((i) => {
      updates[i.id] = !allChecked;
    });
    setCheckedItems((prev) => ({ ...prev, ...updates }));
  };

  const handleContinue = () => {
    if (!confirmed) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 600);
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          bgcolor: '#fff',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Checklist de Entrega
          </Typography>
          <Chip
            icon={<CheckCircleOutline />}
            label={`${checkedCount} / ${totalCount}`}
            color={checkedCount === totalCount ? 'success' : 'default'}
            variant={checkedCount === totalCount ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 3,
            bgcolor: 'grey.100',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              bgcolor: progress === 100 ? 'success.main' : 'primary.main',
            },
          }}
        />

        {checklistSections.map((section, sIdx) => {
          const sectionChecked = section.items.filter((i) => checkedItems[i.id]).length;
          const sectionTotal = section.items.length;
          const allSectionChecked = sectionChecked === sectionTotal;

          return (
            <Box key={sIdx} sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  p: 1.5,
                  bgcolor: allSectionChecked ? 'success.50' : 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: allSectionChecked ? 'success.200' : 'grey.200',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: allSectionChecked ? 'success.100' : 'grey.100' },
                }}
                onClick={() => handleSelectAllSection(section)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: allSectionChecked ? 'success.main' : 'primary.main' }}>
                    {sectionIcons[section.title] || <CheckCircleOutline />}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {section.title}
                  </Typography>
                </Box>
                <Chip
                  label={`${sectionChecked}/${sectionTotal}`}
                  size="small"
                  color={allSectionChecked ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>

              <FormGroup sx={{ pl: 2 }}>
                {section.items.map((item) => (
                  <FormControlLabel
                    key={item.id}
                    control={
                      <Checkbox
                        checked={!!checkedItems[item.id]}
                        onChange={() => handleToggle(item.id)}
                        color="success"
                        size="small"
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          color: checkedItems[item.id] ? 'text.primary' : 'text.secondary',
                          textDecoration: checkedItems[item.id] ? 'none' : 'none',
                        }}
                      >
                        {item.label}
                      </Typography>
                    }
                    sx={{
                      mx: 0,
                      py: 0.3,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'grey.50' },
                    }}
                  />
                ))}
              </FormGroup>
            </Box>
          );
        })}

        <Divider sx={{ my: 3 }} />

        <Alert
          severity={confirmed ? 'success' : 'warning'}
          sx={{ borderRadius: 2, mb: 2 }}
          icon={confirmed ? <CheckCircleOutline /> : undefined}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                color="success"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Confirmo que revisé la vivienda y los puntos marcados reflejan el estado al momento
                de la entrega.
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Alert>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
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
          disabled={!confirmed || loading}
          sx={{ textTransform: 'none', borderRadius: 2, px: 4, fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Continuar'}
        </Button>
      </Box>
    </Box>
  );
}
