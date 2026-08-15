const User = require("../Models/User");
const Note = require("../Models/Note");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
    
    try {

        const { name, email, password } = req.body;

       
        // NEW CODE START
        const existingUser = await User.findOne({ email });

        

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        // NEW CODE END

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User Registered Successfully",
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
    return res.status(404).json({
        message: "User not found"
    });
     }      
     
     const isMatch = await bcrypt.compare(password, user.password);

     if (!isMatch) {
    return res.status(401).json({
        message: "Invalid Password"
    });
}

      const token = jwt.sign(
            { id: user._id },
            "mysecretkey",
            { expiresIn: "1d" }
        );

   return res.status(200).json({
    message: "Login Successful",
    token,
    user
}); 
    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// NEW: Delete Account Controller
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id; // Comes from the protect middleware

        // Delete all notes created by this user
        await Note.deleteMany({ user: userId });

        // Delete the user from MongoDB
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: " Your account and associated notes deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    deleteAccount
};