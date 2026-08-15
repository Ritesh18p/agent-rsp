const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.log("-> AUTH FAILED: No Authorization header sent by frontend");
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            console.log("-> AUTH FAILED: Header was sent, but token was empty");
            return res.status(401).json({ message: "Token missing" });
        }

        const decoded = jwt.verify(token, "mysecretkey");

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            console.log("-> AUTH FAILED: Token is valid, but User ID not found in MongoDB!");
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("-> AUTH FAILED IN CATCH:", error.message);
        return res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = {
    protect
};