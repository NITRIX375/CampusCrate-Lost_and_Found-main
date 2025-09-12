
const Item = require('../models/Item');
const User = require('../models/User');
const AbuseReport = require('../models/AbuseReport');


const getAllItemsForAdmin = async (req, res) => {
    try {
        const items = await Item.find({}).populate('postedBy', 'name email').sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const approveItem = async (req, res) => {
    try {

      
        const item = await Item.findByIdAndUpdate(
            req.params.id, 
            { 
                isApproved: true, 
               
            }, 
            { new: true } 
        );

        if (!item) {
            
            console.log('Item not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Item not found' });
        }

       
        console.log('Item approved successfully:', item);
        res.json({ message: 'Item approved successfully', item });

    } catch (error) {
      
        console.error('Error approving item:', error.message);
        res.status(500).json({ message: 'Server error while approving item', error: error.message });
    }
};


const deleteItem = async (req, res) => {
    try {
        console.log('Deleting item with ID:', req.params.id);
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAbuseReports = async (req, res) => {
    try {
        const reports = await AbuseReport.find().populate('reportedBy', 'name email').populate('itemId', 'title');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const report = await AbuseReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.status = status;
        await report.save();
        res.json({ message: `Report marked as ${status}.`, report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getAllItemsForAdmin, approveItem, deleteItem, getAllUsers, toggleBlockUser,getAbuseReports,updateReportStatus };