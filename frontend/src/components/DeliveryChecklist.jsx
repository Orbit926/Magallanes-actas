import { useState, useCallback } from 'react';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircleOutline,
  FormatPaintOutlined,
  ElectricalServicesOutlined,
  KitchenOutlined,
  CommentOutlined,
  EditOutlined,
} from '@mui/icons-material';
import { checklistSections } from '../utils/contractTemplate';
import { useMobileModalProps } from './MobileModal';

const sectionIcons = {
  Acabados: <FormatPaintOutlined />,
  Instalaciones: <ElectricalServicesOutlined />,
  Equipamiento: <KitchenOutlined />,
};

export default function DeliveryChecklist({ checkedItems, setCheckedItems, onNext, onBack, comments, setComments, itemComments, setItemComments }) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentCommentItem, setCurrentCommentItem] = useState(null);
  const [tempComment, setTempComment] = useState('');

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

  const handleOpenCommentModal = (item) => {
    setCurrentCommentItem(item);
    setTempComment(itemComments[item.id] || '');
    setCommentModalOpen(true);
  };

  const handleCloseCommentModal = useCallback(() => {
    setCommentModalOpen(false);
    setCurrentCommentItem(null);
    setTempComment('');
  }, []);

  const handleConfirmComment = useCallback(() => {
    if (!currentCommentItem) return;
    
    const itemId = currentCommentItem.id;
    const itemLabel = currentCommentItem.label;
    const commentText = tempComment.trim();
    
    // Update item comments
    setItemComments((prev) => ({
      ...prev,
      [itemId]: commentText,
    }));
    
    // Update general comments area - only show label, not technical ID
    const commentLine = `${itemLabel}: ${commentText}`;
    // Use label as pattern to find existing comment
    const escapedLabel = itemLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const linePattern = new RegExp(`^${escapedLabel}:.*$`, 'm');
    
    setComments((prev) => {
      if (!commentText) {
        // Remove the line if comment is empty
        return prev.replace(linePattern, '').replace(/\n{2,}/g, '\n').trim();
      }
      if (linePattern.test(prev)) {
        // Update existing line
        return prev.replace(linePattern, commentLine);
      }
      // Add new line
      return prev ? `${prev}\n${commentLine}` : commentLine;
    });
    
    handleCloseCommentModal();
  }, [currentCommentItem, tempComment, setItemComments, setComments, handleCloseCommentModal]);

  // Hook para manejo de teclado en móvil (después de definir handleConfirmComment)
  const mobileModalProps = useMobileModalProps(commentModalOpen, handleConfirmComment);

  const allChecked = checkedCount === totalCount;

  const handleContinue = () => {
    if (!confirmed || !allChecked) return;
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
            Garantias
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
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.3,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'grey.50' },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!checkedItems[item.id]}
                          onChange={() => handleToggle(item.id)}
                          color="success"
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: checkedItems[item.id] ? 'text.primary' : 'text.secondary',
                            }}
                          >
                            {item.label}
                          </Typography>
                          {itemComments[item.id] && (
                            <Chip
                              size="small"
                              label="Comentario"
                              color="warning"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      sx={{ mx: 0, flex: 1 }}
                    />
                    <Button
                      size="small"
                      startIcon={itemComments[item.id] ? <EditOutlined /> : <CommentOutlined />}
                      onClick={() => handleOpenCommentModal(item)}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 1,
                        color: itemComments[item.id] ? 'warning.main' : 'text.secondary',
                      }}
                    >
                      {itemComments[item.id] ? 'Editar' : 'Comentario'}
                    </Button>
                  </Box>
                ))}
              </FormGroup>
            </Box>
          );
        })}

        <Divider sx={{ my: 3 }} />

        {/* Comentarios generales */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'primary.dark' }}>
            Comentarios
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Escribe aquí cualquier comentario general sobre la entrega..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'grey.50',
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {!allChecked && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Debes marcar todos los puntos del checklist ({checkedCount} de {totalCount}) antes de continuar.
            </Typography>
          </Alert>
        )}

        <Alert
          severity={confirmed && allChecked ? 'success' : 'warning'}
          sx={{ borderRadius: 2, mb: 2 }}
          icon={confirmed && allChecked ? <CheckCircleOutline /> : undefined}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                color="success"
                disabled={!allChecked}
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
          disabled={!confirmed || !allChecked || loading}
          sx={{ textTransform: 'none', borderRadius: 2, px: 4, fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Continuar'}
        </Button>
      </Box>

      {/* Modal de comentario por ítem */}
      <Dialog
        open={commentModalOpen}
        onClose={handleCloseCommentModal}
        maxWidth="sm"
        fullWidth
        onKeyDown={mobileModalProps.onKeyDown}
        PaperProps={{
          sx: {
            borderRadius: 3,
            ...mobileModalProps.PaperProps.sx,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommentOutlined color="primary" />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              Agregar Comentario
            </Typography>
          </Box>
          {currentCommentItem && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {currentCommentItem.label}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Escribe tu comentario sobre este elemento..."
            value={tempComment}
            onChange={(e) => setTempComment(e.target.value)}
            autoFocus
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexShrink: 0, borderTop: '1px solid', borderColor: 'grey.100' }}>
          <Button
            onClick={handleCloseCommentModal}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmComment}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
