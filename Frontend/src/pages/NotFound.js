// src/pages/NotFound.js
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const NotFound = () => {
  return (
    <Box textAlign="center" py={10}>
      <Typography variant="h1" component="h1" color="primary" fontWeight="bold">404</Typography>
      <Typography variant="h4" mt={2} color="text.secondary">Oops! Page not found.</Typography>
      <Typography mt={1}>The page you are looking for doesn't exist or has been moved.</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 4 }}>
        Go Back to Home
      </Button>
    </Box>
  );
};

export default NotFound;