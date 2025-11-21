import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const NoteComposer = ({ friends, onSendNote }) => {
  const [recipientId, setRecipientId] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const maxLength = 300;

  const canSend = recipientId && content.trim().length > 0 && content.trim().length <= maxLength;

  const sortedFriends = useMemo(
    () => [...friends].sort((a, b) => a.username.localeCompare(b.username)),
    [friends]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSend) return;
    setSending(true);

    try {
      const success = await onSendNote({ recipientId, content: content.trim() });
      if (success) {
        setContent('');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Send an urgent note
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pick one friend, drop a max 300 character note, and it auto-expires in 24 hours.
          </Typography>
        </Box>

        <FormControl fullWidth>
          <InputLabel id="friend-select-label">Friend</InputLabel>
          <Select
            labelId="friend-select-label"
            label="Friend"
            value={recipientId}
            onChange={(event) => setRecipientId(event.target.value)}
          >
            {sortedFriends.length === 0 && (
              <MenuItem disabled value="">
                No friends yet
              </MenuItem>
            )}
            {sortedFriends.map((friend) => (
              <MenuItem key={friend.id || friend._id} value={friend.id || friend._id}>
                @{friend.username || 'unknown'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Your urgent note"
          multiline
          minRows={3}
          maxRows={6}
          value={content}
          onChange={(event) => setContent(event.target.value.slice(0, maxLength))}
          helperText={`${content.length}/${maxLength} characters`}
        />

        <Button type="submit" variant="contained" disabled={!canSend || sending}>
          {sending ? 'Sending...' : 'Send note'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default NoteComposer;
