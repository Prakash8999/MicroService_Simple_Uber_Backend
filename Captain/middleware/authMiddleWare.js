import jwt from 'jsonwebtoken';
import User from '../Model/CaptainModel.js';

export const userAuth = async (req, res, next) => {
    try {
        // Retrieve token from cookies or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        console.log("Token: ", token);

        // Check if token is present
        if (!token) {
            return res.status(401).json({ message: "You are not authenticated" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID from the decoded token
		console.log("decodedw ", decoded)
        const user = await User.findById(decoded.capId);
        if (!user) {
            return res.status(404).json({ message: "User  not found" });
        }

        // Attach user to the request object
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Authentication error: ", error);

        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired" });
        }

        // General server error
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};