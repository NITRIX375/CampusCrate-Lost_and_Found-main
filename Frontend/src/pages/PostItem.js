// src/pages/PostItem.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, Typography, TextField, Button, Grid, MenuItem, Select, FormControl, InputLabel, Box, CircularProgress, FormHelperText } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const PostItem = ({ userInfo }) => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', location: '', date: '', claimQuestion: '', tags: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const categories = ["ID Card", "Electronics", "Bottle", "Book", "Clothing", "Other"];
  
  useEffect(() => {
    if (!userInfo) {
      toast.error("You must be logged in to post an item.");
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Form validation
    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      setErrors({ ...errors, form: 'All fields are required.' });
      setLoading(false);
      return;
    }
    //console.log("Helloww Baabu2!!");
    const postData = new FormData();
    postData.append('type', type);
    Object.keys(formData).forEach(key => postData.append(key, formData[key]));
    if (photo) postData.append('photo', photo);

    try {
      //console.log("Helloww Baabu!!");
      await axios.post('http://localhost:8080/api/items', postData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      toast.success(`Your ${type} item report has been submitted for approval!`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post item.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', padding: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Card>
        <CardHeader
          title={<Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>Report a {type} Item</Typography>}
          subheader={<Typography variant="body1" color="text.secondary" align="center">Fill in the details below. The more specific, the better.</Typography>}
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            {errors.form && (
              <Typography variant="body2" color="error" align="center" gutterBottom>
                {errors.form}
              </Typography>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Title"
                  placeholder="e.g., Lost Blue Water Bottle"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  placeholder="Describe the item..."
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Choose a category for your item</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="location"
                  label="Last Seen/Found Location"
                  placeholder="e.g., Library, 2nd Floor"
                  fullWidth
                  required
                  value={formData.location}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="date"
                  label={`Date ${type}`}
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.date}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {type === 'found' && (
                <Grid item xs={12}>
                  <TextField
                    name="claimQuestion"
                    label="Verification Question (Optional)"
                    helperText="A question only the true owner can answer."
                    fullWidth
                    value={formData.claimQuestion}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  name="tags"
                  label="Tags (comma-separated)"
                  placeholder="e.g., nike, hydroflask, black"
                  fullWidth
                  value={formData.tags}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="outlined" component="label" startIcon={<AddPhotoAlternateIcon />}>
                  Upload Photo
                  <input type="file" hidden onChange={(e) => setPhoto(e.target.files[0])} />
                </Button>
                {photo && <Typography sx={{ mt: 1 }}>{photo.name}</Typography>}
              </Grid>

              <Grid item xs={12}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  loading={loading}
                  sx={{ mt: 2 }}
                >
                  Submit Post
                </LoadingButton>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PostItem;
