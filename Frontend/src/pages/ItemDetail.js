// src/pages/ItemDetail.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Chip, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PanToolIcon from '@mui/icons-material/PanTool'; // Claim icon

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [openClaimDialog, setOpenClaimDialog] = useState(false);
    const [claimAnswer, setClaimAnswer] = useState('');
    //const [claimantAnswer, setClaimantAnswer] = useState('');
    const [openReportDialog, setOpenReportDialog] = useState(false);
    const [description, setDescription] = useState('');

     useEffect(() => {
        const fetchUserAndItem = async () => {
            setLoading(true);
            let currentUser = null;
            try {
                const profileRes = await axios.get('http://localhost:8080/api/auth/profile', { withCredentials: true });
                currentUser = profileRes.data;
                setUserInfo(currentUser);
            } catch (error) {
                console.log("Not logged in");
            }

            try {
                const itemRes = await axios.get(`http://localhost:8080/api/items/${id}`);
                setItem(itemRes.data);
                if (currentUser && itemRes.data.postedBy._id === currentUser._id) {
                    setIsOwner(true);
                }
            } catch (error) {
                toast.error("Failed to fetch item details.");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndItem();
    }, [id, navigate]);

    useEffect(() => {
        const fetchClaims = async () => {
            if (isOwner) {
                try {
                    const { data } = await axios.get(`http://localhost:8080/api/claims/my-item-claims/${id}`, { withCredentials: true });
                    setClaims(data);
                } catch (error) {
                    console.error("Failed to fetch claims:", error);
                }
            }
        };
        if (isOwner) fetchClaims();
    }, [isOwner, id]);

    
    
   const handleClaimSubmit = async () => {
    // Check if the claim answer is provided
    if (!claimAnswer) {
        return toast.error("Please provide an answer.");
    }

    console.log("Submitting claim with answer:", claimAnswer);

    // const handleOpenReportDialog = () => {
    //     setOpenReportDialog(true);
    // };

    // const handleCloseReportDialog = () => {
    //     setOpenReportDialog(false);
    // };

   
    




    try {
        // Send the claim submission request to the backend
        const response = await axios.post(
            'http://localhost:8080/api/claims',
            { 
                itemId: id, 
                claimAnswer: claimAnswer, // Ensure claimAnswer is passed properly
                message: "Claim submission message"  // Optional, you can add any message
            },
            { withCredentials: true } // Include credentials for JWT token
        );
        
        // Show success message
        toast.success('Claim submitted!');
        setOpenClaimDialog(false); // Close the claim dialog
        setClaimAnswer(''); // Clear the claim answer field
    } catch (error) {
        // Log error and show failure message
        console.log("Error submitting claim:", error);
        toast.error(error.response?.data?.message || "Failed to submit claim.");
    }
};
    

    const handleClaimStatusUpdate = async (claimId, status) => {
        console.log(claimId);
        try {
            
            await axios.patch(`http://localhost:8080/api/claims/${claimId}/status`, { status }, { withCredentials: true });
            toast.success(`Claim ${status}.`);
            const { data } = await axios.get(`http://localhost:8080/api/claims/my-item-claims/${id}`, { withCredentials: true });
            setClaims(data);
            const { data: itemData } = await axios.get(`http://localhost:8080/api/items/${id}`);
            setItem(itemData);
        } catch (error) { toast.error("Failed to update claim status."); }
    };

    const handleMarkAsReturned = async () => {
        const approvedClaim = claims.find(c => c.status === 'approved');
        if (!approvedClaim) return toast.error("An approved claim is required.");
        try {
            await axios.patch(`http://localhost:8080/api/items/${id}/return`, { claimId: approvedClaim._id }, { withCredentials: true });
            toast.success("Item marked as returned!");
            navigate('/');
        } catch (error) { toast.error(error.response?.data?.message || "Failed to mark as returned."); }
    };
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (!item) return <Typography>Item not found.</Typography>;

    const isClaimable = item.status === 'active' && userInfo && !isOwner;



      const handleReportSubmit = async () => {
    if (!description) {
      toast.error('Please provide a description for the report.');
      return;
    }

    try {

        console.log("aagye!1");
      await axios.post(
        `http://localhost:8080/api/items/${item._id}/report`,
        { description },
        { withCredentials: true }
      );
      toast.success('Report submitted successfully!');
      setOpenReportDialog(false);
    } catch (error) {
      toast.error('Failed to submit the report.');
    }
  };

    return (
        <>
        <Grid container spacing={4}>
            {/* Item Details Column */}
            <Grid item xs={12} md={isOwner ? 8 : 12}>
                <Card>
                    {item.photoUrl && <CardMedia component="img" height="400" image={item.photoUrl} alt={item.title} />}
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h4" component="h1">{item.title}</Typography>
                            <Chip label={item.type.toUpperCase()} color={item.type === 'lost' ? 'error' : 'secondary'} />
                        </Box>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Posted by {item.postedBy.name} on {format(new Date(item.createdAt), 'PPP')}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body1" paragraph><strong>Description:</strong> {item.description}</Typography>
                        <Typography variant="body1" paragraph><strong>Category:</strong> {item.category}</Typography>
                        <Typography variant="body1" paragraph><strong>Location:</strong> {item.location}</Typography>
                        <Typography variant="body1" paragraph><strong>Date {item.type}:</strong> {format(new Date(item.date), 'PPP')}</Typography>
                        {item.tags && item.tags.length > 0 && <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}><strong>Tags:</strong> {item.tags.map(t => <Chip key={t} label={t}/>)}</Box>}
                         <Box sx={{ mt: 4 }}>
                            {item.status === 'returned' ? (
                                <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} fullWidth disabled>Item Returned</Button>
                            ) : isClaimable ? (
                                <Button variant="contained" fullWidth startIcon={<PanToolIcon />} onClick={() => setOpenClaimDialog(true)}>Claim This Item</Button>
                            ) : item.status === 'claimed' && !isOwner ? (
                                <Button variant="contained" fullWidth disabled>Item Claimed</Button>
                            ) : null }
                         </Box>
                    </CardContent>
                </Card>
            </Grid>
            
            {/* Claims Column (for owner) */}
            {isOwner && (
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Manage Claims</Typography>
                            {item.status === 'claimed' && <Button onClick={handleMarkAsReturned} variant="contained" color="success" fullWidth sx={{mb: 2}}>Mark as Returned</Button>}
                            {claims.length > 0 ? (
                                <List>
                                    {claims.map((claim, index) => (
                                        <Box key={claim._id}>
                                            <ListItem alignItems="flex-start">
                                                <ListItemAvatar><Avatar>{claim.claimantId.name.charAt(0)}</Avatar></ListItemAvatar>
                                                <ListItemText
                                                    primary={claim.claimantId.name}
                                                    secondary={<>
                                                        <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.primary">
    Answer: {claim.claimantAnswer ? claim.claimantAnswer : 'No answer provided'}
</Typography>
                                                        <Chip label={claim.status} size="small" color={claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'error' : 'default'} sx={{mt:1}}/>
                                                    </>}
                                                />
                                            </ListItem>
                                            {claim.status === 'pending' && item.status === 'active' && (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pr: 2 }}>
                                                    <IconButton color="success" onClick={() => handleClaimStatusUpdate(claim._id, 'approved')}><ThumbUpIcon /></IconButton>
                                                    <IconButton color="error" onClick={() => handleClaimStatusUpdate(claim._id, 'rejected')}><ThumbDownIcon /></IconButton>
                                                </Box>
                                            )}
                                            {index < claims.length - 1 && <Divider variant="inset" component="li" />}
                                        </Box>
                                    ))}
                                </List>
                            ) : <Typography color="text.secondary">No claims yet.</Typography>}
                        </CardContent>
                    </Card>
                </Grid>
            )}

    

            {/* Claim Dialog */}
            <Dialog open={openClaimDialog} onClose={() => setOpenClaimDialog(false)}>
                <DialogTitle>Submit Your Claim</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                       <strong>Verification Question:</strong> <em>{item.claimQuestion || 'The poster did not set a specific question. Please describe the item in detail to prove ownership.'}</em>
                    </DialogContentText>
                    <TextField autoFocus margin="dense" id="claimAnswer" label="Your Answer" type="text" fullWidth variant="standard" multiline rows={3} value={claimAnswer} onChange={(e) => setClaimAnswer(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenClaimDialog(false)}>Cancel</Button>
                    <Button onClick={handleClaimSubmit}>Submit Claim</Button>
                </DialogActions>
            </Dialog>



        
        </Grid>

         <Button variant="contained" color="error" onClick={() => setOpenReportDialog(true)}>
        Report Abuse
      </Button>

      {/* Report Dialog */}
      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)}>
        <DialogTitle>Report Abuse</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for reporting this item. Be specific about the issue.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReportSubmit} color="primary">
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

        </>

        
    );
};

export default ItemDetail;