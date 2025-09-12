// backend/controllers/itemController.js
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const AbuseReport = require('../models/AbuseReport');
const { unsubscribe } = require('../routes/claimRoutes');


const createItem = async (req, res) => {
  try {
    const { type, title, description, category, location, date, claimQuestion, tags } = req.body;
    
    // Admin posts are auto-approved, student posts are pending
    const isApproved = req.user.role === 'admin';

    const item = new Item({
      type,
      title,
      description,
      category,
      location,
      date,
      claimQuestion,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      photoUrl: req.file ? req.file.path : null, // From Cloudinary upload
      postedBy: req.user._id,
      isApproved,
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create item', error: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    // Extract query parameters from the request
    const { type, category, search } = req.query;

    // Initialize the base query
    const query = { isApproved: true, status: 'active' };

    // Apply additional filters based on query parameters (optional)
    if (type) query.type = type;  // Filter by type (found or lost)
    if (category) {
  // Capitalize first letter
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  query.category = formattedCategory; // Filter by formatted category
}

 if (search) {
  query.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } }
  ];
}
     // Filter by search term using text index

     

    // Log the final query for debugging
    //console.log("Final query:", query);

    // Fetch items from the database that match the query
    const items = await Item.find(query)
      .populate('postedBy', 'name email')  // Optional: Populate postedBy field (user info)
      .sort({ createdAt: -1 });  // Sort by creation date in descending order (latest first)

    res.json(items);
  } catch (error) {
    // Handle errors (e.g., database issues)
    res.status(500).json({ message: 'Failed to fetch items', error: error.message });
  }
};


const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name');
    if (item && item.isApproved) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found or not approved' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const markAsReturned = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    const { claimId } = req.body;

    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }

    // Only the person who posted the item can mark it as returned
    if (item.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to update this item' });
    }
    
    // Find the approved claim and update its status
    const claim = await Claim.findById(claimId);
    if(!claim || claim.status !== 'approved' || claim.itemId.toString() !== item._id.toString()){
        return res.status(400).json({ message: 'Valid approved claim not found.' });
    }

    item.status = 'returned';
    await item.save();
    
    res.json({ message: 'Item marked as returned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item status', error: error.message });
  }
};

const getMyListedItems = async (req, res) => {
  try {
    const userId = req.user._id;  // Extract user ID from authenticated user
    
    const items = await Item.find({ postedBy: userId }).sort({ createdAt: -1 });  // Fetch items posted by the user
   
    if (!items.length) {
      return res.status(404).json({ message: 'No items found for this user.' });
    }

    res.json(items);  // Send the items as a response
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching listed items', error: error.message });
  }
};

const reportAbuse = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    console.log(id,description);

    try {
      
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
       
        // Create a new abuse report
        const report = new AbuseReport({
            itemId: id,
            reportedBy: req.user._id, // Assuming the user is authenticated
            description,
        });

        await report.save();
         
        res.status(201).json({ message: 'Abuse report submitted successfully.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// At the end of the file, make sure to export the new function
module.exports = {
  createItem,
  getItems,
  getItemById,
  markAsReturned,
  getMyListedItems,
  reportAbuse

};