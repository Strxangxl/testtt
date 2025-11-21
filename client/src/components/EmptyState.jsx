import { Box, Typography } from '@mui/material';

const EmptyState = ({ title, description }) => (
  <Box textAlign="center" py={5} px={2} color="text.secondary">
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2">{description}</Typography>
  </Box>
);

export default EmptyState;
