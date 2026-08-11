import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { LibraryItem, SaveLibraryExperienceInput } from '@popcorn-time/shared';

const localDate = (value = new Date()) => {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
};

const dateValue = (value: string | null) => (value ? localDate(new Date(value)) : localDate());

export function ExperienceDialog({
  item,
  open,
  saving,
  error,
  onClose,
  onSave,
}: {
  item: LibraryItem | undefined;
  open: boolean;
  saving: boolean;
  error?: string;
  onClose: () => void;
  onSave: (input: SaveLibraryExperienceInput) => void;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [watchedOn, setWatchedOn] = useState(localDate());
  useEffect(() => {
    if (!open) return;
    setRating(item?.personalRating ?? null);
    setComment(item?.privateComment ?? '');
    setWatchedOn(dateValue(item?.watchedAt ?? null));
  }, [item, open]);
  const save = () => {
    if (!watchedOn) return;
    onSave({
      rating,
      comment: comment.trim() || null,
      watchedAt: new Date(`${watchedOn}T12:00:00`).toISOString(),
    });
  };
  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="log-experience-title"
    >
      <DialogTitle id="log-experience-title" sx={{ pr: 6 }}>
        Log Your Experience
        <IconButton
          aria-label="Close experience dialog"
          disabled={saving}
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 0.5 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Stack spacing={1}>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between">
              <Typography variant="caption" fontWeight={800} color="text.secondary">
                RATING
              </Typography>
              <Typography
                color={rating === null ? 'text.secondary' : 'primary.main'}
                fontWeight={800}
              >
                {rating === null ? 'Not rated' : `${rating.toFixed(1)}/10`}
              </Typography>
            </Stack>
            <Slider
              aria-label="Personal rating"
              value={rating ?? 1}
              min={1}
              max={10}
              step={0.5}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}/10`}
              onChange={(_event, value) => setRating(value as number)}
              disabled={saving}
            />
            <Button
              size="small"
              onClick={() => setRating(null)}
              disabled={rating === null || saving}
              sx={{ alignSelf: 'flex-start' }}
            >
              Clear rating
            </Button>
          </Stack>
          <TextField
            label="Watched on"
            type="date"
            required
            fullWidth
            value={watchedOn}
            onChange={(event) => setWatchedOn(event.target.value)}
            disabled={saving}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: localDate() } }}
          />
          <TextField
            label="Comment"
            placeholder="Share your thoughts on this experience…"
            multiline
            minRows={4}
            fullWidth
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={saving}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          onClick={save}
          disabled={saving || !watchedOn}
          aria-busy={saving}
        >
          {saving ? 'Saving…' : 'Save Experience'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
