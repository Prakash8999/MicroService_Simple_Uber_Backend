import User from "../Model/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import EventEmmitter from 'events'
import { subscribeToQueue } from "../Service/rabbit.js";
const rideEventEmmitter = new EventEmmitter()
export const createUser = async (req, res) => {
	const { name, email, username, password } = req.body;

	// Validation
	if (!name || !email || !username || !password) {
		return res.status(400).json({ message: 'All fields are required' });
	}


	try {
		const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

		const newUser = new User({ name, email, username, password: hashedPassword });
		await newUser.save();

		// Generate JWT
		const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});

		// Set cookie
		res.cookie('token', token, {
			httpOnly: true,
			// secure: process.env.NODE_ENV === 'production',
			maxAge: 3600000, // 1 hour
		});

		return res.status(201).json({ token: token, newUser, message: 'User created successfully' });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ message: 'Email or username already exists' });
		}
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
};

/**
 * Login user
 */
export const login = async (req, res) => {
	const { email, password } = req.body;

	// Validation
	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required' });
	}

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}
		delete user.password

		// Generate JWT
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});

		// Set cookie
		res.cookie('token', token, {
			httpOnly: true,
			// secure: process.env.NODE_ENV === 'production',
			maxAge: 3600000, // 1 hour
		});
		return res.status(200).json({ message: 'Login successful', token: token, user });
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
};

/**
 * Get user details
 */
export const getUser = async (req, res) => {

	try {
		const userId = req.user._id
		const user = await User.findById(userId).select('-password'); // Exclude password
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json(user);
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
	}
};


export const acceptedRide = async (req, res) => {
	rideEventEmmitter.once('ride-accepted', (data) => {
		res.send(data)
	})

	setTimeout(() => {
		res.status(204).send()
	}, 30000);
}


subscribeToQueue('ride-accepted',async(msg)=>{
	const data =JSON.parse(msg)

	rideEventEmmitter.emit('ride-accepted',data)

})