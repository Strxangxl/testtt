import dayjs from 'dayjs';
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EmptyState from './EmptyState.jsx';

const statusChip = (note) => {
  if (note.status === 'read') {
    return <Chip label="Read" color="success" size="small" />;
  }
  return <Chip label="New" color="warning" size="small" />;
};

const formatDate = (value) => (value ? dayjs(value).format('MMM D • HH:mm') : '');

const InboxList = ({ notes, onMarkRead, onDelete }) => (
  <Paper sx={{ p: 3, minHeight: 360 }}>
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700}>
          Inbox
        </Typography>
        <Chip label={`${notes.length} note${notes.length === 1 ? '' : 's'}`} variant="outlined" />
      </Stack>

      {notes.length === 0 ? (
        <EmptyState title="Nothing urgent right now" description="When a friend reaches out, it will appear here instantly." />
      ) : (
        <Stack spacing={2}>
          {notes.map((note) => (
            <Paper key={note.id} variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>@{note.sender?.username || 'unknown'}</Typography>
                  {statusChip(note)}
                </Stack>

                <Typography>{note.content}</Typography>

                <Typography variant="caption" color="text.secondary">
                  Delivered {formatDate(note.deliveredAt)} · Auto-deletes {formatDate(note.expiresAt)}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {note.status !== 'read' && (
                    <Button size="small" variant="contained" onClick={() => onMarkRead(note.id)}>
                      Mark as read
                    </Button>
                  )}
                  <IconButton color="error" onClick={() => onDelete(note.id)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  </Paper>
);

export default InboxList;
