import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  capname: {
    type: String,
    required: true, // Name is required
  },
  capemail: {
    type: String,
    required: true, // Email is required
    unique: true, // Email must be unique
    match: /.+\@.+\..+/, // Simple regex for email validation
  },
  
  password: { 
    type: String,
    required: true, // Password is required
    minlength: 8, // Minimum length for password
    
  },
  isAvailable:{
    type:Boolean,
    default:true
  }
});

// Create the user model
const Captain = mongoose.model('Captain ', userSchema);

// Export the user model
export default Captain;
