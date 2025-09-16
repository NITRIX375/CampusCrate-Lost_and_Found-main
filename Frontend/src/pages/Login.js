// src/pages/Login.js
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

const Login = ({ setUserInfo }) => { // Accept setUserInfo as prop
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const { name, email, sub } = decoded;

    console.log("helloww");
    console.log(name,email,sub);

    try {
      console.log("Enter");
      const res = await api.post('/api/auth/google', {
        name,
        email,
        googleId: sub,
      });

      console.log(res);

      if (res.status === 200 || res.status === 201) {
        toast.success('Login Successful! Welcome.');
        
        setUserInfo(res.data); // Set the user data in state
        navigate('/'); // Navigate to home page after login
        //console.log("Exit");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={8}>
      <Card sx={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <CardHeader
          title={<Typography variant="h4" component="h1">Welcome to CampusCrate</Typography>}
          subheader={<Typography variant="body1" color="text.secondary">Sign in with your college email to continue</Typography>}
        />
        <CardContent>
          <Box display="flex" justifyContent="center" p={2}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
