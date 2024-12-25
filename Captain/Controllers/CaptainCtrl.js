import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Captain from "../Model/CaptainModel.js";
import { subscribeToQueue } from "../Service/rabbit.js";

export const createUser = async (req, res) => {
	const { capname, capemail,  password , isAvailable} = req.body;
  
	// Validation
	if (!capname || !capemail ||  !password) {
	  return res.status(400).json({ message: 'All fields are required' });
	}

  
	try {
		const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

	  const newCap = new Captain({ capname, capemail,isAvailable:isAvailable, password:hashedPassword });
	  await newCap.save();
  
	  // Generate JWT
	  const token = jwt.sign({ capId: newCap._id }, process.env.JWT_SECRET, {
		expiresIn: '1h',
	  });
  
	  // Set cookie
	  res.cookie('token', token, {
		httpOnly: true,
		// secure: process.env.NODE_ENV === 'production',
		maxAge: 3600000, // 1 hour
	  });
  
	  return res.status(201).json({ token:token, newCap , message: 'Captain created successfully' });
	} catch (error) {
	  if (error.code === 11000) {
		return res.status(400).json({ message: 'Email already exists' });
	  }
	  return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
  };
  
  /**
   * Login user
   */
  export const login = async (req, res) => {
	const { capemail, password } = req.body;
  
	// Validation
	if (!capemail || !password) {
	  return res.status(400).json({ message: 'Email and password are required' });
	}
  
	try {
	  const captain = await Captain.findOne({ capemail });
	  if (!captain) {
		return res.status(401).json({ message: 'Invalid email or password' });
	  }
  
	  const isPasswordValid = await bcrypt.compare(password, captain.password);
	  if (!isPasswordValid) {
		return res.status(401).json({ message: 'Invalid email or password' });
	  }
	  delete captain.password
  
	  // Generate JWT
	  const token = jwt.sign({ capId: captain._id }, process.env.JWT_SECRET, {
		expiresIn: '1h',
	  });
  
	  // Set cookie
	  res.cookie('token', token, {
		httpOnly: true,
		// secure: process.env.NODE_ENV === 'production',
		maxAge: 3600000, // 1 hour
	  });
	  return res.status(200).json({ message: 'Login successful', token:token, captain });
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
	  const captain = await Captain.findById(userId).select('-password'); // Exclude password
	  if (!captain) {
		return res.status(404).json({ message: 'User not found' });
	  }
  
	  return res.status(200).json(captain);
	} catch (error) {
	  return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
	}
  };
  

  export const updateAvailability = async(req,res) =>{
	try {
		const capId = req.user._id
		const findCaptain = await Captain.findById(capId).lean()

		const captain =await Captain.updateOne(
            { _id: capId }, // Filter: find the captain by ID
            { $set: { isAvailable: !findCaptain.isAvailable } } // Update: toggle availability
        );
		return res.status(200).json({message: 'Availability updated successfully', captain})
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error', error: error.message });
	}
  }

const 	pendingRequest = []

export const WaitForNewRide = async(req,res) =>{
	try {
		req.setTimeout(30000,() => {
			res.status(204).end()
		});
		pendingRequest.push(res)
	} catch (error) {
		console.log(error)
	}
}

  subscribeToQueue("new-ride",(data)=>{
	console.log("subscribed to new-ride queue",JSON.parse(data))
	const rideData = JSON.parse(data)
	pendingRequest.forEach(res =>{
		res.json(rideData)
	})

	pendingRequest.length=0
  })
