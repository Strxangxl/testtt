import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const resolveId = (entity) => entity?.id || entity?._id;

const FriendManager = ({ friends, incomingRequests, outgoingRequests, onSendRequest, onRespondRequest }) => {
  const [username, setUsername] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim()) return;

    setProcessing(true);
    try {
      const success = await onSendRequest(username.trim());
      if (success) {
        setUsername('');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Friend connections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a friend by their exact username. No global search — only people you trust.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="friend_username"
          />
          <Button variant="contained" type="submit" disabled={processing}>
            {processing ? 'Sending...' : 'Send request'}
          </Button>
        </Stack>

        <Divider flexItem>
          <Chip label={`Friends (${friends.length})`} color="primary" variant="outlined" />
        </Divider>

        {friends.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            You have no approved friends yet. Send a request to get started.
          </Typography>
        ) : (
          <List disablePadding>
            {friends.map((friend) => (
              <ListItem key={resolveId(friend)} disablePadding sx={{ mb: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    {(friend.username?.slice(0, 2) || '?').toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={`@${friend.username || 'unknown'}`} secondary={friend.email} />
              </ListItem>
            ))}
          </List>
        )}

        <Divider flexItem>
          <Chip label="Pending requests" variant="outlined" />
        </Divider>

        <Stack spacing={2}>
          {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No pending requests. When someone adds you, you decide if they get access.
            </Typography>
          )}

          {incomingRequests.map((request) => (
            <Paper key={request._id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{(request.requester?.username?.slice(0, 1) || '?').toUpperCase()}</Avatar>
                  <Box>
                    <Typography fontWeight={600}>@{request.requester?.username || 'unknown'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      wants to connect
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" color="success" onClick={() => onRespondRequest(request._id, 'accept')}>
                    Accept
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => onRespondRequest(request._id, 'reject')}>
                    Reject
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}

          {outgoingRequests.map((request) => (
            <Paper key={request._id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{(request.recipient?.username?.slice(0, 1) || '?').toUpperCase()}</Avatar>
                  <Box>
                    <Typography fontWeight={600}>@{request.recipient?.username || 'unknown'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      waiting for approval
                    </Typography>
                  </Box>
                </Stack>
                <Chip label="Sent" color="primary" size="small" variant="outlined" />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default FriendManager;
