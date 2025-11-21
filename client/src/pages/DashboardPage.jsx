import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Container,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import api, { API_BASE_URL } from '../api/client.js';
import { useAuth } from '../hooks/useAuth.js';
import DashboardHeader from '../components/DashboardHeader.jsx';
import FriendManager from '../components/FriendManager.jsx';
import NoteComposer from '../components/NoteComposer.jsx';
import InboxList from '../components/InboxList.jsx';
import OutboxList from '../components/OutboxList.jsx';

const normalizeUser = (user) =>
  user
    ? {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
      }
    : null;

const normalizeNotes = (notes = []) =>
  notes.map((note) => ({
    ...note,
    id: note.id || note._id,
    sender: normalizeUser(note.sender),
    recipient: normalizeUser(note.recipient),
  }));

const normalizeFriends = (friends = []) => friends.map((friend) => ({ ...friend, id: friend.id || friend._id }));

const resolveErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || fallback;

const DashboardPage = () => {
  const { user, logout, token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [streamAttempts, setStreamAttempts] = useState(0);

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes, inboxRes, outboxRes] = await Promise.all([
        api.get('/api/friends'),
        api.get('/api/friends/requests'),
        api.get('/api/notes/inbox'),
        api.get('/api/notes/outbox'),
      ]);

      setFriends(normalizeFriends(friendsRes.data.friends || []));
      setIncomingRequests(requestsRes.data.incoming || []);
      setOutgoingRequests(requestsRes.data.outgoing || []);
      setInbox(normalizeNotes(inboxRes.data.notes || []));
      setOutbox(normalizeNotes(outboxRes.data.notes || []));
    } catch (error) {
      showSnackbar(resolveErrorMessage(error, 'Unable to load your data. Please refresh.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleIncomingNote = useCallback(
    (note) => {
      const normalized = normalizeNotes([note])[0];
      setInbox((prev) => {
        const filtered = prev.filter((item) => item.id !== normalized.id);
        return [normalized, ...filtered];
      });
      showSnackbar(`New note from @${normalized.sender?.username || 'friend'}`, 'info');

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Urgent note from @${normalized.sender?.username || 'friend'}`, {
          body: normalized.content,
        });
      }
    },
    [showSnackbar]
  );

  const handleNoteStatus = useCallback(
    (payload) => {
      setOutbox((prev) =>
        prev.map((note) =>
          note.id === payload.noteId
            ? {
                ...note,
                status: payload.status,
                readAt: payload.status === 'read' ? new Date().toISOString() : note.readAt,
              }
            : note
        )
      );
      if (payload.status === 'read') {
        showSnackbar('Your note was read.', 'success');
      }
    },
    [showSnackbar]
  );

  useEffect(() => {
    if (!token) return undefined;

    const streamUrl = `${API_BASE_URL}/api/notes/stream?token=${encodeURIComponent(token)}&attempt=${streamAttempts}`;
    const eventSource = new EventSource(streamUrl);
    let retryTimeout;

    eventSource.addEventListener('note', (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleIncomingNote(payload);
      } catch (error) {
        console.error('Failed to parse note event', error);
      }
    });

    eventSource.addEventListener('note-status', (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleNoteStatus(payload);
      } catch (error) {
        console.error('Failed to parse note-status event', error);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
      retryTimeout = setTimeout(() => {
        setStreamAttempts((prev) => prev + 1);
      }, 4000);
    };

    return () => {
      eventSource.close();
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [token, streamAttempts, handleIncomingNote, handleNoteStatus]);

  const handleSendRequest = useCallback(
    async (username) => {
      try {
        await api.post('/api/friends/request', { username });
        showSnackbar(`Request sent to @${username}`, 'success');
        const { data } = await api.get('/api/friends/requests');
        setIncomingRequests(data.incoming || []);
        setOutgoingRequests(data.outgoing || []);
        return true;
      } catch (error) {
        showSnackbar(resolveErrorMessage(error, 'Unable to send request'), 'error');
        return false;
      }
    },
    [showSnackbar]
  );

  const handleRespondRequest = useCallback(
    async (requestId, action) => {
      try {
        await api.post('/api/friends/respond', { requestId, action });
        showSnackbar(action === 'accept' ? 'Friend request accepted' : 'Friend request rejected', 'info');
        await loadInitialData();
        return true;
      } catch (error) {
        showSnackbar(resolveErrorMessage(error, 'Unable to update request'), 'error');
        return false;
      }
    },
    [loadInitialData, showSnackbar]
  );

  const handleSendNote = useCallback(
    async ({ recipientId, content }) => {
      try {
        const { data } = await api.post('/api/notes', { recipientId, content });
        const normalized = normalizeNotes([data.note])[0];
        setOutbox((prev) => [normalized, ...prev]);
        showSnackbar('Note delivered', 'success');
        return true;
      } catch (error) {
        showSnackbar(resolveErrorMessage(error, 'Unable to send note'), 'error');
        return false;
      }
    },
    [showSnackbar]
  );

  const handleMarkRead = useCallback(
    async (noteId) => {
      try {
        await api.post(`/api/notes/${noteId}/read`);
        setInbox((prev) =>
          prev.map((note) => (note.id === noteId ? { ...note, status: 'read', readAt: new Date().toISOString() } : note))
        );
        showSnackbar('Marked as read', 'success');
      } catch (error) {
        showSnackbar(resolveErrorMessage(error, 'Unable to update note'), 'error');
      }
    },
    [showSnackbar]
  );

  const handleDeleteNote = useCallback(
    async (noteId) => {
      try {
        await api.delete(`/api/notes/${noteId}`);
        setInbox((prev) => prev.filter((note) => note.id !== noteId));
        showSnackbar('Note removed from inbox', 'info');
      } catch (error) {
        showSnackbar(resolveErrorMessage(error, 'Unable to delete note'), 'error');
      }
    },
    [showSnackbar]
  );

  const content = useMemo(
    () => (
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <FriendManager
            friends={friends}
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            onSendRequest={handleSendRequest}
            onRespondRequest={handleRespondRequest}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NoteComposer friends={friends} onSendNote={handleSendNote} />
        </Grid>
        <Grid item xs={12} md={7}>
          <InboxList notes={inbox} onMarkRead={handleMarkRead} onDelete={handleDeleteNote} />
        </Grid>
        <Grid item xs={12} md={5}>
          <OutboxList notes={outbox} />
        </Grid>
      </Grid>
    ),
    [friends, incomingRequests, outgoingRequests, handleSendRequest, handleRespondRequest, handleSendNote, inbox, handleMarkRead, handleDeleteNote, outbox]
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="overline" color="secondary.dark">
          Urgent Note Sender
        </Typography>
        <DashboardHeader user={user} onLogout={logout} />

        {loading ? (
          <Alert severity="info">Loading your secure data...</Alert>
        ) : (
          content
        )}
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DashboardPage;
