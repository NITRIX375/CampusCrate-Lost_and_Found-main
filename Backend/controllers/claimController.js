// backend/controllers/claimController.js
const Claim = require('../models/Claim');
const Item = require('../models/Item');


const createClaim = async (req, res) => {
    try {
        const { itemId, claimAnswer, message } = req.body;
        const claimantId = req.user._id;

        // Log received data
        // console.log("Received data:");
        // console.log("Item ID:", itemId);
        // console.log("Claim Answer:", claimAnswer);
        // console.log("Message:", message);
        // console.log("Claimant ID:", claimantId);

        const item = await Item.findById(itemId);

        if (!item) {
            console.log('Item not found with ID:', itemId);
            return res.status(404).json({ message: 'Item not found.' });
        }

        // console.log("Found Item:", item);

        // Prevent user from claiming their own item
        if (item.postedBy.toString() === claimantId.toString()) {
            //console.log("User cannot claim their own item");
            return res.status(400).json({ message: "You cannot claim an item you posted." });
        }

        // Check if a claim already exists for this item and claimant
        const existingClaim = await Claim.findOne({ itemId, claimantId });
        if (existingClaim) {
            console.log("Claim already exists for this item by this user");
            return res.status(400).json({ message: 'You have already submitted a claim for this item.' });
        }

        // Proceed to create a new claim
        console.log("Creating a new claim...");
        const newClaim = new Claim({
            itemId,
            claimantId,
            claimantAnswer:claimAnswer,
            message
        });

        await newClaim.save();  // Save the claim to the database

       // console.log("Claim saved successfully:", newClaim);
        res.status(201).json({ message: 'Claim submitted successfully. The poster will be notified.' });

    } catch (error) {
        console.error('Error creating claim:', error);
        res.status(500).json({ message: 'Server error while creating claim', error: error.message });
    }
};


const getItemClaims = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        // Ensure the current user is the one who posted the item
        if (item.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view claims for this item.' });
        }

        const claims = await Claim.find({ itemId }).populate('claimantId', 'name email');
        res.json(claims);

    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching claims', error: error.message });
    }
};


const updateClaimStatus = async (req, res) => {
    try {
       
        const { claimId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        console.log(claimId);
        console.log(status);

        const claim = await Claim.findById(claimId).populate('itemId');
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found.' });
        }

        // Ensure current user is the item poster
        if (claim.itemId.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this claim.' });
        }
        
        // If approving, reject all other pending claims for this item
        if (status === 'approved') {
            await Claim.updateMany(
                { itemId: claim.itemId, status: 'pending' },
                { status: 'rejected' }
            );
            claim.status = 'approved';
            await claim.save();

            // Mark the item as 'claimed'
            await Item.findByIdAndUpdate(claim.itemId._id, { status: 'claimed' });
        } else {
            claim.status = status; // 'rejected'
            await claim.save();
        }

        res.json({ message: `Claim has been ${status}.`, claim });
    } catch (error) {
        console.log("error!!",error);
        res.status(500).json({ message: 'Server error updating claim status', error: error.message });
    }
};

// backend/controllers/claimController.js
const getMyClaims = async (req, res) => {
  try {
    console.log("entry baave!!");
    const claimantId = req.user._id;  // Get the logged-in user's ID from the JWT token
    const claims = await Claim.find({ claimantId }).populate('itemId', 'title description');  // Fetch claims for the logged-in user and populate the item details
    console.log(claims);
    if (!claims.length) {
      return res.status(404).json({ message: 'No claims found for this user.' });
    }

    res.json(claims);  // Return the claims
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claims', error: error.message });
  }
};

// backend/controllers/claimController.js
const deleteClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const claimantId = req.user._id;  // Get the logged-in user's ID

    // Find and delete the claim
    const claim = await Claim.findOneAndDelete({ _id: claimId, claimantId });

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or you do not have permission to delete this claim.' });
    }

    res.status(200).json({ message: 'Claim deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting claim', error: error.message });
  }
};


// backend/controllers/claimController.js
const editClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { claimantAnswer, message } = req.body;
    const claimantId = req.user._id;

    // Find the claim and update it
    const claim = await Claim.findOneAndUpdate(
      { _id: claimId, claimantId },
      { claimantAnswer, message,status:"pending" },
      
      { new: true }  // Return the updated claim
    );

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found or you do not have permission to edit this claim.' });
    }

    res.status(200).json({ message: 'Claim updated successfully', claim });
  } catch (error) {
    res.status(500).json({ message: 'Error updating claim', error: error.message });
  }
};




module.exports = { createClaim, getItemClaims, updateClaimStatus,getMyClaims ,deleteClaim,editClaim};