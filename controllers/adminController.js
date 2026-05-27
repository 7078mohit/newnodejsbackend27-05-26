import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';


// ===============================
// JWT TOKEN GENERATOR
// ===============================
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
};

// ===============================
// REGISTER ADMIN
// ===============================
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, number, password } = req.body;
    // console.log(name, email, number, password, req.file)
    if (!name || !email || !number || !password || !req.file) {
      return res.status(400).json({
        message: 'All fields including profile image are required',
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        message: 'Admin already exists with this email',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email: email.toLowerCase(),
      number,
      password: hashedPassword,
      profile: req.file.path,
    });

    return res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        number: newAdmin.number,
        profile: newAdmin.profile,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Register failed',
      error: error.message,
    });
  }
};


// ===============================
// LOGIN ADMIN
// ===============================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password required',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(admin._id);

    const { password: _, ...adminData } = admin.toObject();

    return res.status(200).json({
      message: 'Login successful',
      token,
      admin: adminData,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Login failed',
      error: error.message,
    });
  }
};




