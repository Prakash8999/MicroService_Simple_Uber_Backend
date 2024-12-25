import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Name is required
  },
  email: {
    type: String,
    required: true, // Email is required
    unique: true, // Email must be unique
    match: /.+\@.+\..+/, // Simple regex for email validation
  },
  username: {
    type: String,
    required: true, // Username is required
    unique: true, // Username must be unique
    minlength: 3, // Minimum length for username
    maxlength: 30, // Maximum length for username
  },
  password: { 
    type: String,
    required: true, // Password is required
    minlength: 8, // Minimum length for password
    
  }
});

// Create the user model
const User = mongoose.model('User ', userSchema);

// Export the user model
export default User;
