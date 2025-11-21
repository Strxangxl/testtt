import dayjs from 'dayjs';
import { Chip, Paper, Stack, Typography } from '@mui/material';
import EmptyState from './EmptyState.jsx';

const formatDate = (value) => (value ? dayjs(value).format('MMM D • HH:mm') : '');

const OutboxList = ({ notes }) => (
  <Paper sx={{ p: 3, minHeight: 360 }}>
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700}>
          Sent notes
        </Typography>
        <Chip label={`${notes.length} sent`} variant="outlined" />
      </Stack>

      {notes.length === 0 ? (
        <EmptyState title="No notes sent yet" description="Your latest urgent notes will show here with live read receipts." />
      ) : (
        <Stack spacing={2}>
          {notes.map((note) => (
            <Paper key={note.id} variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>@{note.recipient?.username || 'unknown'}</Typography>
                  {note.status === 'read' ? (
                    <Chip label="Read" color="success" size="small" />
                  ) : (
                    <Chip label="Delivered" color="info" size="small" />
                  )}
                </Stack>
                <Typography>{note.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Sent {formatDate(note.deliveredAt)}
                  {note.readAt ? ` • Read ${formatDate(note.readAt)}` : ''}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  </Paper>
);

export default OutboxList;
