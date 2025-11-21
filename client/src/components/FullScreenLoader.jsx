import { Box, CircularProgress, Typography } from '@mui/material';

const FullScreenLoader = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    }}
  >
    <CircularProgress size={72} thickness={4} color="primary" />
    <Typography variant="h6" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default FullScreenLoader;
