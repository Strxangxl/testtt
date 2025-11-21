import { Avatar, Box, Button, Stack, Typography } from '@mui/material';

const DashboardHeader = ({ user, onLogout }) => {
  const initials = (user?.username?.slice(0, 2) || 'UN').toUpperCase();

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={3}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>{initials}</Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Hey {user?.username},
          </Typography>
          <Typography color="text.secondary">
            Send a quick note that disappears in 24h. Nothing more, nothing less.
          </Typography>
        </Box>
      </Stack>

      <Button variant="outlined" color="error" onClick={onLogout}>
        Log out
      </Button>
    </Stack>
  );
};

export default DashboardHeader;
