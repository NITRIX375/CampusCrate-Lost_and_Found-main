// src/pages/Dashboard.js
import { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Grid, TextField, MenuItem, FormControl, InputLabel, Select, Typography, CircularProgress,Button,Card,CardContent,Stack,Dialog,DialogActions,DialogTitle,DialogContent} from '@mui/material';
import api from '../utils/api';
import SearchIcon from '@mui/icons-material/Search';
import ItemCard from '../components/items/ItemCard';

const Dashboard = () => {
    const [items, setItems] = useState([]);
    const [myListedItems, setMyListedItems] = useState([]);  // State for the current user's listed items
    const [myClaims, setMyClaims] = useState([]);  // State to hold user's claims
    const [loading, setLoading] = useState(true);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [tabValue, setTabValue] = useState('found');
    const [editClaim, setEditClaim] = useState(null);
    const [claimAnswer, setClaimAnswer] = useState('');
    const [category, setCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                let url = `/api/items?type=${tabValue}`;
                if (category && category !== 'all') url += `&category=${category}`;
                if (searchTerm) url += `&search=${searchTerm}`;

                const { data } = await api.get(url);
                setItems(data);
            } catch (error) {
                console.error("Failed to fetch items:", error);
            } finally {
                setLoading(false);
            }
        };
         const fetchMyListedItems = async () => {
            try {
                const { data } = await api.get('/api/items/my-listed-items');
                setMyListedItems(data);  // Set the user's listed items
            } catch (error) {
                console.error("Failed to fetch listed items:", error);
            }
        };

        const fetchMyClaims = async () => {
            try {
                const { data } = await api.get('/api/claims/my-claims');
                console.log(data);
                setMyClaims(data);
            } catch (error) {
                console.error("Failed to fetch claims:", error);
            }
        };
        
        
        const debounceFetch = setTimeout(() => {
            fetchItems();
            fetchMyListedItems();
            fetchMyClaims();


        }, 300);

        return () => clearTimeout(debounceFetch);
    }, [tabValue, category, searchTerm]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const handleEditClaim = (claim) => {

        setClaimAnswer(claim.claimantAnswer);
        setMessage(claim.message);
        setEditClaim(claim);
        setOpenEditDialog(true);
    };

    const handleDeleteClaim = async (claimId) => {
        try {
            await api.delete(`/api/claims/delete-claim/${claimId}`);
            setMyClaims(myClaims.filter(claim => claim._id !== claimId));  // Remove deleted claim from state
            alert('Claim deleted successfully');
        } catch (error) {
            alert('Failed to delete claim');
        }
    };

     const handleEditSubmit = async () => {
        try {
            await axios.patch(
                `/api/claims/edit-claim/${editClaim._id}`,
                { claimantAnswer: claimAnswer, message: message },
                { withCredentials: true }
            );
            setMyClaims(myClaims.map(claim => (claim._id === editClaim._id ? { ...claim, claimAnswer, message } : claim)));
            setOpenEditDialog(false);
            alert('Claim updated successfully');
        } catch (error) {
            alert('Failed to update claim');
        }
    };

    const categories = ["All", "ID Card", "Electronics", "Bottle", "Book", "Clothing", "Other"];




    return (
 <Box>
            <Typography variant="h3" component="h1" gutterBottom textAlign="center">
                Lost & Found Dashboard
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="🔍 Found Items" value="found" />
                    <Tab label="❓ Lost Items" value="lost" />
                    <Tab label="📋 My Listed Items" value="my-listed-items" />  
                    <Tab label="📋 My Claims" value="my-claims" /> 
                </Tabs>
            </Box>

            {tabValue === 'my-listed-items' ? (
                // Display user's listed items
                <Grid container spacing={3}>
                    {myListedItems.length > 0 ? (
                        myListedItems.map(item => (
                            <Grid item xs={12} sm={6} md={4} key={item._id}>
                                <ItemCard item={item} />
                            </Grid>
                        ))
                    ) : (
                        <Typography textAlign="center" color="text.secondary" mt={10}>
                            You haven't listed any items yet.
                        </Typography>
                    )}
                </Grid>
            ) : tabValue == "my-claims"? (
                <Grid container spacing={3}>
                    {myClaims.length > 0 ? (
                        myClaims.map((claim) => (
                            
                            <Grid item xs={12} sm={6} md={4} key={claim._id}>
        <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {claim.itemId?.title || 'Untitled'}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Description: {claim.itemId?.description || 'N/A'}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Message: {claim.message}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Status: <strong>{claim.status}</strong>
            </Typography>

            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleEditClaim(claim)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDeleteClaim(claim._id)}
              >
                Delete
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
                        ))
                    ) : (
                        <Typography>No claims found.</Typography>
                    )}

                    </Grid>
                
            ):
            
            
            (
                <>
                    <Grid container spacing={2} sx={{ mb: 4 }} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Search by title, description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={category}
                                    label="Category"
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <MenuItem key={cat} value={cat.toLowerCase()}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {items.length > 0 ? (
                                <Grid container spacing={3}>
                                    {items.map(item => (
                                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                                            <ItemCard item={item} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography textAlign="center" color="text.secondary" mt={10}>
                                    No {tabValue} items match your criteria.
                                </Typography>
                            )}
                        </>
                    )}
                </>
            )}

         <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edit Claim</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Claim Answer"
                        value={claimAnswer}
                        onChange={(e) => setClaimAnswer(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;