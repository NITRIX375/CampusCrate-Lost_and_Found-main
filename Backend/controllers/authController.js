
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};


const googleAuth = async (req, res) => {
  const { name, email, googleId } = req.body;
  console.log(req);
  try {
    let user = await User.findOne({ email });

    if (user) {
        if(user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked by an administrator.' });
        }
     
        generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        // If user does not exist, create a new one
        const newUser = await User.create({
            name,
            email,
            googleId,
        });
        generateToken(res, newUser._id);
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid user data', error: error.message });
  }
};



const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};



const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if(user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked.' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


module.exports = { googleAuth, logoutUser, getUserProfile };