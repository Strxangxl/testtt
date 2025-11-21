import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth.js';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const isRegister = mode === 'register';

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          email: form.email,
          username: form.username,
          password: form.password,
        });
      } else {
        await login({ email: form.email, password: form.password });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.msg ||
        'Unable to continue. Please try again.';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: { xs: 4, md: 6 } }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Stack spacing={1}>
              <Typography variant="overline" color="secondary">
                Urgent Note Sender
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {isRegister ? 'Create a safe shortcut' : 'Log in to your lifeline'}
              </Typography>
              <Typography color="text.secondary">
                A hyper-focused way to send a tiny, respectful note when everything else is blocked.
              </Typography>
            </Stack>

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />

            {isRegister && (
              <TextField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                fullWidth
                helperText="Only letters, numbers, and underscores"
              />
            )}

            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              helperText={isRegister ? 'Minimum 6 characters' : undefined}
            />

            <Button variant="contained" size="large" type="submit" disabled={submitting}>
              {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}
            </Button>

            <Typography variant="body2" color="text.secondary">
              {isRegister ? 'Already connected?' : 'New to Urgent Notes?'}{' '}
              <Link component="button" type="button" onClick={toggleMode} underline="hover">
                {isRegister ? 'Log in instead' : 'Create an account'}
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuthPage;
