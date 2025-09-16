// src/components/layout/Header.js
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import api from '../../utils/api';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
//import LogoutIcon from '@mui/icons-material/Logout';
//import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';


const Header = ({ userInfo, setUserInfo }) => {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [anchorElPost, setAnchorElPost] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (document.cookie.includes('jwt')) {
                try {
                    const res = await api.get('/api/auth/profile');
                    setUserInfo(res.data);
                } catch (error) {
                    console.log("User not logged in or session expired.");
                }
            }
        };
        fetchUserProfile();
    }, [setUserInfo]);

    const handleLogout = async () => {
        handleCloseUserMenu();
        try {
            await api.post('/api/auth/logout', {});
            toast.success('Logged out successfully');
            setUserInfo(null); // Clear user info on logout
            navigate('/login');
        } catch (error) { toast.error('Logout failed.'); }
    };

    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);
    const handleOpenPostMenu = (event) => setAnchorElPost(event.currentTarget);
    const handleClosePostMenu = () => setAnchorElPost(null);

    const navigateAndClosePostMenu = (path) => {
        navigate(path);
        handleClosePostMenu();
    };

    return (
        <AppBar position="sticky" color="default" elevation={1}>
            <Toolbar>
                <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                    CampusCrate 📦
                </Typography>
                {userInfo ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button color="inherit" variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenPostMenu}>Post Item</Button>
                        <Menu anchorEl={anchorElPost} open={Boolean(anchorElPost)} onClose={handleClosePostMenu}>
                           <MenuItem onClick={() => navigateAndClosePostMenu('/post/found')}>I Found Something</MenuItem>
                           <MenuItem onClick={() => navigateAndClosePostMenu('/post/lost')}>I Lost Something</MenuItem>
                        </Menu>

                        <IconButton onClick={handleOpenUserMenu}>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>{userInfo.name.charAt(0)}</Avatar>
                        </IconButton>
                        <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
    <Box sx={{px: 2, py: 1}}>
        <Typography fontWeight="bold">{userInfo.name}</Typography>
        <Typography variant="body2" color="text.secondary">{userInfo.email}</Typography>
    </Box>
    <Divider/>
    
    {userInfo.role === 'admin' && <MenuItem onClick={() => { navigate('/admin'); handleCloseUserMenu();}}><AdminPanelSettingsIcon sx={{mr:1}}/> Admin Panel</MenuItem>}
    <MenuItem onClick={handleLogout} sx={{color: 'error.main'}}><LogoutIcon sx={{mr:1}}/> Logout</MenuItem>
</Menu>
                    </Box>
                ) : (
                    <Button component={RouterLink} to="/login" color="inherit" variant="outlined">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
