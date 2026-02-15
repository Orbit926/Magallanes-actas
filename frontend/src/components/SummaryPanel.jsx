import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  PersonOutline,
  HomeOutlined,
  EmailOutlined,
  PhoneOutlined,
  CalendarMonthOutlined,
  CheckCircle,
  RadioButtonUnchecked,
  ReceiptLongOutlined,
} from '@mui/icons-material';
import { checklistSections } from '../utils/contractTemplate';

export default function SummaryPanel({ formData, checkedItems, activeStep }) {
  const nombreCompleto = [formData.nombre, formData.apellidoPaterno, formData.apellidoMaterno]
    .filter(Boolean)
    .join(' ');

  const allItems = checklistSections.flatMap((s) => s.items);
  const checkedCount = allItems.filter((i) => checkedItems[i.id]).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const hasFormData = formData.nombre || formData.apellidoPaterno;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: '#fff',
        position: 'sticky',
        top: 90,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <ReceiptLongOutlined fontSize="small" />
        Resumen
      </Typography>

      {!hasFormData ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Completa el formulario para ver el resumen.
        </Typography>
      ) : (
        <>
          {/* Owner info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Propietario
            </Typography>
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {nombreCompleto && (
                <ListItem disablePadding sx={{ py: 0.2 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <PersonOutline sx={{ fontSize: 16, color: 'action.active' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={nombreCompleto}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500, noWrap: true }}
                  />
                </ListItem>
              )}
              {formData.email && (
                <ListItem disablePadding sx={{ py: 0.2 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <EmailOutlined sx={{ fontSize: 16, color: 'action.active' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={formData.email}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true, fontSize: '0.8rem' }}
                  />
                </ListItem>
              )}
              {formData.telefono && (
                <ListItem disablePadding sx={{ py: 0.2 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <PhoneOutlined sx={{ fontSize: 16, color: 'action.active' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={formData.telefono}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Property info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Vivienda
            </Typography>
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {formData.numeroCasa && (
                <ListItem disablePadding sx={{ py: 0.2 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <HomeOutlined sx={{ fontSize: 16, color: 'action.active' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Casa ${formData.numeroCasa}`}
                    secondary={formData.condominio}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                  />
                </ListItem>
              )}
              {formData.fechaEntrega && (
                <ListItem disablePadding sx={{ py: 0.2 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CalendarMonthOutlined sx={{ fontSize: 16, color: 'action.active' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={formData.fechaEntrega}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          {formData.folio && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Folio
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', fontWeight: 600, mt: 0.5, color: 'primary.main' }}
                >
                  {formData.folio}
                </Typography>
              </Box>
            </>
          )}

          {/* Checklist status */}
          {activeStep >= 2 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Checklist
                </Typography>
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progreso
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {checkedCount}/{totalCount}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                      },
                    }}
                  />
                </Box>

                {checklistSections.map((section) => {
                  const sChecked = section.items.filter((i) => checkedItems[i.id]).length;
                  const sTotal = section.items.length;
                  const done = sChecked === sTotal;
                  return (
                    <Box
                      key={section.title}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.8, py: 0.3 }}
                    >
                      {done ? (
                        <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                      ) : (
                        <RadioButtonUnchecked sx={{ fontSize: 14, color: 'grey.400' }} />
                      )}
                      <Typography variant="caption" sx={{ flex: 1 }}>
                        {section.title}
                      </Typography>
                      <Chip
                        label={`${sChecked}/${sTotal}`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: done ? 'success.50' : 'grey.100',
                          color: done ? 'success.main' : 'text.secondary',
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </>
          )}

          {/* Step indicator */}
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Chip
              label={
                activeStep === 0
                  ? 'Paso 1 · Datos'
                  : activeStep === 1
                    ? 'Paso 2 · Contrato'
                    : activeStep === 2
                      ? 'Paso 3 · Checklist'
                      : 'Paso 4 · Firma'
              }
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </>
      )}
    </Paper>
  );
}
