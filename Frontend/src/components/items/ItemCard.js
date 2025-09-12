// src/components/items/ItemCard.js
import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const ItemCard = ({ item }) => {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea component={Link} to={`/item/${item._id}`} sx={{ flexGrow: 1 }}>
                {item.photoUrl && (
                    <CardMedia
                        component="img"
                        height="160"
                        image={item.photoUrl}
                        alt={item.title}
                    />
                )}
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {item.title}
                        </Typography>
                        <Chip label={item.type} size="small" color={item.type === 'lost' ? 'error' : 'secondary'} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '40px' // approx 2 lines
                    }}>
                        {item.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <Box sx={{ p: 2, pt: 0 }}>
                 <Typography variant="caption" color="text.secondary">
                    Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Typography>
            </Box>
        </Card>
    );
};

export default ItemCard;